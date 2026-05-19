import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

const root = join(process.cwd(), 'db');

async function runSql(pool: Pool, file: string, label: string) {
  const sql = readFileSync(join(root, file), 'utf8');
  console.log(`Running ${label}...`);
  await pool.query(sql);
  console.log(`  ✓ ${label}`);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });

  try {
    console.log('Dropping existing tables...');
    await pool.query(`
      DROP TABLE IF EXISTS invoices, tenants, properties, users, organizations CASCADE;
      DROP FUNCTION IF EXISTS current_org_id() CASCADE;
    `);
    await runSql(pool, 'schema.sql', 'schema');
    await runSql(pool, 'rls.sql', 'RLS policies');
    await runSql(pool, 'seed.sql', 'seed data');
    console.log('\nDatabase ready.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
