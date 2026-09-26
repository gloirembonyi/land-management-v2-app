# Ubutaka Admin — NLA Dashboard and REST API

Web administration dashboard and REST API of **Ubutaka**, the Digital Land Ownership and Conflict
Resolution Management System. National Land Authority (NLA) officers use the dashboard to verify
parcels, manage users and supervise transactions, disputes and anomaly reports. The same server exposes
the REST API used by the Ubutaka mobile app (citizens, notaries and Abunzi mediators).

- Mobile app repository: <https://github.com/gloirembonyi/Ubutaka-mobile>
- Stack: Next.js 16 (App Router, route handlers, server actions) · React 19 · TypeScript · Prisma 6 ·
  PostgreSQL · Tailwind CSS 4 · bcrypt · JSON Web Tokens

```
 Ubutaka mobile app ──HTTPS/JSON + JWT──▶  /api/*   (route handlers)  ──Prisma──▶ PostgreSQL
 NLA officer (browser) ──cookie session──▶ /admin/* (dashboard pages + server actions)
```

---

## Features

**Dashboard (`/admin`)** — live counts of users, parcels, transactions and open disputes; recent
activity; critical alerts (open disputes and pending anomaly reports).

| Page | What the officer can do |
|---|---|
| `/admin/users` | Create, edit, verify and delete accounts; assign roles USER / NOTARY / ABUNZI / ADMIN and village |
| `/admin/parcels` | Browse and search the parcel registry (UPI, owner, district) |
| `/admin/parcels/{upi}` | Review a parcel and verify it — issues certificate number `CERT-<year>-<nnnn>` |
| `/admin/transactions` | Follow every land transfer and its stage; open a transaction to see its ledger hash |
| `/admin/disputes` → `/admin/disputes/{id}` | Mediation file: parties, assigned Abunzi, statements, evidence, family tree, decisions, parcel transaction history; move status Investigation → Mediation → Resolved |
| `/admin/anomalies` | Citizen reports with photo and GPS; start investigation, resolve, dismiss, open location on the map |
| `/admin/settings` | Administrator profile, change password, security configuration |

**Land transfer workflow** (enforced by the API — a step cannot be skipped):
`PENDING_SELLER_APPROVAL` (20 %) → `PENDING_PAYMENT` (40 %) → `PENDING_NOTARY` (60 %, notary only) →
`PENDING_SELLER` (80 %) → `COMPLETED` (100 %).

**Tamper-evident ledger** — every transaction stores the SHA-256 hash of the previous transaction of the
same parcel; `GET /api/verify?upi=…` re-checks the chain and detects any modified record.

**Certificate verification** — the QR code on a certificate holds the UPI, certificate number and a
SHA-256 fingerprint of the registry record (owner, certificate, verification date). The mobile scanner
calls `GET /api/verify`; a certificate stops verifying after the land is sold.

**Dispute routing** — a new dispute is assigned automatically to a verified Abunzi of the same village
(then cell, then sector).

## Security

| Concern | Implementation (file) |
|---|---|
| Passwords | bcrypt, cost 10; legacy plain-text passwords upgraded at first login (`src/lib/auth.ts`) |
| Mobile sessions | JWT, 7 days, `Authorization: Bearer` |
| Dashboard sessions | HTTP-only, SameSite cookie, 8 hours; `/admin/*` protected in `src/proxy.ts` |
| Authorisation | `requireAuth(request, roles)` in every API route; server actions check the admin session (`src/lib/adminSession.ts`) |
| Encryption at rest | Co-owners and heirs encrypted with AES-256-GCM (`src/lib/encryption.ts`) |
| National ID | 16-digit Rwandan ID structure validated (`src/lib/nida.ts`) |
| Data exposure | Password hashes are never returned by the API (`src/lib/users.ts`) |

---

## Getting started

### Prerequisites

- Node.js 20.19+ (22 LTS recommended)
- PostgreSQL 14+ (local, Neon, Supabase, ...)

### 1. Install

```bash
git clone https://github.com/gloirembonyi/land-management-v2-app.git ubutaka-admin
cd ubutaka-admin
npm install          # also runs `prisma generate`
```

### 2. Configure

Create `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
JWT_SECRET="long-random-string"          # required in production
ENCRYPTION_KEY="another-long-random-string" # required in production
```

Check the connection with `npm run db:test`.

### 3. Create the database tables and the first administrator

```bash
npm run db:push                                            # creates tables from prisma/schema.prisma
ADMIN_EMAIL=admin@ubutaka.gov.rw ADMIN_PASSWORD='ChangeMe#2026' npm run db:seed
```

(Windows PowerShell: `$env:ADMIN_PASSWORD='ChangeMe#2026'; npm run db:seed`.)
The seed script only creates the administrator if it does not exist; it never deletes data.

