import type { Property } from '../types';
import { useSupabaseDataLayer } from '../database';
import { getSupabaseAdmin } from '../supabase/admin';
import { query, queryWithOrg } from '../db';

const PROPERTY_COLUMNS = `id, organization_id, name, location, unit_count, base_rent_aed, created_at`;

function mapProperty(row: Record<string, unknown>): Property {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    name: String(row.name),
    location: row.location != null ? String(row.location) : null,
    unit_count: Number(row.unit_count),
    base_rent_aed: row.base_rent_aed != null ? String(row.base_rent_aed) : null,
    created_at: String(row.created_at),
  };
}

async function supabaseProperties(organizationId: string): Promise<Property[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('properties')
    .select('id, organization_id, name, location, unit_count, base_rent_aed, created_at')
    .eq('organization_id', organizationId)
    .order('name');

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapProperty(row as Record<string, unknown>));
}

export async function getPropertiesForOrg(organizationId: string): Promise<Property[]> {
  if (useSupabaseDataLayer()) {
    return supabaseProperties(organizationId);
  }
  return query<Property>(
    `SELECT ${PROPERTY_COLUMNS} FROM properties WHERE organization_id = $1 ORDER BY name`,
    [organizationId],
  );
}

export async function getPropertiesWithRls(organizationId: string): Promise<Property[]> {
  if (useSupabaseDataLayer()) {
    return supabaseProperties(organizationId);
  }
  return queryWithOrg<Property>(
    organizationId,
    `SELECT ${PROPERTY_COLUMNS} FROM properties WHERE organization_id = $1 ORDER BY name`,
    [organizationId],
  );
}

/** INTENTIONALLY VULNERABLE — trusts client-supplied organizationId */
export async function getPropertiesInsecure(clientSuppliedOrgId: string): Promise<Property[]> {
  if (useSupabaseDataLayer()) {
    return supabaseProperties(clientSuppliedOrgId);
  }
  return query<Property>(
    `SELECT ${PROPERTY_COLUMNS} FROM properties WHERE organization_id = $1 ORDER BY name`,
    [clientSuppliedOrgId],
  );
}
