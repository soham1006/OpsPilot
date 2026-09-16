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

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            A chronological record of operational decisions,
            executions, approvals, and verification events.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Events
            </p>

            <p className="mt-2 text-3xl font-semibold text-zinc-950">
              {logs.length}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Recent audit records
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Approvals
            </p>

            <p className="mt-2 text-3xl font-semibold text-zinc-950">
              {approvalCount}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Awaiting human decision
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Verified
            </p>

            <p className="mt-2 text-3xl font-semibold text-zinc-950">
              {verifiedCount}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Successful verification events
            </p>
          </div>
        </div>

        {blockedCount > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-900">
              {blockedCount} blocked security event
              {blockedCount === 1 ? "" : "s"}
            </p>

            <p className="mt-1 text-sm text-red-800">
              Review policy decisions before allowing
              sensitive operations to proceed.
            </p>
          </div>
        )}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">
                Recent activity
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Showing the latest 100 audit events.
              </p>
            </div>
          </div>

          <AuditTimeline logs={logs} />
        </section>
      </div>
    </NorthstarShell>
  );
}