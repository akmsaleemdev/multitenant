import type { Invoice } from '@/lib/types';

const statusStyles: Record<string, string> = {
  paid: 'bg-emerald-900/40 text-emerald-200',
  pending: 'bg-amber-900/40 text-amber-200',
  overdue: 'bg-red-900/40 text-red-200',
};

export function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No invoices for this organization.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-[var(--muted)]">
            <th className="py-2 pr-4 font-medium">Tenant</th>
            <th className="py-2 pr-4 font-medium">Amount (AED)</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 font-medium">Due</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-[var(--border)]/50">
              <td className="py-3 pr-4 font-medium text-[var(--text)]">
                {inv.tenant_name ?? inv.tenant_id.slice(0, 8)}
              </td>
              <td className="py-3 pr-4 text-[var(--muted)]">
                {Number(inv.amount_aed).toLocaleString()}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[inv.status] ?? ''}`}
                >
                  {inv.status}
                </span>
              </td>
              <td className="py-3 text-[var(--muted)]">{inv.due_date ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
