// End-to-end API test that also seeds the demo database with realistic data.
// Every check is recorded as a test case (used for the test-case table in Chapter Five).
const fs = require("fs");
const path = require("path");
// Usage (from ubutaka-admin/, with the API running against a DEMO database):
//   DEMO_DATABASE_URL=postgresql://... API_URL=http://localhost:3100/api ALLOW_DEMO_RESET=yes node scripts/e2e-test.cjs
// WARNING: this script DELETES all rows before seeding. It refuses to run unless ALLOW_DEMO_RESET=yes.
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

if (process.env.ALLOW_DEMO_RESET !== "yes" || !process.env.DEMO_DATABASE_URL) {
  console.error("Refusing to run: set DEMO_DATABASE_URL to a throw-away demo database and ALLOW_DEMO_RESET=yes.");
  process.exit(1);
}
const BASE = process.env.API_URL || "http://localhost:3100/api";
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DEMO_DATABASE_URL } } });
const cases = [];
let n = 0;

async function api(method, route, body, token) {
  const res = await fetch(BASE + route, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  return { status: res.status, data };
}
function check(module, description, expected, ok, actual) {
  const id = `TC${String(++n).padStart(2, "0")}`;
  cases.push({ id, module, description, expected, actual, result: ok ? "Pass" : "Fail" });
  console.log(`${ok ? "PASS" : "FAIL"} ${id} [${module}] ${description} -> ${actual}`);
  if (!ok) process.exitCode = 1;
}
const square = (lat, lng, sideM) => {
  const dLat = sideM / 2 / 111320, dLng = sideM / 2 / (111320 * Math.cos((lat * Math.PI) / 180));
  return { type: "Polygon", coordinates: [[[lng - dLng, lat + dLat], [lng + dLng, lat + dLat], [lng + dLng, lat - dLat], [lng - dLng, lat - dLat], [lng - dLng, lat + dLat]]] };
};
const IMG = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
  "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
  "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800",
];

