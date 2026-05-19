import { tryDb } from './db';
import { isDatabaseConfigured } from './database';
import { getPropertiesForOrg } from './queries/properties';
import { getInvoicesForOrg } from './queries/invoices';
import type { Property, Invoice } from './types';

export interface SafeDataResult<T> {
  data: T;
  dbError: string | null;
}

async function runSafe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<SafeDataResult<T>> {
  if (!isDatabaseConfigured()) {
    return { data: fallback, dbError: null };
  }
  try {
    const data = await fn();
    return { data, dbError: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { data: fallback, dbError: error };
  }
}

export async function getDashboardCounts(
  organizationId: string,
): Promise<SafeDataResult<{ propertyCount: number; invoiceCount: number }>> {
  const props = await runSafe(
    'properties',
    () => getPropertiesForOrg(organizationId),
    [],
  );
  if (props.dbError) {
    return { data: { propertyCount: 0, invoiceCount: 0 }, dbError: props.dbError };
  }
  const inv = await runSafe('invoices', () => getInvoicesForOrg(organizationId), []);
  if (inv.dbError) {
    return {
      data: { propertyCount: props.data.length, invoiceCount: 0 },
      dbError: inv.dbError,
    };
  }
  return {
    data: { propertyCount: props.data.length, invoiceCount: inv.data.length },
    dbError: null,
  };
}

export async function getPropertiesSafe(
  organizationId: string,
): Promise<SafeDataResult<Property[]>> {
  return runSafe('properties', () => getPropertiesForOrg(organizationId), []);
}

export async function getInvoicesSafe(
  organizationId: string,
): Promise<SafeDataResult<Invoice[]>> {
  return runSafe('invoices', () => getInvoicesForOrg(organizationId), []);
}
