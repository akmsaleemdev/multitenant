import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { isDatabaseConfigured } from '@/lib/database';
import { apiError, apiServerError, apiSuccess } from '@/lib/api-utils';
import { logger } from '@/lib/logger';
import { getInvoicesInsecure } from '@/lib/queries/invoices';

/**
 * INTENTIONALLY VULNERABLE — trusts ?organizationId= from client.
 * See /api/properties/insecure for exploit documentation.
 */
export async function GET(request: NextRequest) {
  const route = '/api/invoices/insecure';
  const clientOrgId = request.nextUrl.searchParams.get('organizationId');

  if (!isDatabaseConfigured()) {
    return apiError('Database not configured', 'DB_NOT_CONFIGURED', 503);
  }
  if (!clientOrgId) {
    return apiError('organizationId required', 'MISSING_ORG_ID');
  }

  try {
    const session = await getSession();
    logger.warn('INSECURE: client org used for invoice query', {
      route,
      userId: session.id,
      sessionOrganizationId: session.organizationId,
      clientSuppliedOrganizationId: clientOrgId,
    });

    const invoices = await getInvoicesInsecure(clientOrgId);
    return apiSuccess(invoices, clientOrgId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return apiServerError(message);
  }
}
