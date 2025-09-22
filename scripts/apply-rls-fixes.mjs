import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local explicitly (do not commit this file)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const sqlFile = process.argv[2] || 'sql/2025-09-22-rls-fixes.sql';
  const sqlPath = path.resolve(process.cwd(), sqlFile);

  if (!process.env.SUPABASE_DB_URL) {
    console.error('Missing SUPABASE_DB_URL in .env.local');
    process.exit(1);
  }

  if (!fs.existsSync(sqlPath)) {
    console.error(`SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(`Applying SQL from ${sqlPath} ...`);
    await client.query(sql);
    console.log('SQL applied successfully.');
  } catch (err) {
    console.error('Error applying SQL:', err?.message || err);
    if (err?.position) {
      console.error('Position:', err.position);
    }
    process.exit(2);
  } finally {
    await client.end();
  }
}

main();
