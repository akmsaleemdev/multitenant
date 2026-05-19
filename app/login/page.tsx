import { Suspense } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { getDemoCredentials } from '@/lib/demo-auth';

export default function LoginPage() {
  const accounts = getDemoCredentials();
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <LoginForm accounts={accounts} />
    </Suspense>
  );
}
