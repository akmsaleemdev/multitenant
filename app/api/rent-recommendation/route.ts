import { NextRequest } from 'next/server';
import { recommendRent } from '@/lib/rent-recommendation';
import { apiError, apiSuccess } from '@/lib/api-utils';

/** POST /api/rent-recommendation — heuristic stub (not ML) */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 'INVALID_JSON');
  }

  const { base_rent_aed, unit_count, location, occupied_units } = body as Record<
    string,
    unknown
  >;

  if (
    typeof base_rent_aed !== 'number' ||
    typeof unit_count !== 'number' ||
    typeof occupied_units !== 'number'
  ) {
    return apiError(
      'base_rent_aed, unit_count, occupied_units required as numbers',
      'VALIDATION_ERROR',
    );
  }

  const recommendation = recommendRent({
    base_rent_aed,
    unit_count,
    location: typeof location === 'string' ? location : null,
    occupied_units,
  });

  return apiSuccess(recommendation, 'n/a');
}
