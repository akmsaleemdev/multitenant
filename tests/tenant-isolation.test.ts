import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import {
  ORG_DESERT_CROWN,
  ORG_MARINA_VISTA,
  USER_DESERT_ADMIN,
} from '@/lib/constants';
import { getPropertiesForOrg, getPropertiesInsecure } from '@/lib/queries/properties';
import { getInvoicesForOrg, getInvoicesInsecure } from '@/lib/queries/invoices';
import { isDatabaseConfigured } from '@/lib/db';

const dbReady = isDatabaseConfigured();

describe.skipIf(!dbReady)('Tenant isolation (requires DATABASE_URL)', () => {
  beforeAll(async () => {
    if (!dbReady) return;
  });

  it('Cross-tenant property access blocked (secure query)', async () => {
    const desertProperties = await getPropertiesForOrg(ORG_DESERT_CROWN);
    const marinaProperties = await getPropertiesForOrg(ORG_MARINA_VISTA);

    expect(desertProperties.length).toBeGreaterThan(0);
    expect(marinaProperties.length).toBeGreaterThan(0);

    const desertIds = new Set(desertProperties.map((p) => p.id));
    const marinaIds = new Set(marinaProperties.map((p) => p.id));

    for (const id of desertIds) {
      expect(marinaIds.has(id)).toBe(false);
    }

    for (const p of desertProperties) {
      expect(p.organization_id).toBe(ORG_DESERT_CROWN);
    }
    for (const p of marinaProperties) {
      expect(p.organization_id).toBe(ORG_MARINA_VISTA);
    }
  });

  it('Cross-tenant invoice access blocked (secure query)', async () => {
    const desertInvoices = await getInvoicesForOrg(ORG_DESERT_CROWN);
    const marinaInvoices = await getInvoicesForOrg(ORG_MARINA_VISTA);

    expect(desertInvoices.every((i) => i.organization_id === ORG_DESERT_CROWN)).toBe(true);
    expect(marinaInvoices.every((i) => i.organization_id === ORG_MARINA_VISTA)).toBe(true);

    const desertIds = new Set(desertInvoices.map((i) => i.id));
    for (const inv of marinaInvoices) {
      expect(desertIds.has(inv.id)).toBe(false);
    }
  });

  it('Insecure endpoint pattern leaks cross-tenant properties (demonstrates vulnerability)', async () => {
    // Simulates Desert Crown user passing Marina org ID — insecure API trusts it
    const leaked = await getPropertiesInsecure(ORG_MARINA_VISTA);

    expect(leaked.length).toBeGreaterThan(0);
    expect(leaked.every((p) => p.organization_id === ORG_MARINA_VISTA)).toBe(true);
    // Secure code must NEVER call getPropertiesInsecure with client input
  });

  it('Secure scope never returns other org when session org is Desert Crown', async () => {
    const sessionOrgId = ORG_DESERT_CROWN;
    const properties = await getPropertiesForOrg(sessionOrgId);

    expect(properties.every((p) => p.organization_id === sessionOrgId)).toBe(true);
    expect(properties.some((p) => p.name.includes('Marina Bay'))).toBe(false);
  });
});

describe('Tenant isolation (unit — no DB)', () => {
  it('Demo user constants are distinct orgs', () => {
    expect(ORG_DESERT_CROWN).not.toBe(ORG_MARINA_VISTA);
    expect(USER_DESERT_ADMIN).toBeTruthy();
  });
});
