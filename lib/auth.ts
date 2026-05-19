import { cookies } from 'next/headers';
import type { DemoUser } from './types';
import { SESSION_COOKIE, USER_DESERT_ADMIN } from './constants';
import { query, isDatabaseConfigured, tryDb } from './db';
import { logger } from './logger';

const DEMO_USER_FALLBACK: DemoUser = {
  id: USER_DESERT_ADMIN,
  organizationId: '11111111-1111-1111-1111-111111111101',
  email: 'admin@desertcrown.ae',
  fullName: 'Fatima Al Maktoum',
  role: 'admin',
  organizationName: 'Desert Crown Properties',
  organizationSlug: 'desert-crown',
};

async function loadUserById(userId: string): Promise<DemoUser | null> {
  if (!isDatabaseConfigured()) {
    return userId === DEMO_USER_FALLBACK.id ? DEMO_USER_FALLBACK : null;
  }

  const result = await tryDb(
    'loadUserById',
    async () => {
      const rows = await query<{
        id: string;
        organization_id: string;
        email: string;
        full_name: string | null;
        role: DemoUser['role'];
        organization_name: string;
        organization_slug: string;
      }>(
        `SELECT u.id, u.organization_id, u.email, u.full_name, u.role,
                o.name AS organization_name, o.slug AS organization_slug
         FROM users u
         JOIN organizations o ON o.id = u.organization_id
         WHERE u.id = $1`,
        [userId],
      );
      return rows[0] ?? null;
    },
    null,
  );

  if (!result.ok) return null;

  const row = result.data;
  if (!row) return null;

  return {
    id: row.id,
    organizationId: row.organization_id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    organizationName: row.organization_name,
    organizationSlug: row.organization_slug,
  };
}

export async function getSession(): Promise<DemoUser> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(SESSION_COOKIE)?.value;
  const userId = fromCookie ?? process.env.DEMO_USER_ID ?? USER_DESERT_ADMIN;

  logger.info('Resolving session', {
    userId,
    source: fromCookie ? 'cookie' : process.env.DEMO_USER_ID ? 'env' : 'default',
  });

  const user = await loadUserById(userId);
  if (!user) {
    logger.warn('Invalid session user, falling back to default', { userId });
    return DEMO_USER_FALLBACK;
  }

  return user;
}

export async function getOrganizationId(): Promise<string> {
  const session = await getSession();
  return session.organizationId;
}
