const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL.replace('5432', '6543')
  });
  
  await client.connect();
  
  const fields = [
    { label: 'Please state your full name', type: 'text', required: true, description: 'e.g. Solace Amenyedzi' },
    { label: 'Please state your email address', type: 'email', required: true, description: 'e.g. oseiwusu@gmail.com' },
    { label: 'Please state your contact number', type: 'tel', required: true, description: 'e.g. 0243922502' },
    { label: 'Please state your home address', type: 'text', required: true, description: 'e.g. Spintex Road, Accra' },
    { label: 'Please select your age range', type: 'select', required: true, options: ['13-17', '18-24', '25-34', '35-44', '45+'] },
    { label: 'Are you a church member?', type: 'radio', required: true, options: ['Yes', 'No'] },
    { label: 'Is this your first time?', type: 'radio', required: true, options: ['Yes', 'No'] },
    { label: 'Branch', type: 'select', required: true, options: ['LifeCity GH Media', 'Other'] },
    { label: 'How did you hear about us?', type: 'select', required: true, options: ['Friend / Family', 'Social Media', 'Billboard'] },
    { label: 'Mention the details of your invitees (Optional)', type: 'textarea', required: false, description: 'e.g. 1. Osei Owusu - 0244900900' }
  ];
  
  await client.query("UPDATE events SET custom_fields = $1 WHERE id = 'evt_multiply_sunday'", [JSON.stringify(fields)]);
  
  console.log('Updated evt_multiply_sunday with perfect screenshots');
  await client.end();
}

run().catch(console.error);
