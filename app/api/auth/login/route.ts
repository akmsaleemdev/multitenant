import { NextRequest, NextResponse } from 'next/server';
import { authenticateByEmail } from '@/lib/auth';
import { SESSION_COOKIE } from '@/lib/constants';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password ?? '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const user = await authenticateByEmail(email, password);
  if (!user) {
    logger.warn('Login failed', { email });
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  logger.info('Login success', { userId: user.id, email: user.email });

  const response = NextResponse.json({
    ok: true,
    user: { email: user.email, organizationName: user.organizationName, role: user.role },
  });
  response.cookies.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
