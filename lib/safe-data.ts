import { tryDb, isDatabaseConfigured } from './db';
import { getPropertiesForOrg } from './queries/properties';
import { getInvoicesForOrg } from './queries/invoices';
import type { Property, Invoice } from './types';

export interface SafeDataResult<T> {
  data: T;
  dbError: string | null;
}

export async function getDashboardCounts(
  organizationId: string,
): Promise<SafeDataResult<{ propertyCount: number; invoiceCount: number }>> {
  if (!isDatabaseConfigured()) {
    return { data: { propertyCount: 0, invoiceCount: 0 }, dbError: null };
  }

  const propsResult = await tryDb(
    'getPropertiesForOrg',
    () => getPropertiesForOrg(organizationId),
    [],
  );
  if (!propsResult.ok) {
    return {
      data: { propertyCount: 0, invoiceCount: 0 },
      dbError: propsResult.error,
    };
  }

  const invResult = await tryDb(
    'getInvoicesForOrg',
    () => getInvoicesForOrg(organizationId),
    [],
  );
  if (!invResult.ok) {
    return {
      data: { propertyCount: propsResult.data.length, invoiceCount: 0 },
      dbError: invResult.error,
    };
  }

  return {
    data: {
      propertyCount: propsResult.data.length,
      invoiceCount: invResult.data.length,
    },
    dbError: null,
  };
}

export async function getPropertiesSafe(
  organizationId: string,
): Promise<SafeDataResult<Property[]>> {
  if (!isDatabaseConfigured()) {
    return { data: [], dbError: null };
  }
  const result = await tryDb(
    'getPropertiesForOrg',
    () => getPropertiesForOrg(organizationId),
    [],
  );
  if (!result.ok) return { data: [], dbError: result.error };
  return { data: result.data, dbError: null };
}

export async function getInvoicesSafe(
  organizationId: string,
): Promise<SafeDataResult<Invoice[]>> {
  if (!isDatabaseConfigured()) {
    return { data: [], dbError: null };
  }
  const result = await tryDb(
    'getInvoicesForOrg',
    () => getInvoicesForOrg(organizationId),
    [],
  );
  if (!result.ok) return { data: [], dbError: result.error };
  return { data: result.data, dbError: null };
}
