import type { Property } from '@/lib/types';

export function PropertiesTable({ properties }: { properties: Property[] }) {
  if (properties.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No properties found for this organization.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-[var(--muted)]">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Location</th>
            <th className="py-2 pr-4 font-medium">Units</th>
            <th className="py-2 font-medium">Base rent (AED)</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((p) => (
            <tr key={p.id} className="border-b border-[var(--border)]/50">
              <td className="py-3 pr-4 font-medium text-[var(--text)]">{p.name}</td>
              <td className="py-3 pr-4 text-[var(--muted)]">{p.location ?? '—'}</td>
              <td className="py-3 pr-4 text-[var(--muted)]">{p.unit_count}</td>
              <td className="py-3 text-[var(--muted)]">
                {p.base_rent_aed ? Number(p.base_rent_aed).toLocaleString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
