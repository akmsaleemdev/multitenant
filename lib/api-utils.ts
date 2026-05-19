import { NextResponse } from 'next/server';
import type { ApiError } from './types';
import { logger } from './logger';

export function apiSuccess<T>(data: T, organizationId: string) {
  const count = Array.isArray(data) ? data.length : 1;
  return NextResponse.json({
    data,
    meta: { organizationId, count },
  });
}

export function apiError(message: string, code: string, status = 400) {
  logger.warn('API error', { code, message });
  return NextResponse.json({ error: message, code } satisfies ApiError, { status });
}

export function apiServerError(message: string) {
  logger.error('API server error', { message });
  return NextResponse.json(
    { error: message, code: 'INTERNAL_ERROR' } satisfies ApiError,
    { status: 500 },
  );
}
