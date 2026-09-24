const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL.replace("5432", "6543"),
  });
  
  await client.connect();
  console.log("Connected to DB to seed events...");
  
  try {
    await client.query(`
      INSERT INTO events (id, name, slug, custom_fields) 
      VALUES (
        'evt_multiply_sunday', 
        'Multiply Sunday', 
        'multiply-sunday', 
        '[{"label":"T-Shirt Size","type":"text"}]'
      )
    `);
    console.log("Inserted Multiply Sunday event");
  } catch (e) {
    if (e.code === '23505') {
      console.log("Event already exists.");
    } else {
      console.error("Error inserting event:", e.message);
    }
  }
  
  await client.end();
}

seed().catch(console.error);
