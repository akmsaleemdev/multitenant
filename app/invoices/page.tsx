import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { InvoicesTable } from '@/components/InvoicesTable';
import { getSession } from '@/lib/auth';
import { isDatabaseConfigured } from '@/lib/db';
import { getInvoicesForOrg } from '@/lib/queries/invoices';

export default async function InvoicesPage() {
  const session = await getSession();
  const invoices = isDatabaseConfigured()
    ? await getInvoicesForOrg(session.organizationId)
    : [];

  return (
    <>
      <Header
        organizationName={session.organizationName}
        userEmail={session.email}
        userRole={session.role}
      />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Invoices</h1>
        <Card title={`${session.organizationName} — billing`}>
          <InvoicesTable invoices={invoices} />
        </Card>
      </main>
    </>
  );
}