(async () => {
  // ---------------- reset demo data
  for (const t of ["transaction", "dispute", "anomalyReport", "landDocument", "parcel", "user"]) await prisma[t].deleteMany({});

  // The first administrator is created directly in the database (administrators cannot self-register).
  await prisma.user.create({ data: { name: "NLA Administrator", email: "admin@ubutaka.gov.rw", password: await bcrypt.hash("Admin@2026", 10), nationalId: "1198080045612378", role: "ADMIN", isVerified: true, district: "Gasabo" } });

  // ---------------- authentication
  let r = await api("POST", "/auth/register", { name: "Test Person", email: "bad@example.rw", password: "secret123", nationalId: "12345" });
  check("Authentication", "Register with an invalid national ID", "Rejected (400)", r.status === 400, `${r.status}: ${r.data?.error}`);

  const people = [
    { key: "diane", name: "Uwase Diane", email: "diane.uwase@example.rw", nationalId: "1199070012345011", role: "USER", district: "Gasabo", sector: "Remera", cell: "Rukiri I", village: "Amahoro" },
    { key: "jean", name: "Habimana Jean Claude", email: "jc.habimana@example.rw", nationalId: "1198580023456022", role: "USER", district: "Gasabo", sector: "Kimironko", cell: "Bibare", village: "Kibagabaga" },
    { key: "alice", name: "Mukamana Alice", email: "alice.mukamana@example.rw", nationalId: "1197670034567033", role: "USER", district: "Kicukiro", sector: "Gahanga", cell: "Gahanga", village: "Kigarama" },
    { key: "eric", name: "Niyonzima Eric", email: "eric.niyonzima@example.rw", nationalId: "1199280045678044", role: "USER", district: "Nyarugenge", sector: "Nyarugenge", cell: "Kiyovu", village: "Muhima" },
    { key: "grace", name: "Ingabire Grace", email: "grace.ingabire@example.rw", nationalId: "1200170056789055", role: "USER", district: "Gasabo", sector: "Kacyiru", cell: "Kamatamu", village: "Kacyiru" },
    { key: "notary", name: "Uwimana Claudine", email: "notary.uwimana@example.rw", nationalId: "1198270067890066", role: "NOTARY", district: "Gasabo", sector: "Remera" },
    { key: "abunzi", name: "Nsengimana Joseph", email: "abunzi.nsengimana@example.rw", nationalId: "1196880078901077", role: "ABUNZI", district: "Gasabo", sector: "Remera", cell: "Rukiri I", village: "Amahoro" },
    { key: "abunzi2", name: "Mukeshimana Vestine", email: "abunzi.mukeshimana@example.rw", nationalId: "1197570089012088", role: "ABUNZI", district: "Kicukiro", sector: "Gahanga", cell: "Gahanga", village: "Kigarama" },
  ];
  const U = {};
  for (const p of people) {
    r = await api("POST", "/auth/register", { ...p, password: "Ubutaka@2026" });
    U[p.key] = { ...p, id: r.data?.user?.id, token: r.data?.token };
  }
  check("Authentication", "Register citizens, a notary and Abunzi mediators with valid national IDs", "Accounts created (201)", Object.values(U).every((u) => u.id), `${Object.values(U).filter((u) => u.id).length}/${people.length} created`);

  r = await api("POST", "/auth/register", { name: "Copy", email: "diane.uwase@example.rw", password: "Ubutaka@2026", nationalId: "1199070012345011" });
  check("Authentication", "Register a duplicate email / national ID", "Rejected (400)", r.status === 400, `${r.status}: ${r.data?.error}`);

  r = await api("POST", "/auth/register", { name: "Intruder", email: "x@example.rw", password: "Ubutaka@2026", nationalId: "1199080011112222", role: "ADMIN" });
  check("Authorisation", "Self-register with the ADMIN role", "Account created as USER only", r.data?.user?.role === "USER", `role = ${r.data?.user?.role}`);
  if (r.data?.user?.id) await prisma.user.delete({ where: { id: r.data.user.id } });

  r = await api("POST", "/auth/login", { email: "diane.uwase@example.rw", password: "wrong-pass" });
  check("Authentication", "Login with a wrong password", "Rejected (401)", r.status === 401, `${r.status}: ${r.data?.error}`);
  r = await api("POST", "/auth/login", { email: "diane.uwase@example.rw", password: "Ubutaka@2026" });
  check("Authentication", "Login with correct credentials", "JWT token returned (200)", r.status === 200 && !!r.data?.token, `${r.status}, token ${r.data?.token ? "issued" : "missing"}`);
  const dbUser = await prisma.user.findUnique({ where: { email: "diane.uwase@example.rw" } });
  check("Security", "Password stored in the database", "bcrypt hash, never plain text", dbUser.password.startsWith("$2"), dbUser.password.slice(0, 7) + "...");

  r = await api("POST", "/auth/login", { biometricToken: U.diane.token });
  check("Authentication", "Biometric login with the securely stored session token", "New session issued (200)", r.status === 200 && !!r.data?.token, `${r.status}`);

  const ADMIN = (await api("POST", "/auth/login", { email: "admin@ubutaka.gov.rw", password: "Admin@2026" })).data.token;

  r = await api("GET", "/parcels");
  check("Authorisation", "Call the parcels API without a token", "Rejected (401)", r.status === 401, `${r.status}: ${r.data?.error}`);
  r = await api("GET", "/users", null, ADMIN);
  check("Security", "List users through the API", "No password hashes in the response", r.status === 200 && r.data.every((u) => u.password === undefined), `${r.data.length} users, password field ${r.data.some((u) => u.password) ? "present" : "absent"}`);

  // Profile completion (sets village; verifies the account) for everyone
  for (const u of Object.values(U)) {
    await api("PATCH", `/users/${u.id}`, { district: u.district, sector: u.sector, cell: u.cell, village: u.village, profileCompleted: true, biometricRegistered: true, digitalSignature: `sig:${u.name}` }, u.token);
  }
  const abunzi = await prisma.user.findUnique({ where: { id: U.abunzi.id } });
  check("Profile", "Complete profile with village, ID photo, signature and biometrics", "Village saved and account verified", abunzi.village === "Amahoro" && abunzi.isVerified, `village=${abunzi.village}, verified=${abunzi.isVerified}`);
  r = await api("PATCH", `/users/${U.jean.id}`, { name: "Hacked" }, U.diane.token);
  check("Authorisation", "Edit another user's profile", "Rejected (403)", r.status === 403, `${r.status}`);

  // ---------------- parcels
  const parcels = [
    { owner: "diane", upi: "1/02/03/01/1245", size: "600 sqm", use: "Residential (R1)", district: "Gasabo", sector: "Remera", cell: "Rukiri I", village: "Amahoro", lat: -1.9546, lng: 30.1123, side: 25, partners: [{ name: "Habimana Paul", nationalId: "1198980011223344", relation: "Spouse" }], children: [{ name: "Ishimwe Kevin", age: 12 }, { name: "Uwineza Belise", age: 8 }] },
    { owner: "diane", upi: "1/02/03/02/3380", size: "1200 sqm", use: "Agricultural", district: "Gasabo", sector: "Remera", cell: "Rukiri II", village: "Isangano", lat: -1.9588, lng: 30.1172, side: 35, partners: [], children: [{ name: "Ishimwe Kevin", age: 12 }] },
    { owner: "jean", upi: "1/02/05/01/0876", size: "450 sqm", use: "Residential (R2)", district: "Gasabo", sector: "Kimironko", cell: "Bibare", village: "Kibagabaga", lat: -1.9447, lng: 30.1261, side: 21, partners: [{ name: "Mukarugwiza Jeanne", nationalId: "1198870022334455", relation: "Spouse" }], children: [] },
    { owner: "jean", upi: "1/02/05/03/2210", size: "800 sqm", use: "Commercial", district: "Gasabo", sector: "Kimironko", cell: "Kinyana", village: "Kimironko", lat: -1.9493, lng: 30.1318, side: 28, partners: [], children: [] },
    { owner: "alice", upi: "1/03/02/01/4417", size: "2500 sqm", use: "Agricultural", district: "Kicukiro", sector: "Gahanga", cell: "Gahanga", village: "Kigarama", lat: -2.0236, lng: 30.0842, side: 50, partners: [], children: [{ name: "Irakoze Samuel", age: 17 }, { name: "Uwamahoro Clarisse", age: 15 }, { name: "Mugabo Yves", age: 10 }] },
    { owner: "eric", upi: "1/01/01/02/0519", size: "350 sqm", use: "Residential (R1)", district: "Nyarugenge", sector: "Nyarugenge", cell: "Kiyovu", village: "Muhima", lat: -1.9441, lng: 30.0619, side: 19, partners: [], children: [] },
    { owner: "grace", upi: "1/02/04/01/1733", size: "700 sqm", use: "Residential (R2)", district: "Gasabo", sector: "Kacyiru", cell: "Kamatamu", village: "Kacyiru", lat: -1.9367, lng: 30.0876, side: 26, partners: [], children: [] },
    { owner: "grace", upi: "1/02/04/02/2904", size: "950 sqm", use: "Commercial", district: "Gasabo", sector: "Kacyiru", cell: "Kacyiru", village: "Kimihurura", lat: -1.9401, lng: 30.0933, side: 31, partners: [], children: [] },
  ];
  for (const [i, p] of parcels.entries()) {
    const u = U[p.owner];
    r = await api("POST", "/parcels", {
      upi: p.upi, size: p.size, use: p.use, district: p.district, sector: p.sector, cell: p.cell, village: p.village,
      location: `${p.village}, ${p.cell}, ${p.sector}, Kigali City`, ownerName: u.name, imageUrl: IMG[i % IMG.length], userId: u.id,
      partners: JSON.stringify(p.partners), children: JSON.stringify(p.children), coordinates: square(p.lat, p.lng, p.side),
      documents: [{ name: "National ID Copy", status: "Uploaded", type: "ID" }, { name: "Tax Clearance", status: "Uploaded", type: "TAX" }],
    }, u.token);
    if (i === 0) check("Parcels", "Register a parcel by UPI with co-owners and heirs", "Created with status 'Pending Verification' (201)", r.status === 201 && r.data.status === "Pending Verification", `${r.status}, ${r.data?.status}`);
  }
  const raw = await prisma.parcel.findUnique({ where: { upi: parcels[0].upi } });
  check("Security", "Co-owner and heir data stored at rest", "AES-256-GCM ciphertext", raw.partners.startsWith("enc:v1:") && raw.children.startsWith("enc:v1:"), raw.partners.slice(0, 22) + "...");
  r = await api("GET", `/parcels/${encodeURIComponent(parcels[0].upi)}`, null, U.diane.token);
  check("Security", "Owner opens the parcel detail", "Co-owners and heirs decrypted for the owner", JSON.parse(r.data.children).length === 2, `${JSON.parse(r.data.children).length} heirs returned`);
  r = await api("POST", "/parcels", { upi: parcels[0].upi, size: "1", use: "x", district: "Gasabo" }, U.jean.token);
  check("Parcels", "Register an already registered UPI", "Rejected (409)", r.status === 409, `${r.status}: ${r.data?.error}`);
  r = await api("PATCH", `/parcels/${encodeURIComponent(parcels[0].upi)}`, { status: "Verified" }, U.diane.token);
  check("Authorisation", "Citizen tries to verify their own parcel", "Rejected (403)", r.status === 403, `${r.status}: ${r.data?.error}`);

  const certs = {};
  for (const p of parcels.slice(0, 7)) {
    r = await api("PATCH", `/parcels/${encodeURIComponent(p.upi)}`, { status: "Verified" }, ADMIN);
    certs[p.upi] = r.data;
  }
  check("Verification", "NLA administrator verifies a parcel", "Status Verified; certificate number issued", certs[parcels[0].upi].certificateId === `CERT-${new Date().getFullYear()}-0001`, `${certs[parcels[0].upi].status}, ${certs[parcels[0].upi].certificateId}`);

  const c0 = certs[parcels[0].upi];
  r = await api("GET", `/verify?upi=${encodeURIComponent(c0.upi)}&certId=${c0.certificateId}&hash=${c0.certificateHash}`);
  check("Verification", "Scan the QR code of a genuine certificate", "Certificate reported authentic", r.data.authentic === true, `authentic=${r.data.authentic}, owner=${r.data.parcel?.ownerName}`);
  r = await api("GET", `/verify?upi=${encodeURIComponent(c0.upi)}&certId=CERT-2026-9999&hash=${c0.certificateHash}`);
  check("Verification", "Scan a QR code with a forged certificate number", "Certificate reported not authentic", r.data.authentic === false, r.data.reasons?.[0]);

  // ---------------- transfer workflow: Jean's parcel 0876 sold to Grace; Diane's 3380 listed; Alice mid-way
  const T = parcels[2].upi;
  const oldCert = certs[T];
  await api("PATCH", `/parcels/${encodeURIComponent(T)}`, { status: "For Sale", price: "18500000 RWF" }, U.jean.token);
  r = await api("POST", "/transactions", { title: `Purchase of ${T}`, upi: T, status: "PENDING_SELLER_APPROVAL", step: "Buyer Offer", progress: 20, sellerName: U.jean.name, buyerName: U.grace.name, price: "18500000 RWF" }, U.grace.token);
  const tx = r.data;
  check("Transfer", "Buyer makes an offer on a parcel listed for sale", "Transaction created, PENDING_SELLER_APPROVAL, block 1", r.status === 201 && tx.status === "PENDING_SELLER_APPROVAL" && tx.blockNumber === 1, `${tx.status}, block ${tx.blockNumber}`);
  await api("PATCH", `/parcels/${encodeURIComponent(T)}`, { status: "Pending Sale" }, U.jean.token);
  r = await api("PATCH", `/transactions/${tx.id}`, { status: "PENDING_PAYMENT", step: "Seller Approved", progress: 40 }, U.jean.token);
  check("Transfer", "Seller approves the offer", "PENDING_PAYMENT (40%)", r.data.status === "PENDING_PAYMENT", r.data.status);
  r = await api("PATCH", `/transactions/${tx.id}`, { status: "COMPLETED", step: "x", progress: 100 }, U.grace.token);
  check("Transfer", "Skip steps (payment straight to completed)", "Rejected (409)", r.status === 409, `${r.status}: ${r.data?.error}`);
  r = await api("PATCH", `/transactions/${tx.id}`, { status: "PENDING_NOTARY", step: "Fees Paid", progress: 60 }, U.grace.token);
  check("Transfer", "Buyer pays the transfer fees", "PENDING_NOTARY (60%)", r.data.status === "PENDING_NOTARY", r.data.status);
  r = await api("PATCH", `/transactions/${tx.id}`, { status: "PENDING_SELLER", step: "Notary Certified", progress: 80 }, U.grace.token);
  check("Authorisation", "Buyer tries to perform the notary certification", "Rejected (403)", r.status === 403, `${r.status}: ${r.data?.error}`);
  r = await api("PATCH", `/transactions/${tx.id}`, { status: "PENDING_SELLER", step: "Notary Certified", progress: 80 }, U.notary.token);
  check("Transfer", "Notary certifies the transfer", "PENDING_SELLER (80%)", r.data.status === "PENDING_SELLER", r.data.status);
  r = await api("PATCH", `/transactions/${tx.id}`, { status: "COMPLETED", step: "Seller Signed", progress: 100 }, U.jean.token);
  const history = [{ owner: U.jean.name, from: "2019-03-14", to: new Date().toISOString().slice(0, 10), txHash: tx.txHash }];
  const done = await api("PATCH", `/parcels/${encodeURIComponent(T)}`, { status: "Verified", ownerName: U.grace.name, userId: U.grace.id, price: null, ownerHistory: history }, U.jean.token);
  check("Transfer", "Seller signs; ownership passes to the buyer", "COMPLETED; owner updated; history appended", r.data.status === "COMPLETED" && done.data.ownerName === U.grace.name, `${r.data.status}, owner=${done.data.ownerName}`);
  r = await api("GET", `/verify?upi=${encodeURIComponent(T)}&certId=${oldCert.certificateId}&hash=${oldCert.certificateHash}`);
  check("Verification", "Scan the seller's old certificate after the sale", "Reported outdated (ownership changed)", r.data.authentic === false, r.data.reasons?.[0]);

  // a second record on the same parcel extends the chain
  r = await api("POST", "/transactions", { title: `Mortgage registration ${T}`, upi: T, type: "MORTGAGE", status: "PENDING_NOTARY", step: "Submitted", progress: 60, sellerName: U.grace.name, buyerName: "Bank of Kigali", price: "9000000 RWF" }, U.grace.token);
  check("Ledger", "Second record on the same parcel", "Linked to the previous hash, block 2", r.data.previousHash === tx.txHash && r.data.blockNumber === 2, `block ${r.data.blockNumber}, previousHash ${r.data.previousHash === tx.txHash ? "matches" : "differs"}`);
  r = await api("GET", `/verify?upi=${encodeURIComponent(T)}`);
  check("Ledger", "Integrity check of an untouched parcel history", "Chain valid", r.data.ledger.valid === true, `valid=${r.data.ledger.valid}, blocks=${r.data.ledger.blocks}`);
  await prisma.transaction.update({ where: { id: tx.id }, data: { price: "1000 RWF" } });
  r = await api("GET", `/verify?upi=${encodeURIComponent(T)}`);
  check("Ledger", "Tamper with a stored transaction price directly in the database", "Tampering detected", r.data.ledger.valid === false, r.data.ledger.reason);
  await prisma.transaction.update({ where: { id: tx.id }, data: { price: "18500000 RWF" } });

  // other transactions in different stages for the dashboards
  const mk = async (upi, seller, buyer, price, steps) => {
    let t = (await api("POST", "/transactions", { title: `Purchase of ${upi}`, upi, status: "PENDING_SELLER_APPROVAL", step: "Buyer Offer", progress: 20, sellerName: U[seller].name, buyerName: U[buyer].name, price }, U[buyer].token)).data;
    for (const [status, step, progress, who] of steps) t = (await api("PATCH", `/transactions/${t.id}`, { status, step, progress }, U[who].token)).data;
    return t;
  };
  await api("PATCH", `/parcels/${encodeURIComponent(parcels[1].upi)}`, { status: "For Sale", price: "32000000 RWF" }, U.diane.token);
  await api("PATCH", `/parcels/${encodeURIComponent(parcels[4].upi)}`, { status: "Pending Sale", price: "41000000 RWF" }, U.alice.token);
  await mk(parcels[4].upi, "alice", "eric", "41000000 RWF", [["PENDING_PAYMENT", "Seller Approved", 40, "alice"], ["PENDING_NOTARY", "Fees Paid", 60, "eric"]]);
  await api("PATCH", `/parcels/${encodeURIComponent(parcels[6].upi)}`, { status: "Pending Sale", price: "26000000 RWF" }, U.grace.token);
  await mk(parcels[6].upi, "grace", "diane", "26000000 RWF", []);
  await api("PATCH", `/parcels/${encodeURIComponent(parcels[3].upi)}`, { status: "Pending Sale", price: "55000000 RWF" }, U.jean.token);
  await mk(parcels[3].upi, "jean", "alice", "55000000 RWF", [["PENDING_PAYMENT", "Seller Approved", 40, "jean"]]);

  // ---------------- disputes
  r = await api("POST", "/disputes", { upi: parcels[0].upi, type: "Boundary", parties: `${U.diane.name}, Kamanzi Innocent`, description: "The neighbour extended a fence about two metres into the eastern side of the parcel after the latest survey.", location: "Amahoro, Rukiri I, Remera", district: "Gasabo", sector: "Remera", cell: "Rukiri I", village: "Amahoro" }, U.diane.token);
  const d1 = r.data;
  check("Disputes", "Report a boundary dispute in Amahoro village", "Created; auto-assigned to the Abunzi of Amahoro", d1.assignedAbunziId === U.abunzi.id && d1.status === "Investigation", `status=${d1.status}, assigned=${d1.assignedAbunziId === U.abunzi.id ? U.abunzi.name : d1.assignedAbunziId}`);
  r = await api("PATCH", `/disputes/${d1.id}`, { status: "Resolved" }, U.diane.token);
  check("Authorisation", "Reporter tries to close the dispute", "Rejected (403)", r.status === 403, `${r.status}: ${r.data?.error}`);
  const statements = [
    { party: U.diane.name, text: "The fence was moved in March without my consent.", date: "2026-08-02" },
    { party: "Kamanzi Innocent", text: "I followed the markers placed by the surveyor.", date: "2026-08-02" },
  ];
  r = await api("PATCH", `/disputes/${d1.id}`, { status: "Mediation", statements, evidence: [{ name: "Survey sketch 2025", type: "IMAGE" }, { name: "Photo of the fence", type: "IMAGE" }] }, U.abunzi.token);
  check("Disputes", "Abunzi opens mediation and records statements and evidence", "Status Mediation; statements saved", r.data.status === "Mediation" && JSON.parse(r.data.statements).length === 2, r.data.status);

  const d2 = (await api("POST", "/disputes", { upi: parcels[4].upi, type: "Inheritance", parties: `${U.alice.name}, Irakoze Samuel`, description: "Heirs dispute the planned sale of the family parcel before the succession is registered.", location: "Kigarama, Gahanga, Kicukiro", district: "Kicukiro", sector: "Gahanga", cell: "Gahanga", village: "Kigarama" }, U.alice.token)).data;
  await api("PATCH", `/disputes/${d2.id}`, { status: "Mediation", familyTree: [{ name: U.alice.name, relation: "Widow (owner)" }, { name: "Irakoze Samuel", relation: "Son" }, { name: "Uwamahoro Clarisse", relation: "Daughter" }, { name: "Mugabo Yves", relation: "Son" }] }, U.abunzi2.token);
  r = await api("PATCH", `/disputes/${d2.id}`, { status: "Resolved", decisions: [{ decision: "The parcel will not be sold until the succession is registered; all heirs are recorded as co-owners.", date: "2026-09-10", by: U.abunzi2.name }] }, U.abunzi2.token);
  check("Disputes", "Abunzi records the decision and resolves an inheritance dispute", "Status Resolved; decision saved", r.data.status === "Resolved", r.data.status);
  await api("POST", "/disputes", { upi: parcels[6].upi, type: "Ownership", parties: `${U.grace.name}, Rurangwa Theoneste`, description: "A second person presented an old sale agreement for the same plot.", location: "Kacyiru, Kamatamu, Kacyiru", district: "Gasabo", sector: "Kacyiru", cell: "Kamatamu", village: "Kacyiru" }, U.grace.token);

  // ---------------- anomalies
  r = await api("POST", "/anomalies", { upi: parcels[5].upi, type: "Illegal Construction", description: "A building is being constructed on the parcel without a visible permit.", location: "Muhima, Nyarugenge", latitude: -1.9441, longitude: 30.0619, imageUrl: IMG[3] }, U.eric.token);
  check("Anomalies", "Report an anomaly with GPS position and photo", "Saved as PENDING with coordinates", r.status === 201 && r.data.status === "PENDING" && r.data.latitude === -1.9441, `${r.data.status}, (${r.data.latitude}, ${r.data.longitude})`);
  const a1 = r.data;
  await api("POST", "/anomalies", { upi: parcels[4].upi, type: "Boundary Encroachment", description: "Boundary stones on the southern side were removed.", location: "Kigarama, Gahanga", latitude: -2.0236, longitude: 30.0842, imageUrl: IMG[1] }, U.alice.token);
  await api("POST", "/anomalies", { type: "Wetland Encroachment", description: "Soil is being dumped into the wetland near the road.", location: "Kibagabaga, Kimironko", latitude: -1.9447, longitude: 30.1261, imageUrl: IMG[2] }, U.jean.token);
  r = await api("PATCH", `/anomalies/${a1.id}`, { status: "INVESTIGATING" }, U.eric.token);
  check("Authorisation", "Citizen tries to change an anomaly status", "Rejected (403)", r.status === 403, `${r.status}`);
  r = await api("PATCH", `/anomalies/${a1.id}`, { status: "INVESTIGATING" }, ADMIN);
  check("Anomalies", "Administrator starts investigating the anomaly", "Status INVESTIGATING", r.data.status === "INVESTIGATING", r.data.status);

  // ---------------- documents
  const pdf = "data:application/pdf;base64," + Buffer.from("%PDF-1.4 demo sale agreement").toString("base64");
  r = await api("POST", "/documents", { name: "Sale Agreement - 1/02/05/01/0876", category: "CONTRACT", url: pdf, upi: T, description: "Signed sale agreement between Habimana Jean Claude and Ingabire Grace" }, U.grace.token);
  const doc = r.data;
  check("Documents", "Upload a sale agreement to the document vault", "Stored with status PENDING", r.status === 201 && doc.status === "PENDING", `${r.status}, ${doc.status}`);
  await api("POST", "/documents", { name: "National ID - Ingabire Grace", category: "ID", url: pdf, upi: T }, U.grace.token);
  await api("POST", "/documents", { name: "Tax Clearance 2026", category: "TAX", url: pdf, upi: parcels[0].upi }, U.diane.token);
  r = await api("PATCH", `/documents/${doc.id}`, { status: "CERTIFIED" }, U.grace.token);
  check("Authorisation", "Owner tries to certify their own document", "Rejected (403)", r.status === 403, `${r.status}`);
  r = await api("PATCH", `/documents/${doc.id}`, { status: "CERTIFIED" }, U.notary.token);
  check("Documents", "Notary certifies the document", "Status CERTIFIED", r.data.status === "CERTIFIED" && r.data.isCertified, r.data.status);

  // ---------------- admin dashboard protection
  const res = await fetch(BASE.replace("/api", "") + "/admin", { redirect: "manual" });
  check("Authorisation", "Open the admin dashboard without logging in", "Redirected to the login page", res.status >= 300 && res.status < 400 && (res.headers.get("location") || "").includes("/admin/login"), `${res.status} -> ${res.headers.get("location")}`);

  fs.writeFileSync(path.join(__dirname, "e2e-results.json"), JSON.stringify(cases, null, 2));
  console.log(`\n${cases.filter((c) => c.result === "Pass").length}/${cases.length} test cases passed`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
