import NorthstarShell from "@/components/northstar/NorthstarShell";
import StatusBadge from "@/components/northstar/StatusBadge";
import { getPolicies } from "@/lib/db/northstar";

export default function PoliciesPage() {
  const policies = getPolicies();

  return (
    <NorthstarShell
      title="Policies"
      description="Operational rules that govern customer-service actions."
    >
      <div className="space-y-4">
        {policies.map((policy) => (
          <article
            key={policy.id}
            className="rounded-xl border border-black/10 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-black/35">
                  {policy.category}
                </p>

                <h2 className="mt-1 text-lg font-semibold">{policy.name}</h2>
              </div>

              <StatusBadge value={policy.active ? "active" : "inactive"} />
            </div>

            <p className="mt-4 max-w-4xl text-sm leading-6 text-black/60">
              {policy.description}
            </p>

            <div className="mt-4 rounded-lg bg-[#f5f3ee] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-black/40">
                Rules
              </p>

              <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-black/65">
                {policy.rules_json}
              </pre>
            </div>
          </article>
        ))}
      </div>
    </NorthstarShell>
  );
}