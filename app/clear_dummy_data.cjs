const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const region = 'ap-northeast-2';
const password = 'pranith%400888';
const projectRef = 'gcjawzcwmxaayedcmfin';

async function clearDummyData() {
  const connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
  console.log(`Connecting to pooler on port 5432...`);
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(`SUCCESS! Connected.`);
    
    // Delete all incidents. This will cascade and delete updates, text_reports, etc.
    const res = await client.query('DELETE FROM public.incidents');
    console.log(`Deleted ${res.rowCount} incidents (dummy data removed).`);
    
  } catch (err) {
    console.error(`Failed to connect or delete:`, err);
  } finally {
    await client.end();
  }
}

clearDummyData();
