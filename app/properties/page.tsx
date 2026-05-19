import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { PropertiesTable } from '@/components/PropertiesTable';
import { getSession } from '@/lib/auth';
import { isDatabaseConfigured } from '@/lib/db';
import { getPropertiesForOrg } from '@/lib/queries/properties';

export default async function PropertiesPage() {
  const session = await getSession();
  const properties = isDatabaseConfigured()
    ? await getPropertiesForOrg(session.organizationId)
    : [];

  return (
    <>
      <Header
        organizationName={session.organizationName}
        userEmail={session.email}
        userRole={session.role}
      />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Properties</h1>
        <Card title={`${session.organizationName} — portfolio`}>
          <PropertiesTable properties={properties} />
        </Card>
      </main>
    </>
  );
}
