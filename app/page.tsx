import Link from 'next/link';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { UserSwitcher } from '@/components/UserSwitcher';
import { RentRecommendationForm } from '@/components/RentRecommendationForm';
import { getSession } from '@/lib/auth';
import { isDatabaseConfigured } from '@/lib/db';
import { getPropertiesForOrg } from '@/lib/queries/properties';
import { getInvoicesForOrg } from '@/lib/queries/invoices';

export default async function HomePage() {
  const session = await getSession();
  const dbReady = isDatabaseConfigured();

  let propertyCount = 0;
  let invoiceCount = 0;
  if (dbReady) {
    const [properties, invoices] = await Promise.all([
      getPropertiesForOrg(session.organizationId),
      getInvoicesForOrg(session.organizationId),
    ]);
    propertyCount = properties.length;
    invoiceCount = invoices.length;
  }

  return (
    <>
      <Header
        organizationName={session.organizationName}
        userEmail={session.email}
        userRole={session.role}
      />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
        {!dbReady && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Set <code className="font-mono">DATABASE_URL</code> and run{' '}
            <code className="font-mono">npm run db:setup</code> to enable live data.
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-zinc-600">
            Multi-tenant UAE property management demo — organization context from session only.
          </p>
        </div>

        <Card title="Switch demo user" className="mb-6">
          <UserSwitcher currentUserId={session.id} />
        </Card>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/properties"
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm hover:border-zinc-300"
          >
            <p className="text-3xl font-semibold text-zinc-900">{propertyCount}</p>
            <p className="text-sm text-zinc-500">Properties in your org</p>
          </Link>
          <Link
            href="/invoices"
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm hover:border-zinc-300"
          >
            <p className="text-3xl font-semibold text-zinc-900">{invoiceCount}</p>
            <p className="text-sm text-zinc-500">Invoices in your org</p>
          </Link>
        </div>

        <Card title="Rent recommendation (heuristic stub)" className="mb-6">
          <RentRecommendationForm />
        </Card>
      </main>
    </>
  );
}
