'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { DemoCredential } from '@/lib/demo-auth';

export function LoginForm({ accounts }: { accounts: DemoCredential[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('admin@desertcrown.ae');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? 'Login failed');
      return;
    }
    router.push(searchParams.get('from') || '/');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-[var(--text)]">
          {process.env.NEXT_PUBLIC_APP_NAME ?? 'UAE Property SaaS'}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Sign in to your organization</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block text-sm text-[var(--muted)]">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)]"
              required
            />
          </label>
          <label className="block text-sm text-[var(--muted)]">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)]"
              required
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--primary)] py-2.5 text-sm font-medium text-[var(--text)] hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 border-t border-[var(--border)] pt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Demo accounts
          </p>
          <ul className="space-y-2 text-sm">
            {accounts.map((c) => (
              <li key={c.email}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(c.email);
                    setPassword(c.password);
                  }}
                  className="w-full rounded-md px-2 py-1.5 text-left text-[var(--text)] hover:bg-[var(--bg)]"
                >
                  <span className="font-medium">{c.label}</span>
                  <span className="mt-0.5 block font-mono text-xs text-[var(--muted)]">
                    {c.email} / {c.password}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
