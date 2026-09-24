const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'HHk@F?*rEe3/&g6',
  host: 'db.fibxwiodnuuorhmqobgn.supabase.co',
  port: 5432,
  database: 'postgres',
});

async function setup() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL!');

    const query = `
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        address TEXT NOT NULL,
        age_range TEXT NOT NULL,
        is_member BOOLEAN NOT NULL,
        is_first_time BOOLEAN NOT NULL,
        branch TEXT NOT NULL,
        heard_from TEXT NOT NULL,
        invitees TEXT
      );
    `;
    
    await client.query(query);
    console.log('Successfully created the "registrations" table!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

setup();
