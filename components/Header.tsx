import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

interface HeaderProps {
  organizationName: string;
  userEmail: string;
  userRole: string;
}

export function Header({ organizationName, userEmail, userRole }: HeaderProps) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'UAE Property SaaS';

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold text-[var(--text)]">
            {appName}
          </Link>
          <nav className="flex gap-4 text-sm text-[var(--muted)]">
            <Link href="/properties" className="hover:text-[var(--text)]">
              Properties
            </Link>
            <Link href="/invoices" className="hover:text-[var(--text)]">
              Invoices
            </Link>
            <Link href="/debug" className="hover:text-[var(--text)]">
              Security
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-right text-sm">
          <div>
            <p className="font-medium text-[var(--text)]">{organizationName}</p>
            <p className="text-[var(--muted)]">
              {userEmail} · {userRole}
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
