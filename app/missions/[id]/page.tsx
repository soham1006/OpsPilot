import Link from "next/link";
import { notFound } from "next/navigation";

import NorthstarShell from "@/components/northstar/NorthstarShell";
import MissionStatus from "@/components/missions/MissionStatus";

import {
  findMissionById,
  findMissionTasks,
} from "@/lib/db/repositories/missions";

import {
  findTaskById,
} from "@/lib/db/repositories/tasks";

import {
  findEmailById,
} from "@/lib/db/repositories/emails";

import {
  findLatestAgentRunByMission,
} from "@/lib/db/repositories/agent-runs";

import {
  findExecutionStepsByAgentRunId,
} from "@/lib/db/repositories/execution-steps";

interface MissionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MissionDetailPage({
  params,
}: MissionDetailPageProps) {
  const { id } = await params;

  const mission = findMissionById(id);

  if (!mission) {
    notFound();
  }

  const missionTasks = findMissionTasks(
    mission.id,
  );

  const agentRun =
  findLatestAgentRunByMission(
    mission.goal,
  );

const executionSteps = agentRun
  ? findExecutionStepsByAgentRunId(
      agentRun.id,
    )
  : [];

  const tasks = missionTasks.map(
    (missionTask) => {
      const task = findTaskById(
        missionTask.taskId,
      );

      if (!task) {
        return {
          missionTask,
          task: null,
          email: null,
        };
      }

      const email = task.sourceEmailId
        ? findEmailById(
            task.sourceEmailId,
          )
        : null;

      return {
        missionTask,
        task,
        email,
      };
    },
  );

  return (
    <NorthstarShell
      title="Mission detail"
      description="Review the operational work performed by the AI agent."
    >
      <div className="space-y-6">
        <Link
          href="/missions"
          className="inline-flex text-sm font-medium text-black/50 transition hover:text-black"
        >
          ← Back to missions
        </Link>

        {/* Mission header */}
        <section className="rounded-xl border border-black/10 bg-white p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 font-mono text-xs text-black/40">
                {mission.id}
              </div>

              <h2 className="max-w-3xl text-2xl font-semibold tracking-tight">
                {mission.goal}
              </h2>
            </div>

            <MissionStatus
              status={mission.status}
            />
          </div>

          <div className="mt-6 grid gap-4 border-t border-black/5 pt-5 sm:grid-cols-3">
            <MissionMetadata
              label="Created"
              value={formatDate(
                mission.createdAt,
              )}
            />

            <MissionMetadata
              label="Started"
              value={formatDate(
                mission.startedAt,
              )}
            />

            <MissionMetadata
              label="Completed"
              value={formatDate(
                mission.completedAt,
              )}
            />
          </div>
        </section>

        {/* Task execution */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                Execution
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Task timeline
              </h2>
            </div>

            <span className="text-sm text-black/45">
              {tasks.length}{" "}
              {tasks.length === 1
                ? "task"
                : "tasks"}
            </span>
          </div>

          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="rounded-xl border border-black/10 bg-white p-8 text-center">
                <p className="text-sm text-black/50">
                  No tasks are attached to this mission.
                </p>
              </div>
            ) : (
              tasks.map(
                ({
                  missionTask,
                  task,
                  email,
                }) => (
                  <TaskTimelineCard
  key={
    missionTask.taskId
  }
  taskId={
    missionTask.taskId
  }
  task={task}
  email={email}
  executionSteps={executionSteps.filter(
    (step) =>
      step.taskId ===
      missionTask.taskId,
  )}
/>
                ),
              )
            )}
          </div>
        </section>
      </div>
    </NorthstarShell>
  );
}

function MissionMetadata({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wider text-black/40">
        {label}
      </div>

      <div className="text-sm font-medium text-black/70">
        {value}
      </div>
    </div>
  );
}

function TaskTimelineCard({
  taskId,
  task,
  email,
  executionSteps,
}: {
  taskId: string;
  task: ReturnType<typeof findTaskById>;
  email: ReturnType<typeof findEmailById>;
  executionSteps: ReturnType<
    typeof findExecutionStepsByAgentRunId
  >;
}) {
  if (!task) {
    return (
      <article className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="font-mono text-xs text-red-600">
          {taskId}
        </div>

        <p className="mt-2 text-sm font-medium text-red-700">
          Task record could not be found.
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-black/10 bg-white">
      <div className="flex flex-col gap-4 border-b border-black/5 p-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-black/40">
              {task.id}
            </span>

            <span className="rounded-full border border-black/10 bg-[#f5f3ee] px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-black/50">
              {task.priority}
            </span>
          </div>

          <h3 className="font-semibold tracking-tight">
            {task.title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-black/50">
            {task.description}
          </p>
        </div>

        <TaskStatus status={task.status} />
      </div>

      {email && (
        <div className="border-b border-black/5 bg-[#faf9f6] px-5 py-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-black/35">
            Source request
          </div>

          <div className="text-sm font-medium text-black/70">
            {email.subject}
          </div>

          <div className="mt-1 text-xs text-black/45">
            From {email.sender}
          </div>
        </div>
      )}

      <div className="p-5">
        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
          Execution timeline
        </div>

        <div className="relative ml-2 border-l border-black/10 pl-6">
  {executionSteps.length === 0 ? (
    <>
      <div className="relative pb-5">
        <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-black/50 ring-1 ring-black/10" />

        <div className="text-sm font-medium">
          Task received
        </div>

        <div className="mt-1 text-xs text-black/45">
          Task entered the mission execution queue.
        </div>
      </div>

      <div className="relative">
        <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-black/50 ring-1 ring-black/10" />

        <div className="text-sm font-medium">
          Agent outcome
        </div>

        <div className="mt-1 text-xs text-black/45">
          {getTaskOutcome(task.status)}
        </div>
      </div>
    </>
  ) : (
    executionSteps.map((step, index) => (
      <div
        key={step.id}
        className={
          index ===
          executionSteps.length - 1
            ? "relative"
            : "relative pb-6"
        }
      >
        <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-black/50 ring-1 ring-black/10" />

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-black/35">
            #{step.stepNumber}
          </span>

          <div className="text-sm font-semibold">
            {formatExecutionAction(
              step.action,
            )}
          </div>

          <span className="rounded-full border border-black/10 bg-[#f5f3ee] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black/45">
            {step.status}
          </span>
        </div>

        {step.observation && (
          <div className="mt-2 text-xs leading-5 text-black/50">
            {step.observation}
          </div>
        )}

        <div className="mt-2 text-[11px] text-black/30">
          {formatDate(step.createdAt)}
        </div>
      </div>
    ))
  )}
</div>
      </div>
    </article>
  );
}

function TaskStatus({
  status,
}: {
  status: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    open:
      "border-black/10 bg-white text-black/50",
    completed:
      "border-green-200 bg-green-50 text-green-700",
    blocked:
      "border-red-200 bg-red-50 text-red-700",
    failed:
      "border-red-200 bg-red-50 text-red-700",
    waiting_for_approval:
      "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
        styles[status] ??
        "border-black/10 bg-white text-black/50"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function getTaskOutcome(
  status: string,
): string {
  switch (status) {
    case "completed":
      return "Task completed successfully.";

    case "blocked":
      return "Execution was blocked by policy.";

    case "waiting_for_approval":
      return "Execution is waiting for human approval.";

    case "failed":
      return "Task execution failed.";

    default:
      return "Task has not completed execution.";
  }
}

function formatExecutionAction(
  action: string,
): string {
  return action
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
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