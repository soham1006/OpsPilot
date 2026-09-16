import Link from "next/link";

import NorthstarShell from "@/components/northstar/NorthstarShell";
import MissionStatus from "@/components/missions/MissionStatus";

import {
  findMissions,
  findMissionTasks,
} from "@/lib/db/repositories/missions";

export default function MissionsPage() {
  const missions = findMissions();

  return (
    <NorthstarShell
      title="Missions"
      description="Monitor AI-driven operational work, execution state, and human intervention points."
    >
      <div className="space-y-4">
        {missions.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-8 text-center">
            <p className="text-sm font-medium">
              No missions yet.
            </p>

            <p className="mt-1 text-sm text-black/50">
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
                className="block rounded-xl border border-black/10 bg-white p-5 transition hover:border-black/20 hover:shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs text-black/40">
                        {mission.id}
                      </span>

                      <MissionStatus
                        status={mission.status}
                      />
                    </div>

                    <h2 className="text-base font-semibold tracking-tight">
                      {mission.goal}
                    </h2>
                  </div>

                  <div className="shrink-0 text-sm text-black/50">
                    {taskCount}{" "}
                    {taskCount === 1
                      ? "task"
                      : "tasks"}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 border-t border-black/5 pt-4 text-xs text-black/45 sm:grid-cols-3">
                  <div>
                    <div className="mb-1 uppercase tracking-wider">
                      Created
                    </div>

                    <div className="font-medium text-black/65">
                      {formatDate(
                        mission.createdAt,
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 uppercase tracking-wider">
                      Started
                    </div>

                    <div className="font-medium text-black/65">
                      {formatDate(
                        mission.startedAt,
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 uppercase tracking-wider">
                      Completed
                    </div>

                    <div className="font-medium text-black/65">
                      {formatDate(
                        mission.completedAt,
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </NorthstarShell>
  );
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}