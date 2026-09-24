const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const res = await client.query('SELECT id, "customFields" FROM events');
  let updatedCount = 0;

  for (const row of res.rows) {
    let fields = [];
    try {
      if (row.customFields) fields = JSON.parse(row.customFields);
    } catch(e) {}
    
    const hasGender = fields.some(f => (f.label || '').toLowerCase() === 'gender');
    if (!hasGender) {
      fields.splice(3, 0, {
        id: Math.random().toString(36).substring(2, 9),
        label: 'Gender',
        type: 'select',
        options: ['Male', 'Female'],
        required: true
      });
      
      const newFields = JSON.stringify(fields);
      await client.query('UPDATE events SET "customFields" = $1 WHERE id = $2', [newFields, row.id]);
      updatedCount++;
    }
  }
  
  console.log(`Checked ${res.rowCount} events. Updated ${updatedCount} events to add Gender field.`);
  await client.end();
}
run().catch(console.error);
