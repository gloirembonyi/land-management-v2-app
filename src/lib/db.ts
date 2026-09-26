import { PrismaClient } from "@prisma/client";

// Explicitly check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined in environment variables!');
  console.error('Please check your .env or .env.local file');
  throw new Error('DATABASE_URL environment variable is required');
}

// Check for valid protocol and common encoding issues
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
  console.error('❌ DATABASE_URL has an invalid format. It should start with postgresql:// or postgres://');
  
  // Check for UTF-16 BOM or Null characters which often occur during Windows encoding issues
  if (dbUrl.includes('\uFEFF') || dbUrl.includes('\0')) {
    console.error('⚠️ Detected invisible characters (BOM or Nulls). This usually means your .env file is encoded in UTF-16 or has a Byte Order Mark.');
    console.error('To fix this, recreate your .env file and ensure it is saved as UTF-8 (without BOM).');
  }
  
  throw new Error('Invalid DATABASE_URL format');
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
