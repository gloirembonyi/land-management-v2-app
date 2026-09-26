// Quick database connectivity check: `node test-db.cjs` (reads DATABASE_URL from .env)
require("dotenv").config();
const { Client } = require("pg");

async function test() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set (add it to .env)");
    process.exit(1);
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const res = await client.query("SELECT NOW()");
    console.log("Connected successfully:", res.rows[0]);
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

test();
