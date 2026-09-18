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

export const dynamic = "force-dynamic";

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
<section className="overflow-hidden rounded-xl border border-black/10 bg-white">
  <div className="p-6 sm:p-7">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] text-black/35">
            {mission.id}
          </span>

          <span className="h-1 w-1 rounded-full bg-black/15" />

          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
            Mission
          </span>
        </div>

        <h2 className="max-w-4xl text-2xl font-semibold leading-tight tracking-[-0.025em] text-black/90 sm:text-[28px]">
          {mission.goal}
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/45">
          Operational work coordinated through the OpsPilot agent.
        </p>
      </div>

      <MissionStatus status={mission.status} />
    </div>

    <div className="mt-7 grid gap-px overflow-hidden rounded-lg border border-black/[0.07] bg-black/[0.07] sm:grid-cols-3">
      <MissionMetadata
        label="Created"
        value={formatDate(mission.createdAt)}
      />

      <MissionMetadata
        label="Started"
        value={formatDate(mission.startedAt)}
      />

      <MissionMetadata
        label="Completed"
        value={formatDate(mission.completedAt)}
      />
    </div>
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
    <div className="bg-[#faf9f6] px-4 py-3.5">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/30">
        {label}
      </div>

      <div className="text-xs font-medium text-black/65">
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
      <article className="rounded-xl border border-red-200/70 bg-red-50/60 p-5">
        <div className="font-mono text-[11px] text-red-600/80">
          {taskId}
        </div>

        <p className="mt-2 text-sm font-medium text-red-700">
          Task record could not be found.
        </p>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-xl border border-black/10 bg-white">
      {/* Task header */}
      <div className="border-b border-black/[0.07] p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-[11px] text-black/35">
                {task.id}
              </span>

              <span className="h-1 w-1 rounded-full bg-black/15" />

              <span className="rounded-full border border-black/10 bg-[#f5f3ee] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/45">
                {task.priority}
              </span>
            </div>

            <h3 className="text-[17px] font-semibold leading-6 tracking-[-0.015em] text-black/85">
              {task.title}
            </h3>

            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-black/45">
  {task.description}
