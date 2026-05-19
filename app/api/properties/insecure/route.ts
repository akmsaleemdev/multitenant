import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { isDatabaseConfigured } from '@/lib/db';
import { apiError, apiServerError, apiSuccess } from '@/lib/api-utils';
import { logger } from '@/lib/logger';
import { getPropertiesInsecure } from '@/lib/queries/properties';

/**
 * GET /api/properties/insecure?organizationId=<uuid>
 *
 * INTENTIONALLY VULNERABLE — DO NOT USE IN PRODUCTION.
 *
 * Bug: Accepts client-supplied organizationId and queries that org's data
 * without verifying it matches the authenticated user's organization.
 *
 * Exploit path:
 * 1. Log in as Desert Crown admin (org ...101)
 * 2. Request GET /api/properties/insecure?organizationId=11111111-1111-1111-1111-111111111102
 * 3. Receive Marina Vista properties (cross-tenant data leak)
 */
export async function GET(request: NextRequest) {
  const route = '/api/properties/insecure';

  if (!isDatabaseConfigured()) {
    return apiError('Database not configured', 'DB_NOT_CONFIGURED', 503);
  }

  const clientOrgId = request.nextUrl.searchParams.get('organizationId');
  if (!clientOrgId) {
    return apiError(
      'organizationId query param required (demo vulnerability)',
      'MISSING_ORG_ID',
    );
  }

  try {
    const session = await getSession();

    // VULNERABILITY: we log session org but IGNORE it for the query
    logger.warn('INSECURE: using client-supplied organizationId', {
      route,
      userId: session.id,
      sessionOrganizationId: session.organizationId,
      clientSuppliedOrganizationId: clientOrgId,
    });

    const properties = await getPropertiesInsecure(clientOrgId);

    return apiSuccess(properties, clientOrgId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return apiServerError(message);
  }
}
