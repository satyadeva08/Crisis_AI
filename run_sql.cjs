const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// URL-encode the password to handle the '@' symbol
const connectionString = 'postgresql://postgres:pranith%400888@db.gcjawzcwmxaayedcmfin.supabase.co:5432/postgres';

async function runSqlFile(client, filePath) {
  console.log(`Executing ${filePath}...`);
  const sql = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
  try {
    await client.query(sql);
    console.log(`Successfully executed ${filePath}`);
  } catch (err) {
    console.error(`Error executing ${filePath}:`, err.message);
    throw err;
  }
}

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for some managed databases like Supabase
  });

  try {
    await client.connect();
    console.log('Connected to Supabase database.');

    // Execute the base schema
    await runSqlFile(client, 'crisisai_complete.sql');

    // Execute the migration script
    await runSqlFile(client, 'crisisai_migration.sql');

    console.log('All SQL executed successfully.');
  } catch (err) {
    console.error('Database operation failed:', err);
  } finally {
    await client.end();
  }
}

main();
