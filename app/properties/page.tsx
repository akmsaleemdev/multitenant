import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { PropertiesTable } from '@/components/PropertiesTable';
import { DbErrorBanner } from '@/components/DbErrorBanner';
import { getSession } from '@/lib/auth';
import { getPropertiesSafe } from '@/lib/safe-data';

export const dynamic = 'force-dynamic';

export default async function PropertiesPage() {
  const session = await getSession();
  const { data: properties, dbError } = await getPropertiesSafe(session.organizationId);

  return (
    <>
      <Header
        organizationName={session.organizationName}
        userEmail={session.email}
        userRole={session.role}
      />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
        <DbErrorBanner message={dbError} />
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Properties</h1>
        <Card title={`${session.organizationName} — portfolio`}>
          <PropertiesTable properties={properties} />
        </Card>
      </main>
    </>
  );
}
