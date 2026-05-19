import Link from 'next/link';

interface HeaderProps {
  organizationName: string;
  userEmail: string;
  userRole: string;
}

export function Header({ organizationName, userEmail, userRole }: HeaderProps) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'UAE Property SaaS';

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold text-zinc-900">
            {appName}
          </Link>
          <nav className="flex gap-4 text-sm text-zinc-600">
            <Link href="/properties" className="hover:text-zinc-900">
              Properties
            </Link>
            <Link href="/invoices" className="hover:text-zinc-900">
              Invoices
            </Link>
            <Link href="/debug" className="hover:text-zinc-900">
              Security
            </Link>
          </nav>
        </div>
        <div className="text-right text-sm">
          <p className="font-medium text-zinc-900">{organizationName}</p>
          <p className="text-zinc-500">
            {userEmail} · {userRole}
          </p>
        </div>
      </div>
    </header>
  );
}
