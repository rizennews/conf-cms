const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

const branches = [
  "LifeCity Achimota", "LifeCity Amrahia", "LifeCity Osu", "LifeCity Comet", 
  "LifeCity Sunyani", "LifeCity Tamale", "LifeCity Takoradi", "LifeCity KNUST", 
  "LifeCity UG-Legon", "LifeCity UPSA", "LifeCity ATU", "LifeCity Oyibi", 
  "LifeCity Kasoa", "LifeCity Pentvars", "LifeCity GH Media"
];

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  await client.connect();
  console.log("Connected to DB to seed branches...");
  
  for (const name of branches) {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    try {
      await client.query("INSERT INTO branches (id, name) VALUES ($1, $2)", [id, name]);
      console.log(`Inserted: ${name}`);
    } catch (e) {
      if (e.code === '23505') {
        console.log(`Skipped (already exists): ${name}`);
      } else {
        console.error(`Error inserting ${name}:`, e.message);
      }
    }
  }
  
  console.log("Seeding complete.");
  await client.end();
}

seed().catch(console.error);
