'use client';

import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-md border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--text)]"
    >
      Log out
    </button>
  );
}
