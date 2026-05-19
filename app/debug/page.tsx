import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { SecurityPanel } from '@/components/SecurityPanel';
import { UserSwitcher } from '@/components/UserSwitcher';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
  const session = await getSession();

  return (
    <>
      <Header
        organizationName={session.organizationName}
        userEmail={session.email}
        userRole={session.role}
      />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900">Security debug panel</h1>
        <p className="mb-6 text-sm text-zinc-600">
          Org ID: <code className="font-mono text-xs">{session.organizationId}</code>
        </p>

        <Card title="Demo user" className="mb-6">
          <UserSwitcher currentUserId={session.id} />
        </Card>

        <Card title="Tenant isolation tests">
          <SecurityPanel currentOrgId={session.organizationId} />
        </Card>
      </main>
    </>
  );
}
