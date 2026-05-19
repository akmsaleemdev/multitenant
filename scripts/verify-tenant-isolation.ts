/**
 * Standalone verification script — run: npm run test:security
 * Requires DATABASE_URL and seeded database.
 */
import 'dotenv/config';
import { ORG_DESERT_CROWN, ORG_MARINA_VISTA } from '../lib/constants';
import { getPropertiesForOrg, getPropertiesInsecure } from '../lib/queries/properties';
import { getInvoicesForOrg, getInvoicesInsecure } from '../lib/queries/invoices';
import { isDatabaseConfigured } from '../lib/db';

async function main() {
  if (!isDatabaseConfigured()) {
    console.error('DATABASE_URL required');
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  function ok(name: string) {
    console.log(`  ✓ ${name}`);
    passed++;
  }
  function fail(name: string, detail: string) {
    console.error(`  ✗ ${name}: ${detail}`);
    failed++;
  }

  console.log('Verifying tenant isolation...\n');

  const desertProps = await getPropertiesForOrg(ORG_DESERT_CROWN);
  const marinaPropsSecure = await getPropertiesForOrg(ORG_MARINA_VISTA);
  const crossLeak = desertProps.filter((p) =>
    marinaPropsSecure.some((m) => m.id === p.id),
  );
  if (crossLeak.length === 0) {
    ok('Cross-tenant property access blocked (secure)');
  } else {
    fail('Cross-tenant property access blocked', `overlap ids: ${crossLeak.map((p) => p.id)}`);
  }

  const desertInv = await getInvoicesForOrg(ORG_DESERT_CROWN);
  const marinaInv = await getInvoicesForOrg(ORG_MARINA_VISTA);
  const invOverlap = desertInv.filter((i) => marinaInv.some((m) => m.id === i.id));
  if (invOverlap.length === 0) {
    ok('Cross-tenant invoice access blocked (secure)');
  } else {
    fail('Cross-tenant invoice access blocked', 'invoice id overlap');
  }

  const exploited = await getPropertiesInsecure(ORG_MARINA_VISTA);
  if (exploited.length > 0 && exploited[0].organization_id === ORG_MARINA_VISTA) {
    ok('Vulnerable pattern confirmed (insecure query returns victim org data)');
  } else {
    fail('Vulnerable pattern', 'expected marina properties via insecure query');
  }

  const exploitedInv = await getInvoicesInsecure(ORG_MARINA_VISTA);
  if (exploitedInv.length > 0) {
    ok('Invoice insecure query demonstrates same vulnerability class');
  } else {
    fail('Invoice insecure', 'no data returned');
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
