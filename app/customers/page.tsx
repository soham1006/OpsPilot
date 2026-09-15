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
            className="rounded-xl border border-black/10 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-black/35">
                  {customer.id}
                </p>
                <h2 className="mt-1 font-semibold">{customer.name}</h2>
              </div>

              <StatusBadge value={customer.status} />
            </div>

            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-black/40">Email</dt>
                <dd>{customer.email}</dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-black/40">Phone</dt>
                <dd>{customer.phone ?? "—"}</dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-black/40">Address</dt>
                <dd className="text-right">{customer.address ?? "—"}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </NorthstarShell>
  );
}