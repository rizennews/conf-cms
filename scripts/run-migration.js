const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

async function runMigration() {
  const client = new Client({
    // Use transaction pooler (6543) which has a much higher connection limit
    connectionString: process.env.DATABASE_URL.replace("5432", "6543"),
  });
  
  await client.connect();
  console.log("Connected to DB via 6543.");
  
  const sql = fs.readFileSync(path.join(__dirname, "../drizzle/0003_redundant_tarot.sql"), "utf8");
  
  // Remove Drizzle breakpoint comments
  const cleanSql = sql.replace(/--> statement-breakpoint/g, "");
  
  console.log("Running migration...");
  await client.query(cleanSql);
  
  console.log("Migration executed successfully! Schema is up to date.");
  await client.end();
}

runMigration().catch(console.error);
