'use client';

import { useState } from 'react';
import type { RentRecommendation } from '@/lib/types';

export function RentRecommendationForm() {
  const [result, setResult] = useState<RentRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/rent-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_rent_aed: Number(fd.get('base_rent_aed')),
        unit_count: Number(fd.get('unit_count')),
        occupied_units: Number(fd.get('occupied_units')),
        location: fd.get('location') || null,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? 'Request failed');
      return;
    }
    setResult(json.data as RentRecommendation);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Base rent (AED)
          <input
            name="base_rent_aed"
            type="number"
            defaultValue={12000}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Unit count
          <input
            name="unit_count"
            type="number"
            defaultValue={48}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Occupied units
          <input
            name="occupied_units"
            type="number"
            defaultValue={42}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Location
          <input
            name="location"
            type="text"
            defaultValue="Dubai Marina"
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="sm:col-span-2 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
        >
          Get recommendation (heuristic)
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="rounded-md bg-zinc-50 p-4 text-sm">
          <p className="font-semibold text-zinc-900">
            Recommended: AED {result.recommended_rent_aed.toLocaleString()}
          </p>
          <p className="mt-1 text-zinc-600">{result.explanation}</p>
        </div>
      )}
    </div>
  );
}
