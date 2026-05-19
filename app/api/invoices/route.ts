import { getSession } from '@/lib/auth';
import { isDatabaseConfigured } from '@/lib/db';
import { apiError, apiServerError, apiSuccess } from '@/lib/api-utils';
import { logger } from '@/lib/logger';
import { getInvoicesWithRls } from '@/lib/queries/invoices';

/** GET /api/invoices — secure: org from session + RLS */
export async function GET() {
  const route = '/api/invoices';

  if (!isDatabaseConfigured()) {
    return apiError('Database not configured', 'DB_NOT_CONFIGURED', 503);
  }

  try {
    const session = await getSession();
    const organizationId = session.organizationId;

    logger.info('Fetching invoices (secure)', {
      route,
      userId: session.id,
      organizationId,
    });

    const invoices = await getInvoicesWithRls(organizationId);

    return apiSuccess(invoices, organizationId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return apiServerError(message);
  }
}
