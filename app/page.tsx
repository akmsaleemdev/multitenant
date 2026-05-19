import Link from 'next/link';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { UserSwitcher } from '@/components/UserSwitcher';
import { RentRecommendationForm } from '@/components/RentRecommendationForm';
import { DbErrorBanner } from '@/components/DbErrorBanner';
import { getSession } from '@/lib/auth';
import { isDatabaseConfigured } from '@/lib/db';
import { getDashboardCounts } from '@/lib/safe-data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();
  const dbReady = isDatabaseConfigured();
  const { data: counts, dbError } = await getDashboardCounts(session.organizationId);

  return (
    <>
      <Header
        organizationName={session.organizationName}
        userEmail={session.email}
        userRole={session.role}
      />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
        <DbErrorBanner message={dbError} />

        {!dbReady && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Set <code className="font-mono">DATABASE_URL</code> on Vercel (Supabase pooler URI with
            URL-encoded password) and run SQL seed scripts.
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
            <p className="text-3xl font-semibold text-zinc-900">{counts.propertyCount}</p>
            <p className="text-sm text-zinc-500">Properties in your org</p>
          </Link>
          <Link
            href="/invoices"
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm hover:border-zinc-300"
          >
            <p className="text-3xl font-semibold text-zinc-900">{counts.invoiceCount}</p>
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
