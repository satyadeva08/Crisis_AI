const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:pranith%400888@db.gcjawzcwmxaayedcmfin.supabase.co:5432/postgres';

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase database.');
    
    const sql = fs.readFileSync(path.resolve(__dirname, 'admin_setup.sql'), 'utf8');
    await client.query(sql);
    console.log('Successfully executed admin_setup.sql');
  } catch (err) {
    console.error('Database operation failed:', err);
  } finally {
    await client.end();
  }
}

main();
