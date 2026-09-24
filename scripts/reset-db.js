const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

async function reset() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL.replace("5432", "6543"),
  });
  await client.connect();
  console.log("Connected to DB, dropping schema public...");
  
  await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;");
  
  console.log("Schema reset. You can now run drizzle-kit push.");
  await client.end();
}

reset().catch(console.error);