### 4. Run

```bash
npm run dev                  # development: http://localhost:3000/admin
npm run build && npm start   # production build
```

Log in at `/admin/login` with the administrator account.

### 5. Connect the mobile app

In the mobile app's `.env` set `EXPO_PUBLIC_API_URL=http://<your-computer-IP>:3000/api`
(Android emulator: `http://10.0.2.2:3000/api`), then run `npx expo start -c` in the mobile project.

---

## End-to-end test with demo data

`scripts/e2e-test.cjs` registers citizens, a notary and two Abunzi mediators, registers and verifies
eight parcels in Kigali, runs a complete sale through all five stages, opens and resolves disputes,
reports anomalies and certifies documents, and checks 42 rules (authentication, permissions,
encryption at rest, workflow order, ledger tamper detection, certificate verification, dashboard
protection).

> It **deletes all rows** of the target database first, so it refuses to run unless you point it at a
> throw-away database explicitly.

```bash
# start the server against the demo database, then in another terminal:
DEMO_DATABASE_URL="postgresql://.../ubutaka_demo" API_URL="http://localhost:3000/api" ALLOW_DEMO_RESET=yes npm run test:e2e
```

Expected result: `42/42 test cases passed`. Demo accounts created (password `Ubutaka@2026`; admin
`admin@ubutaka.gov.rw` / `Admin@2026`): `diane.uwase@example.rw`, `jc.habimana@example.rw`,
`grace.ingabire@example.rw` (citizens), `notary.uwimana@example.rw` (notary),
`abunzi.nsengimana@example.rw` (Abunzi of Amahoro village).

---

## API reference

| Method & path | Access | Purpose |
|---|---|---|
| `POST /api/auth/register` | public | Create account (USER, NOTARY or ABUNZI); validates national ID |
| `POST /api/auth/login` | public | Email + password, or `{ biometricToken }`; returns `{ user, token }` |
| `GET /api/parcels?ownerName=&status=` · `POST /api/parcels` | signed in | List / register parcels |
| `GET /api/parcels/{upi}` · `PATCH /api/parcels/{upi}` | signed in | Parcel detail / update; verification ADMIN only |
| `GET /api/transactions?name=&upi=` · `POST /api/transactions` | signed in | List / create ledger records |
| `PATCH /api/transactions/{id}` · `DELETE /api/transactions/{id}` | signed in | Advance the workflow; withdraw a pending offer |
| `GET /api/verify?upi=&certId=&hash=` | public | Certificate authenticity, ledger integrity, open disputes |
| `GET /api/disputes` · `POST /api/disputes` | signed in | List / report disputes (auto-assigned to Abunzi) |
| `GET /api/disputes/{id}` · `PATCH /api/disputes/{id}` | signed in | Case file; status changes by ABUNZI/ADMIN |
| `GET /api/anomalies` · `POST /api/anomalies` · `PATCH /api/anomalies/{id}` | signed in / ADMIN | Anomaly reports |
| `GET /api/documents` · `POST /api/documents` · `PATCH /api/documents/{id}` | signed in / NOTARY | Document vault and certification |
| `GET /api/users` · `GET/PATCH /api/users/{id}` · `POST /api/users` | signed in / ADMIN | Users (no password hashes), profile completion |
| `GET /api/locations` | public | Province → district → sector → cell → village |

## Project structure

```
prisma/schema.prisma     User, Parcel, Transaction, Dispute, AnomalyReport, LandDocument
prisma/seed.js           creates the first administrator (never deletes data)
scripts/e2e-test.cjs     42-case end-to-end test + demo data
src/app/api/             REST API route handlers
src/app/admin/           dashboard pages
src/app/actions/         server actions (login, users, parcels, cases, settings)
src/components/          AdminLayout, UserTable
src/lib/                 auth, adminSession, encryption, ledger, nida, parcels, users, db
src/proxy.ts             CORS for /api, protection of /admin
```

## Deployment (Vercel)

1. Import this repository in Vercel (framework: Next.js, root directory: repository root).
2. Add `DATABASE_URL`, `JWT_SECRET` and `ENCRYPTION_KEY` as environment variables.
3. Deploy. The mobile app's production builds use `https://ubutaka-admin.vercel.app/api` (see the
   mobile repository's `eas.json`).

## Troubleshooting

| Problem | Fix |
|---|---|
| `DATABASE_URL environment variable is required` | Create `.env` with `DATABASE_URL` |
| `Failed to load SWC binary` | Delete `node_modules` and run `npm install` again |
| Redirected to `/admin/login` | Session expired (8 h) or the account is not ADMIN |
| Mobile app receives 401 | The mobile session expired — log in again in the app |
