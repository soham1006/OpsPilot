import type { MissionStatus as MissionStatusValue } from "@/lib/db/repositories/missions";

const statusStyles: Record<
  MissionStatusValue,
  string
> = {
  PENDING:
    "border-black/10 bg-white text-black/55",
  RUNNING:
    "border-blue-200 bg-blue-50 text-blue-700",
  COMPLETED:
    "border-green-200 bg-green-50 text-green-700",
  PARTIAL:
    "border-amber-200 bg-amber-50 text-amber-700",
  FAILED:
    "border-red-200 bg-red-50 text-red-700",
};

export default function MissionStatus({
  status,
}: {
  status: MissionStatusValue;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${statusStyles[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}