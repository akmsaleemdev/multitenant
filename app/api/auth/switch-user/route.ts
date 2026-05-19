import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, DEMO_USERS } from '@/lib/constants';
import { logger } from '@/lib/logger';

/** POST /api/auth/switch-user — demo only: set session cookie */
export async function POST(request: NextRequest) {
  let userId: string;
  try {
    const body = (await request.json()) as { userId?: string };
    userId = body.userId ?? '';
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!DEMO_USERS.includes(userId as (typeof DEMO_USERS)[number])) {
    return NextResponse.json(
      { error: 'userId must be a seeded demo admin', allowed: [...DEMO_USERS] },
      { status: 400 },
    );
  }

  logger.info('Demo user switch', { userId });

  const response = NextResponse.json({ ok: true, userId });
  response.cookies.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
