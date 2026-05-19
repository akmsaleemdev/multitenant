import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { InvoicesTable } from '@/components/InvoicesTable';
import { DbErrorBanner } from '@/components/DbErrorBanner';
import { getSession } from '@/lib/auth';
import { getInvoicesSafe } from '@/lib/safe-data';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  const session = await getSession();
  const { data: invoices, dbError } = await getInvoicesSafe(session.organizationId);

  return (
    <>
      <Header
        organizationName={session.organizationName}
        userEmail={session.email}
        userRole={session.role}
      />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
        <DbErrorBanner message={dbError} />
        <h1 className="mb-6 text-2xl font-semibold text-[var(--text)]">Invoices</h1>
        <Card title={`${session.organizationName} — billing`}>
          <InvoicesTable invoices={invoices} />
        </Card>
      </main>
    </>
  );
}
