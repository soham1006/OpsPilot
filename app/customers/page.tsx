import NorthstarShell from "@/components/northstar/NorthstarShell";
import StatusBadge from "@/components/northstar/StatusBadge";
import { getCustomers } from "@/lib/db/northstar";

export default function CustomersPage() {
  const customers = getCustomers();

  return (
    <NorthstarShell
      title="Customers"
      description="Customer records available to Northstar operations staff."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {customers.map((customer) => (
          <article
  key={customer.id}
  className="group rounded-xl border border-black/[0.08] bg-white p-5 transition hover:border-black/[0.14] hover:shadow-[0_8px_30px_rgba(32,32,29,0.05)]"
>
  <div className="flex items-start justify-between gap-4">
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-black/25" />

        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
          {customer.id}
        </p>
      </div>

      <h2 className="mt-2 truncate text-[15px] font-semibold text-[#20201d]">
        {customer.name}
      </h2>
    </div>

    <div className="shrink-0">
      <StatusBadge value={customer.status} />
    </div>
  </div>

  <div className="mt-5 border-t border-black/[0.07] pt-4">
    <dl className="space-y-3">
      <div className="flex items-start justify-between gap-6">
        <dt className="text-[11px] uppercase tracking-[0.08em] text-black/35">
          Email
        </dt>

        <dd className="max-w-[65%] truncate text-right text-[13px] text-black/65">
          {customer.email}
        </dd>
      </div>

      <div className="flex items-start justify-between gap-6">
        <dt className="text-[11px] uppercase tracking-[0.08em] text-black/35">
          Phone
        </dt>

        <dd className="text-right text-[13px] text-black/65">
          {customer.phone ?? "—"}
        </dd>
      </div>

      <div className="flex items-start justify-between gap-6">
        <dt className="text-[11px] uppercase tracking-[0.08em] text-black/35">
          Address
        </dt>

        <dd className="max-w-[65%] text-right text-[13px] leading-5 text-black/65">
          {customer.address ?? "—"}
        </dd>
      </div>
    </dl>
  </div>
</article>
        ))}
      </div>
    </NorthstarShell>
  );
}