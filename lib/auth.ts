import { cookies } from 'next/headers';
import type { DemoUser } from './types';
import { SESSION_COOKIE, USER_DESERT_ADMIN } from './constants';
import { useSupabaseDataLayer } from './database';
import { getSupabaseAdmin } from './supabase/admin';
import { query, tryDb } from './db';
import { isDatabaseConfigured as isPgConfigured } from './db';
import { isSupabaseConfigured } from './supabase/admin';
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

function mapUser(row: {
  id: string;
  organization_id: string;
  email: string;
  full_name: string | null;
  role: DemoUser['role'];
  organization_name: string;
  organization_slug: string;
}): DemoUser {
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

async function loadUserByIdFromSupabase(userId: string): Promise<DemoUser | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('users')
    .select(
      `id, organization_id, email, full_name, role,
       organizations!inner(name, slug)`,
    )
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const org = data.organizations as { name: string; slug: string } | { name: string; slug: string }[];
  const organization = Array.isArray(org) ? org[0] : org;

  return mapUser({
    id: data.id,
    organization_id: data.organization_id,
    email: data.email,
    full_name: data.full_name,
    role: data.role as DemoUser['role'],
    organization_name: organization.name,
    organization_slug: organization.slug,
  });
}

async function loadUserByIdFromPg(userId: string): Promise<DemoUser | null> {
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
  if (!result.ok || !result.data) return null;
  return mapUser(result.data);
}

async function loadUserByEmail(email: string): Promise<DemoUser | null> {
  if (useSupabaseDataLayer()) {
    const { data, error } = await getSupabaseAdmin()
      .from('users')
      .select(
        `id, organization_id, email, full_name, role,
         organizations!inner(name, slug)`,
      )
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    const orgRaw = data.organizations as { name: string; slug: string } | { name: string; slug: string }[];
    const org = Array.isArray(orgRaw) ? orgRaw[0] : orgRaw;
    if (!org) return null;
    return mapUser({
      id: data.id,
      organization_id: data.organization_id,
      email: data.email,
      full_name: data.full_name,
      role: data.role as DemoUser['role'],
      organization_name: org.name,
      organization_slug: org.slug,
    });
  }

  if (!isPgConfigured()) return null;

  const result = await tryDb(
    'loadUserByEmail',
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
         WHERE LOWER(u.email) = LOWER($1)`,
        [email],
      );
      return rows[0] ?? null;
    },
    null,
  );
  if (!result.ok || !result.data) return null;
  return mapUser(result.data);
}

async function loadUserById(userId: string): Promise<DemoUser | null> {
  if (!isSupabaseConfigured() && !isPgConfigured()) {
    return userId === DEMO_USER_FALLBACK.id ? DEMO_USER_FALLBACK : null;
  }

  try {
    if (useSupabaseDataLayer()) {
      return await loadUserByIdFromSupabase(userId);
    }
    return await loadUserByIdFromPg(userId);
  } catch {
    return null;
  }
}

export async function getSession(): Promise<DemoUser> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(SESSION_COOKIE)?.value;
  const userId = fromCookie ?? process.env.DEMO_USER_ID ?? USER_DESERT_ADMIN;

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

export async function authenticateByEmail(
  email: string,
  password: string,
): Promise<DemoUser | null> {
  const { verifyDemoPassword } = await import('./demo-auth');
  if (!verifyDemoPassword(email, password)) return null;
  return loadUserByEmail(email);
}
