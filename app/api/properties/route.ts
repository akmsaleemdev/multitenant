import { getSession } from '@/lib/auth';
import { isDatabaseConfigured } from '@/lib/db';
import { apiError, apiServerError, apiSuccess } from '@/lib/api-utils';
import { logger } from '@/lib/logger';
import { getPropertiesWithRls } from '@/lib/queries/properties';

/** GET /api/properties — secure: org derived from session only */
export async function GET() {
  const route = '/api/properties';

  if (!isDatabaseConfigured()) {
    return apiError('Database not configured', 'DB_NOT_CONFIGURED', 503);
  }

  try {
    const session = await getSession();
    const organizationId = session.organizationId;

    logger.info('Fetching properties (secure)', {
      route,
      userId: session.id,
      organizationId,
    });

    const properties = await getPropertiesWithRls(organizationId);

    logger.info('Properties fetched', {
      route,
      organizationId,
      count: properties.length,
    });

    return apiSuccess(properties, organizationId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return apiServerError(message);
  }
}
