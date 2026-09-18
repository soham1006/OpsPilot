import Link from "next/link";

import NorthstarShell from "@/components/northstar/NorthstarShell";
import MissionStatus from "@/components/missions/MissionStatus";

import {
  findMissions,
  findMissionTasks,
} from "@/lib/db/repositories/missions";

export const dynamic = "force-dynamic";

export default function MissionsPage() {
  const missions = findMissions();

  const activeMissions = missions.filter(
    (mission) =>
      mission.status === "RUNNING" ||
      mission.status === "PENDING",
  ).length;

  const attentionMissions = missions.filter(
    (mission) =>
      mission.status === "PARTIAL" ||
      mission.status === "FAILED",
  ).length;

  return (
    <NorthstarShell
      title="Missions"
      description="Monitor AI-driven operational work, execution state, and human intervention points."
    >
      <div className="space-y-8">
        {/* Mission overview */}
        <section className="grid gap-3 sm:grid-cols-3">
          <MissionMetric
            label="Total missions"
            value={missions.length}
            description="Recorded operational runs"
          />

          <MissionMetric
            label="Active"
            value={activeMissions}
            description="Pending or currently running"
          />

          <MissionMetric
            label="Needs attention"
            value={attentionMissions}
            description="Partial or failed execution"
          />
        </section>

        {/* Mission list */}
        <section>
          <div className="mb-4 flex items-end justify-between border-b border-black/10 pb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">
                Operations
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                Recent missions
              </h2>
            </div>

            <span className="text-xs text-black/40">
              {missions.length}{" "}
              {missions.length === 1 ? "mission" : "missions"}
            </span>
          </div>

          <div className="space-y-3">
            {missions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-black/15 bg-white/60 px-6 py-12 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-[#f5f3ee] text-sm">
                  —
                </div>

                <p className="mt-4 text-sm font-semibold">
                  No missions yet
                </p>

                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-black/45">
                  Missions created by the operations agent
                  will appear here.
                </p>
              </div>
            ) : (
              missions.map((mission) => {
                const taskCount =
                  findMissionTasks(mission.id).length;

                return (
                  <Link
                    key={mission.id}
                    href={`/missions/${mission.id}`}
                    className="group block rounded-xl border border-black/10 bg-white transition hover:border-black/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="mb-3 flex flex-wrap items-center gap-3">
                            <span className="font-mono text-[11px] text-black/35">
                              {mission.id}
                            </span>

                            <MissionStatus
                              status={mission.status}
                            />
                          </div>

                          <h3 className="max-w-3xl text-[17px] font-semibold leading-6 tracking-[-0.015em] text-black/85">
                            {mission.goal}
                          </h3>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-black/45">
                          <span>
                            {taskCount}{" "}
                            {taskCount === 1
                              ? "task"
                              : "tasks"}
                          </span>

                          <span className="text-black/20 transition-transform group-hover:translate-x-0.5">
                            →
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 border-t border-black/[0.07] pt-4 sm:grid-cols-3">
                        <MissionDate
                          label="Created"
                          value={formatDate(
                            mission.createdAt,
                          )}
                        />

                        <MissionDate
                          label="Started"
                          value={formatDate(
                            mission.startedAt,
                          )}
                        />

                        <MissionDate
                          label="Completed"
                          value={formatDate(
                            mission.completedAt,
                          )}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>
    </NorthstarShell>
  );
}

function MissionMetric({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white px-5 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
        {label}
      </div>

      <div className="mt-2 text-2xl font-semibold tracking-tight text-black/85">
        {value}
      </div>

      <div className="mt-1 text-xs text-black/40">
        {description}
      </div>
    </div>
  );
}

function MissionDate({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/30">
        {label}
      </div>

      <div className="text-xs font-medium text-black/60">
        {value}
      </div>
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}