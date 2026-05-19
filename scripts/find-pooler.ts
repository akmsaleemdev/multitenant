import pg from 'pg';

const pwd = process.env.SUPABASE_DB_PASSWORD ?? 'ufMHqrDSv7cqArog';
const ref = 'blnhbcehrmekhkklkvng';
const regions = ['eu-central-1', 'eu-west-1', 'ap-south-1', 'me-central-1', 'us-east-1'];

async function tryUrl(url: string) {
  const pool = new pg.Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  try {
    await pool.query('SELECT 1');
    console.log('OK', url);
    return true;
  } catch (e) {
    console.log('FAIL', (e as Error).message, url.substring(0, 90));
    return false;
  } finally {
    await pool.end();
  }
}

async function main() {
  for (const region of regions) {
    for (const user of [`postgres.${ref}`, 'postgres']) {
      const url = `postgresql://${user}:${pwd}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
      if (await tryUrl(url)) return;
    }
  }
}

main();
