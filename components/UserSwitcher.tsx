'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { USER_DESERT_ADMIN, USER_MARINA_ADMIN } from '@/lib/constants';

const OPTIONS = [
  { id: USER_DESERT_ADMIN, label: 'Desert Crown — Admin' },
  { id: USER_MARINA_ADMIN, label: 'Marina Vista — Admin' },
];

export function UserSwitcher({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function switchUser(userId: string) {
    setLoading(true);
    await fetch('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          disabled={loading || opt.id === currentUserId}
          onClick={() => switchUser(opt.id)}
          className={`rounded-md px-3 py-1.5 text-sm ${
            opt.id === currentUserId
              ? 'bg-zinc-900 text-white'
              : 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
