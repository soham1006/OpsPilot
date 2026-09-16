import type { AuditLogRecord } from "@/lib/db/repositories/audit-logs";

function formatAction(action: string): string {
  return action
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

function formatTimestamp(
  timestamp: string,
): string {
  return new Date(timestamp).toLocaleString();
}

function getStatusClass(
  value: string | null,
): string {
  if (!value) {
    return "text-zinc-500";
  }

  switch (value) {
    case "ALLOW":
    case "APPROVED":
    case "VERIFIED":
    case "COMPLETED":
      return "text-emerald-700";

    case "BLOCK":
    case "REJECTED":
    case "FAILED":
      return "text-red-700";

    case "APPROVAL_REQUIRED":
    case "PENDING":
      return "text-amber-700";

    default:
      return "text-zinc-700";
  }
}

export default function AuditTimeline({
  logs,
}: {
  logs: AuditLogRecord[];
}) {
  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
        <p className="text-sm text-zinc-500">
          No audit events recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="divide-y divide-zinc-100">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-5 transition hover:bg-zinc-50"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900">
                    {formatAction(log.action)}
                  </span>

                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    {log.actor}
                  </span>
                </div>

                <p className="mt-1 text-xs text-zinc-500">
                  {formatTimestamp(log.timestamp)}
                </p>
              </div>

              <div className="text-xs text-zinc-500">
                {log.id}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Target
                </p>
                <p className="mt-1 truncate text-sm text-zinc-800">
                  {log.target ?? "—"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Risk
                </p>
                <p
                  className={`mt-1 text-sm font-medium ${getStatusClass(
                    log.riskLevel,
                  )}`}
                >
                  {log.riskLevel ?? "—"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Policy
                </p>
                <p
                  className={`mt-1 text-sm font-medium ${getStatusClass(
                    log.policyDecision,
                  )}`}
                >
                  {log.policyDecision ?? "—"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Approval
                </p>
                <p
                  className={`mt-1 text-sm font-medium ${getStatusClass(
                    log.approvalStatus,
                  )}`}
                >
                  {log.approvalStatus ?? "—"}
                </p>
              </div>
            </div>

            {log.result && (
              <div className="mt-4 rounded-xl bg-zinc-50 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Result
                </p>

                <p className="mt-1 text-sm leading-6 text-zinc-700">
                  {log.result}
                </p>
              </div>
            )}

            {log.verificationStatus && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Verification
                </span>

                <span
                  className={`font-medium ${getStatusClass(
                    log.verificationStatus,
                  )}`}
                >
                  {log.verificationStatus}
                </span>
              </div>
            )}

            {log.taskId && (
              <div className="mt-3 text-xs text-zinc-500">
                Task:{" "}
                <span className="font-mono text-zinc-700">
                  {log.taskId}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}