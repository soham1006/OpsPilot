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
            <thead className="border-b border-black/10 bg-[#faf9f6] text-xs uppercase tracking-wider text-black/40">
              <tr>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Appointment</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Payment reference</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/8">
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  data-invoice-id={invoice.id}
                  className="hover:bg-[#faf9f6]"
                >
                  <td className="px-5 py-4 font-medium">{invoice.id}</td>

                  <td className="px-5 py-4">
                    <div>{invoice.customer_name}</div>
                    <div className="text-xs text-black/40">
                      {invoice.customer_id}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    {invoice.appointment_id ?? "—"}
                  </td>

                  <td className="px-5 py-4 font-medium">
                    {formatMoney(invoice.amount_cents, invoice.currency)}
                  </td>

                  <td className="px-5 py-4">
                    {invoice.payment_reference ?? "—"}
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