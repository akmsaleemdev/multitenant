'use client';

import { useState } from 'react';
import { ORG_DESERT_CROWN, ORG_MARINA_VISTA } from '@/lib/constants';

export function SecurityPanel({ currentOrgId }: { currentOrgId: string }) {
  const otherOrgId =
    currentOrgId === ORG_DESERT_CROWN ? ORG_MARINA_VISTA : ORG_DESERT_CROWN;
  const [secureResult, setSecureResult] = useState<string>('');
  const [insecureResult, setInsecureResult] = useState<string>('');

  async function testSecure() {
    const res = await fetch('/api/properties');
    const json = await res.json();
    setSecureResult(JSON.stringify(json.meta, null, 2));
  }

  async function testInsecure() {
    const res = await fetch(`/api/properties/insecure?organizationId=${otherOrgId}`);
    const json = await res.json();
    setInsecureResult(
      `Returned ${json.meta?.count ?? 0} properties for org ${json.meta?.organizationId}`,
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted)]">
        Demo cross-tenant exploit: while logged into your org, the insecure endpoint accepts{' '}
        <code className="rounded bg-[var(--bg)] px-1 text-[var(--jazz)]">
          ?organizationId={otherOrgId}
        </code>{' '}
        and returns the other tenant&apos;s data.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={testSecure}
          className="rounded-md bg-emerald-800 px-4 py-2 text-sm text-emerald-100"
        >
          Test secure /api/properties
        </button>
        <button
          type="button"
          onClick={testInsecure}
          className="rounded-md bg-red-900 px-4 py-2 text-sm text-red-100"
        >
          Test insecure endpoint (exploit)
        </button>
      </div>
      {secureResult && (
        <pre className="rounded bg-emerald-950/50 p-3 text-xs text-emerald-200">{secureResult}</pre>
      )}
      {insecureResult && (
        <pre className="rounded bg-red-950/50 p-3 text-xs text-red-200">{insecureResult}</pre>
      )}
    </div>
  );
}
