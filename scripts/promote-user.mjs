import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const emailArg = process.argv[2];
  if (!emailArg) {
    console.error('Usage: node scripts/promote-user.mjs <email>');
    process.exit(1);
  }
  if (!process.env.SUPABASE_DB_URL) {
    console.error('Missing SUPABASE_DB_URL in .env.local');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const { rowCount } = await client.query(
      `UPDATE public.profiles SET role = 'superadmin' WHERE lower(email) = lower($1)`,
      [emailArg]
    );
    if (rowCount === 0) {
      console.error('No matching profile found.');
      process.exit(2);
    }
    console.log(`Promoted ${emailArg} to superadmin.`);
  } catch (err) {
    console.error('Error promoting user:', err?.message || err);
    process.exit(3);
  } finally {
    await client.end();
  }
}

main();
