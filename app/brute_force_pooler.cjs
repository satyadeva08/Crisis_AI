const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const region = 'ap-northeast-2';
const password = 'pranith%400888';
const projectRef = 'gcjawzcwmxaayedcmfin';

async function runSqlFile(client, filePath) {
  console.log(`Executing ${filePath}...`);
  const sql = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
  await client.query(sql);
  console.log(`Successfully executed ${filePath}`);
}

async function tryConnect() {
  const connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
  console.log(`Connecting to pooler on port 5432 for session pooling...`);
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(`SUCCESS! Connected.`);
    
    // Run the incident_updates setup
    try {
      await runSqlFile(client, 'incident_updates.sql');
    } catch (err) {
      console.error(`Error running incident_updates.sql:`, err);
    }
    
    console.log('ALL DONE!');
  } catch (err) {
    console.error(`Failed to connect or run:`, err);
  } finally {
    await client.end();
  }
}

tryConnect();
