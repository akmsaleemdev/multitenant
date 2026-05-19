import type { Invoice } from '../types';
import { useSupabaseDataLayer } from '../database';
import { getSupabaseAdmin } from '../supabase/admin';
import { query, queryWithOrg } from '../db';

function mapInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    tenant_id: String(row.tenant_id),
    amount_aed: String(row.amount_aed),
    status: row.status as Invoice['status'],
    due_date: row.due_date != null ? String(row.due_date) : null,
    created_at: String(row.created_at),
    tenant_name: row.tenant_name != null ? String(row.tenant_name) : undefined,
  };
}

async function supabaseInvoices(organizationId: string): Promise<Invoice[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('invoices')
    .select(
      `id, organization_id, tenant_id, amount_aed, status, due_date, created_at,
       tenants!inner(full_name)`,
    )
    .eq('organization_id', organizationId)
    .order('due_date', { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const tenants = row.tenants as { full_name: string } | { full_name: string }[] | null;
    const tenantName = Array.isArray(tenants) ? tenants[0]?.full_name : tenants?.full_name;
    return mapInvoice({
      ...row,
      tenant_name: tenantName,
    } as Record<string, unknown>);
  });
}

const INVOICE_SELECT = `
  SELECT i.id, i.organization_id, i.tenant_id, i.amount_aed::text, i.status,
         i.due_date::text, i.created_at::text, t.full_name AS tenant_name
  FROM invoices i
  JOIN tenants t ON t.id = i.tenant_id
`;

export async function getInvoicesForOrg(organizationId: string): Promise<Invoice[]> {
  if (useSupabaseDataLayer()) {
    return supabaseInvoices(organizationId);
  }
  return query<Invoice>(
    `${INVOICE_SELECT} WHERE i.organization_id = $1 ORDER BY i.due_date DESC NULLS LAST`,
    [organizationId],
  );
}

export async function getInvoicesWithRls(organizationId: string): Promise<Invoice[]> {
  if (useSupabaseDataLayer()) {
    return supabaseInvoices(organizationId);
  }
  return queryWithOrg<Invoice>(
    organizationId,
    `${INVOICE_SELECT} WHERE i.organization_id = $1 ORDER BY i.due_date DESC NULLS LAST`,
    [organizationId],
  );
}

export async function getInvoicesInsecure(clientSuppliedOrgId: string): Promise<Invoice[]> {
  if (useSupabaseDataLayer()) {
    return supabaseInvoices(clientSuppliedOrgId);
  }
  return query<Invoice>(
    `${INVOICE_SELECT} WHERE i.organization_id = $1 ORDER BY i.due_date DESC NULLS LAST`,
    [clientSuppliedOrgId],
  );
}
