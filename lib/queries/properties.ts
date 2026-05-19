import type { Property } from '../types';
import { query, queryWithOrg } from '../db';

const PROPERTY_COLUMNS = `id, organization_id, name, location, unit_count, base_rent_aed, created_at`;

/** SECURE: always filters by server-derived organization_id */
export async function getPropertiesForOrg(organizationId: string): Promise<Property[]> {
  return query<Property>(
    `SELECT ${PROPERTY_COLUMNS}
     FROM properties
     WHERE organization_id = $1
     ORDER BY name`,
    [organizationId],
  );
}

/** SECURE with RLS: uses session org context + explicit filter (defense in depth) */
export async function getPropertiesWithRls(organizationId: string): Promise<Property[]> {
  return queryWithOrg<Property>(
    organizationId,
    `SELECT ${PROPERTY_COLUMNS}
     FROM properties
     WHERE organization_id = $1
     ORDER BY name`,
    [organizationId],
  );
}

/**
 * INTENTIONALLY VULNERABLE — for security demo only.
 * Trusts client-supplied organizationId without verifying against session.
 * Exploit: GET /api/properties/insecure?organizationId=<victim-org-uuid>
 */
export async function getPropertiesInsecure(
  clientSuppliedOrgId: string,
): Promise<Property[]> {
  return query<Property>(
    `SELECT ${PROPERTY_COLUMNS}
     FROM properties
     WHERE organization_id = $1
     ORDER BY name`,
    [clientSuppliedOrgId],
  );
}
