import type { Invoice } from '../types';
import { query, queryWithOrg } from '../db';

const INVOICE_SELECT = `
  SELECT i.id, i.organization_id, i.tenant_id, i.amount_aed::text, i.status,
         i.due_date::text, i.created_at::text, t.full_name AS tenant_name
  FROM invoices i
  JOIN tenants t ON t.id = i.tenant_id
`;

/** SECURE: scoped to authenticated user's organization */
export async function getInvoicesForOrg(organizationId: string): Promise<Invoice[]> {
  return query<Invoice>(
    `${INVOICE_SELECT}
     WHERE i.organization_id = $1
     ORDER BY i.due_date DESC NULLS LAST`,
    [organizationId],
  );
}

export async function getInvoicesWithRls(organizationId: string): Promise<Invoice[]> {
  return queryWithOrg<Invoice>(
    organizationId,
    `${INVOICE_SELECT}
     WHERE i.organization_id = $1
     ORDER BY i.due_date DESC NULLS LAST`,
    [organizationId],
  );
}

/**
 * INTENTIONALLY VULNERABLE — trusts client organizationId.
 * Exploit: cross-tenant invoice enumeration via query param.
 */
export async function getInvoicesInsecure(clientSuppliedOrgId: string): Promise<Invoice[]> {
  return query<Invoice>(
    `${INVOICE_SELECT}
     WHERE i.organization_id = $1
     ORDER BY i.due_date DESC NULLS LAST`,
    [clientSuppliedOrgId],
  );
}
