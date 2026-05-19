import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import { logger } from './logger';

let pool: Pool | null = null;

function getConnectionString(): string | undefined {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return undefined;
  if (raw.includes('[YOUR-PASSWORD]') || raw.includes('YOUR_PASSWORD')) {
    return undefined;
  }
  return raw;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getConnectionString());
}

function createPool(connectionString: string): Pool {
  const isSupabase =
    connectionString.includes('supabase.co') ||
    connectionString.includes('supabase.com');

  return new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  });
}

export function getPool(): Pool {
  if (!pool) {
    const connectionString = getConnectionString();
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }
    pool = createPool(connectionString);
    pool.on('error', (err) => {
      logger.error('Unexpected pool error', { error: err.message });
    });
  }
  return pool;
}

export async function withOrgContext<T>(
  organizationId: string,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('app.current_organization_id', $1, true)`, [
      organizationId,
    ]);
    logger.debug('RLS org context set', { organizationId });
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore */
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

export async function queryWithOrg<T extends QueryResultRow>(
  organizationId: string,
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  return withOrgContext(organizationId, async (client) => {
    const result = await client.query<T>(text, params);
    return result.rows;
  });
}

export type DbResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function tryDb<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
): Promise<DbResult<T>> {
  if (!isDatabaseConfigured()) {
    return { ok: true, data: fallback };
  }
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error('Database operation failed', { label, error });
    return { ok: false, error };
  }
}
