import NorthstarShell from "@/components/northstar/NorthstarShell";
import StatusBadge from "@/components/northstar/StatusBadge";
import { getInvoices } from "@/lib/db/northstar";

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

export default function BillingPage() {
  const invoices = getInvoices();

  return (
    <NorthstarShell
      title="Billing"
      description="Invoices and payment records for customer accounts."
    >
      <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
  <thead className="border-b border-black/[0.08] bg-[#faf9f6]">
    <tr>
      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
        Invoice
      </th>

      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
        Customer
      </th>

      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
        Appointment
      </th>

      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
        Amount
      </th>

      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
        Payment reference
      </th>

      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
        Status
      </th>
    </tr>
  </thead>

  <tbody className="divide-y divide-black/[0.07]">
    {invoices.map((invoice) => (
      <tr
        key={invoice.id}
        data-invoice-id={invoice.id}
        className="group transition-colors hover:bg-[#faf9f6]"
      >
        <td className="px-5 py-4">
          <div className="font-semibold text-[#20201d]">
            {invoice.id}
          </div>

          <div className="mt-0.5 text-[11px] text-black/35">
            Billing record
          </div>
        </td>

        <td className="px-5 py-4">
          <div className="font-medium text-[#20201d]">
            {invoice.customer_name}
          </div>

          <div className="mt-0.5 text-[11px] text-black/40">
            {invoice.customer_id}
          </div>
        </td>

        <td className="px-5 py-4">
          <span className="text-[13px] text-black/65">
            {invoice.appointment_id ?? "—"}
          </span>
        </td>

        <td className="px-5 py-4">
          <div className="font-semibold text-[#20201d]">
            {formatMoney(invoice.amount_cents, invoice.currency)}
          </div>

          <div className="mt-0.5 text-[11px] uppercase tracking-[0.06em] text-black/35">
            {invoice.currency}
          </div>
        </td>

        <td className="px-5 py-4">
          <span className="font-mono text-[12px] text-black/60">
            {invoice.payment_reference ?? "—"}
          </span>
        </td>

        <td className="px-5 py-4">
          <StatusBadge value={invoice.status} />
        </td>
      </tr>
    ))}
  </tbody>
</table>
        </div>
      </div>
    </NorthstarShell>
  );
}