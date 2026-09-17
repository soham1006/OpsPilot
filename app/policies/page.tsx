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
  className="group rounded-xl border border-black/[0.08] bg-white p-5 transition hover:border-black/[0.14] hover:shadow-[0_8px_30px_rgba(32,32,29,0.05)]"
>
  <div className="flex items-start justify-between gap-5">
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-black/25" />

        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
          {policy.category}
        </p>
      </div>

      <h2 className="mt-2 text-[15px] font-semibold text-[#20201d]">
        {policy.name}
      </h2>

      <p className="mt-0.5 text-[11px] text-black/35">
        Policy {policy.id}
      </p>
    </div>

    <div className="shrink-0">
      <StatusBadge value={policy.active ? "active" : "inactive"} />
    </div>
  </div>

  <div className="mt-5 border-t border-black/[0.07] pt-4">
    <p className="max-w-4xl text-[13px] leading-6 text-black/60">
      {policy.description}
    </p>
  </div>

  <div className="mt-4 overflow-hidden rounded-lg border border-black/[0.07] bg-[#faf9f6]">
    <div className="border-b border-black/[0.06] px-4 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/40">
        Rules
      </p>
    </div>

    <pre className="overflow-x-auto whitespace-pre-wrap px-4 py-4 font-mono text-[11px] leading-5 text-black/60">
      {policy.rules_json}
    </pre>
  </div>
</article>
        ))}
      </div>
    </NorthstarShell>
  );
}