import type { Invoice } from '@/lib/types';

const statusStyles: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  overdue: 'bg-red-50 text-red-700',
};

export function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return <p className="text-sm text-zinc-500">No invoices for this organization.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-zinc-500">
            <th className="py-2 pr-4 font-medium">Tenant</th>
            <th className="py-2 pr-4 font-medium">Amount (AED)</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 font-medium">Due</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-zinc-50">
              <td className="py-3 pr-4 font-medium text-zinc-900">
                {inv.tenant_name ?? inv.tenant_id.slice(0, 8)}
              </td>
              <td className="py-3 pr-4 text-zinc-600">
                {Number(inv.amount_aed).toLocaleString()}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[inv.status] ?? ''}`}
                >
                  {inv.status}
                </span>
              </td>
              <td className="py-3 text-zinc-600">{inv.due_date ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
