import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import { logger } from './logger';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }
    pool = new Pool({ connectionString, max: 10 });
    pool.on('error', (err) => {
      logger.error('Unexpected pool error', { error: err.message });
    });
  }
  return pool;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Sets RLS session variable for organization-scoped queries. */
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
    await client.query('ROLLBACK');
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
