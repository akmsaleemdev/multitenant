import Link from 'next/link';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { UserSwitcher } from '@/components/UserSwitcher';
import { RentRecommendationForm } from '@/components/RentRecommendationForm';
import { DbErrorBanner } from '@/components/DbErrorBanner';
import { getSession } from '@/lib/auth';
import { isDatabaseConfigured } from '@/lib/database';
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
          <div className="mb-6 rounded-lg border border-amber-900/40 bg-amber-950/30 p-4 text-sm text-amber-100">
            Set <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> and{' '}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> on Vercel, then redeploy.
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--text)]">Dashboard</h1>
          <p className="mt-1 text-[var(--muted)]">
            Multi-tenant UAE property management demo — organization context from session only.
          </p>
        </div>

        <Card title="Switch demo user" className="mb-6">
          <UserSwitcher currentUserId={session.id} />
        </Card>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/properties"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm hover:border-[var(--primary)]"
          >
            <p className="text-3xl font-semibold text-[var(--text)]">{counts.propertyCount}</p>
            <p className="text-sm text-[var(--muted)]">Properties in your org</p>
          </Link>
          <Link
            href="/invoices"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm hover:border-[var(--primary)]"
          >
            <p className="text-3xl font-semibold text-[var(--text)]">{counts.invoiceCount}</p>
            <p className="text-sm text-[var(--muted)]">Invoices in your org</p>
          </Link>
        </div>

        <Card title="Rent recommendation (heuristic stub)" className="mb-6">
          <RentRecommendationForm />
        </Card>
      </main>
    </>
  );
}
