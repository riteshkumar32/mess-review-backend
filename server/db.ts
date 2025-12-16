// server/db.ts  (replace your current file with this)
import 'dotenv/config';               // must be first so process.env is populated
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL is missing. Add it to .env (project root) or export it before running.');
  process.exit(1);
}

// Print masked URL so you can confirm it's being read (hides password)
console.log('Using DATABASE_URL:', connectionString.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:*****@'));

export const pool = new Pool({
  connectionString,
  // Neon requires TLS/SSL; disable strict cert checks for many client setups
  ssl: {
    rejectUnauthorized: false,
  },
  // optional: small connection timeout for faster failures while debugging
  // connectionTimeoutMillis: 5000,
});

// Helpful: log unexpected pool errors
pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err);
});

// Quick test query (keeps helpful log if connection fails)
pool.query('SELECT 1')
  .then(() => console.log('✅ Neon DB connected (test query passed)'))
  .catch((err) => console.error('❌ DB connection test failed:', err));

export const db = drizzle(pool, { schema });