</p>
          </div>

          <TaskStatus status={task.status} />
        </div>
      </div>

      {/* Source request */}
      {email && (
  <div className="border-b border-black/[0.07] bg-[#faf9f6] px-5 py-4 sm:px-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-black/30" />

          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/30">
            Source request
          </span>
        </div>

        <div className="text-sm font-medium leading-5 text-black/70">
          {email.subject}
        </div>

        <div className="mt-1 text-xs text-black/40">
          From {email.sender}
        </div>
      </div>

      <div className="shrink-0">
        <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-black/40">
          Customer email
        </span>
      </div>
    </div>
  </div>
)}

      {/* Execution */}
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
              Execution
            </div>

            <div className="mt-1 text-sm font-semibold text-black/75">
              Agent activity
            </div>
          </div>

          <span className="text-[11px] text-black/35">
            {executionSteps.length}{" "}
            {executionSteps.length === 1
              ? "step"
              : "steps"}
          </span>
        </div>

        {executionSteps.length === 0 ? (
          <div className="rounded-lg border border-dashed border-black/10 bg-[#faf9f6] px-5 py-7">
            <div className="flex gap-4">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-xs text-black/45">
                →
              </div>

              <div>
                <div className="text-sm font-medium text-black/70">
                  Task received
                </div>

                <div className="mt-1 text-xs leading-5 text-black/40">
                  Task entered the mission execution queue.
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-black/[0.06] pt-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/30">
                Current outcome
              </div>

              <div className="mt-1 text-sm text-black/55">
                {getTaskOutcome(task.status)}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute bottom-4 left-[15px] top-4 w-px bg-black/10" />

            <div className="space-y-0">
              {executionSteps.map((step, index) => {
                const isLast =
                  index === executionSteps.length - 1;

                const status = getStepStatusStyle(
                  step.status,
                );

                return (
                  <div
                    key={step.id}
                    className={[
                      "relative flex gap-4",
                      isLast ? "" : "pb-7",
                    ].join(" ")}
                  >
                    {/* Timeline node */}
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${status.dot}`}
                      />
                    </div>

                    {/* Step content */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] text-black/30">
                          #{step.stepNumber}
                        </span>

                        <span className="text-sm font-semibold text-black/80">
                          {formatExecutionAction(
                            step.action,
                          )}
                        </span>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${status.badge}`}
                        >
                          {step.status}
                        </span>
                      </div>

                      {step.observation && (
                        <div className="mt-2 max-w-2xl rounded-lg border border-black/[0.06] bg-[#faf9f6] px-3 py-2.5 text-xs leading-5 text-black/50">
                          {step.observation}
                        </div>
                      )}

                      <div className="mt-2 text-[10px] text-black/30">
                        {formatDate(step.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
                <TaskOutcomeBanner status={task.status} />
      </div>
    </article>
  );
}

function getStepStatusStyle(status: string): {
  dot: string;
  badge: string;
} {
  switch (status.toLowerCase()) {
    case "completed":
      return {
        dot: "bg-emerald-600",
        badge:
          "border-emerald-200/70 bg-emerald-50/60 text-emerald-700",
      };

    case "blocked":
      return {
        dot: "bg-red-500",
        badge:
          "border-red-200/70 bg-red-50/60 text-red-700",
      };

    case "failed":
      return {
        dot: "bg-red-500",
        badge:
          "border-red-200/70 bg-red-50/60 text-red-700",
      };

    case "waiting_for_approval":
      return {
        dot: "bg-amber-500",
        badge:
          "border-amber-200/70 bg-amber-50/60 text-amber-700",
      };

    default:
      return {
        dot: "bg-black/30",
        badge:
          "border-black/10 bg-black/[0.025] text-black/50",
      };
  }
}

function TaskStatus({
  status,
}: {
  status: string;
}) {
  const styles: Record<
    string,
    {
      dot: string;
      badge: string;
    }
  > = {
    open: {
      dot: "bg-black/25",
      badge:
        "border-black/10 bg-black/[0.025] text-black/50",
    },

    completed: {
      dot: "bg-emerald-600",
      badge:
        "border-emerald-200/70 bg-emerald-50/60 text-emerald-700",
    },

    blocked: {
      dot: "bg-red-500",
      badge:
        "border-red-200/70 bg-red-50/60 text-red-700",
    },

    failed: {
      dot: "bg-red-500",
      badge:
        "border-red-200/70 bg-red-50/60 text-red-700",
    },

    waiting_for_approval: {
      dot: "bg-amber-500",
      badge:
        "border-amber-200/70 bg-amber-50/60 text-amber-700",
    },
  };

  const style =
    styles[status] ?? styles.open;

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center gap-1.5",
        "rounded-full border px-2.5 py-1",
        "text-[10px] font-semibold uppercase tracking-[0.08em]",
        style.badge,
      ].join(" ")}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
      />

      {status.replaceAll("_", " ")}
    </span>
  );
}

function TaskOutcomeBanner({
  status,
}: {
  status: string;
}) {
  const outcomes: Record<
    string,
    {
      label: string;
      description: string;
      container: string;
      dot: string;
    }
  > = {
    completed: {
      label: "Operation completed",
      description:
        "The requested operation completed successfully.",
      container:
        "border-emerald-200/70 bg-emerald-50/50",
      dot: "bg-emerald-600",
    },

    blocked: {
      label: "Operation blocked",
      description:
        "The deterministic policy engine prevented execution.",
      container:
        "border-red-200/70 bg-red-50/50",
      dot: "bg-red-500",
    },

    waiting_for_approval: {
      label: "Human approval required",
      description:
        "Execution is paused until an authorized human approves the requested action.",
      container:
        "border-amber-200/70 bg-amber-50/50",
      dot: "bg-amber-500",
    },

    failed: {
      label: "Operation failed",
      description:
        "The operation could not be completed and requires investigation.",
      container:
        "border-red-200/70 bg-red-50/50",
      dot: "bg-red-500",
    },

    open: {
      label: "Operation pending",
      description:
        "The task has not completed execution.",
      container:
        "border-black/10 bg-[#faf9f6]",
      dot: "bg-black/30",
    },
  };

  const outcome = outcomes[status] ?? outcomes.open;

  return (
    <div
      className={`mt-6 rounded-lg border px-4 py-3.5 ${outcome.container}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${outcome.dot}`}
        />

        <div>
          <div className="text-xs font-semibold text-black/75">
            {outcome.label}
          </div>

          <div className="mt-1 text-xs leading-5 text-black/45">
            {outcome.description}
          </div>
        </div>
      </div>
    </div>
  );
}

function getTaskOutcome(
  status: string,
): string {
  switch (status) {
    case "completed":
      return "The requested operation completed successfully.";

    case "blocked":
      return "Execution was blocked by the deterministic policy engine.";

    case "waiting_for_approval":
      return "Execution is paused until an authorized human approves the requested action.";

    case "failed":
      return "Execution could not be completed and requires investigation.";

    case "open":
      return "Task is queued and has not completed execution.";

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