import type { MissionStatus as MissionStatusValue } from "@/lib/db/repositories/missions";

const statusStyles: Record<MissionStatusValue, string> = {
  PENDING:
    "border-black/10 bg-black/[0.025] text-black/50",
  RUNNING:
    "border-blue-200/70 bg-blue-50/60 text-blue-700",
  COMPLETED:
    "border-emerald-200/70 bg-emerald-50/60 text-emerald-700",
  PARTIAL:
    "border-amber-200/70 bg-amber-50/60 text-amber-700",
  FAILED:
    "border-red-200/70 bg-red-50/60 text-red-700",
};

const statusDots: Record<MissionStatusValue, string> = {
  PENDING: "bg-black/30",
  RUNNING: "bg-blue-500",
  COMPLETED: "bg-emerald-600",
  PARTIAL: "bg-amber-500",
  FAILED: "bg-red-500",
};

export default function MissionStatus({
  status,
}: {
  status: MissionStatusValue;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusStyles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${statusDots[status]}`}
      />

      {status.replaceAll("_", " ")}
    </span>
  );
}