import NorthstarShell from "@/components/northstar/NorthstarShell";
import AuditTimeline from "@/components/audit/AuditTimeline";
import {
  findAuditLogs,
} from "@/lib/db/repositories/audit-logs";

export default function AuditPage() {
  const logs = findAuditLogs(100);

  const blockedCount =
    logs.filter(
      (log) =>
        log.policyDecision === "BLOCK" ||
        log.action === "ACTION_BLOCKED",
    ).length;

  const approvalCount =
    logs.filter(
      (log) =>
        log.approvalStatus === "PENDING" ||
        log.action === "APPROVAL_REQUESTED",
    ).length;

  const verifiedCount =
    logs.filter(
      (log) =>
        log.verificationStatus === "VERIFIED",
    ).length;

  return (
  <NorthstarShell
    title="Audit timeline"
    description="Security and operational audit history."
  >
    <div className="space-y-8">
      <div>
        <p className="max-w-2xl text-[13px] leading-6 text-black/55">
          A chronological record of operational decisions,
          executions, approvals, and verification events.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-black/[0.08] bg-white p-5 transition hover:border-black/[0.14]">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
            Events
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#20201d]">
            {logs.length}
          </p>

          <p className="mt-1 text-[11px] text-black/40">
            Recent audit records
          </p>
        </div>

        <div className="rounded-xl border border-black/[0.08] bg-white p-5 transition hover:border-black/[0.14]">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
            Approvals
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#20201d]">
            {approvalCount}
          </p>

          <p className="mt-1 text-[11px] text-black/40">
            Awaiting human decision
          </p>
        </div>

        <div className="rounded-xl border border-black/[0.08] bg-white p-5 transition hover:border-black/[0.14]">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
            Verified
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#20201d]">
            {verifiedCount}
          </p>

          <p className="mt-1 text-[11px] text-black/40">
            Successful verification events
          </p>
        </div>
      </div>

      {blockedCount > 0 && (
        <div className="rounded-xl border border-red-200/80 bg-red-50/70 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

            <div>
              <p className="text-[13px] font-semibold text-red-900">
                {blockedCount} blocked security event
                {blockedCount === 1 ? "" : "s"}
              </p>

              <p className="mt-1 text-[12px] leading-5 text-red-800/80">
                Review policy decisions before allowing sensitive
                operations to proceed.
              </p>
            </div>
          </div>
        </div>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-semibold text-[#20201d]">
              Recent activity
            </h2>

            <p className="mt-1 text-[12px] text-black/40">
              Showing the latest 100 audit events.
            </p>
          </div>

          <span className="hidden text-[10px] font-medium uppercase tracking-[0.1em] text-black/30 sm:block">
            Security log
          </span>
        </div>

        <AuditTimeline logs={logs} />
      </section>
    </div>
  </NorthstarShell>
);
}