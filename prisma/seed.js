// Creates the first NLA administrator if none exists. Never deletes data.
// Usage: ADMIN_EMAIL=admin@ubutaka.gov.rw ADMIN_PASSWORD='StrongPass#2026' npm run db:seed
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@ubutaka.gov.rw").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error("Set ADMIN_PASSWORD (at least 8 characters) to create the first administrator.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`An account with ${email} already exists (role ${existing.role}); nothing changed.`);
    return;
  }

  await prisma.user.create({
    data: {
      name: process.env.ADMIN_NAME || "NLA Administrator",
      email,
      password: await bcrypt.hash(password, 10),
      nationalId: process.env.ADMIN_NATIONAL_ID || "1198080045612378",
      role: "ADMIN",
      isVerified: true,
    },
  });
  console.log(`Administrator ${email} created.`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
