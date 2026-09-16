import {
  findTaskById,
} from "@/lib/db/repositories/tasks";

import {
  findEmailById,
} from "@/lib/db/repositories/emails";

import {
  createAgentRun,
  updateAgentRun,
} from "@/lib/db/repositories/agent-runs";

import {
  createExecutionStep,
} from "@/lib/db/repositories/execution-steps";

import {
  findMissionById,
  findMissionTasks,
  updateMissionStatus,
  type MissionRecord,
  type MissionStatus,
} from "@/lib/db/repositories/missions";

import type {
  AgentState,
} from "@/lib/agent/types";

export interface MissionAgentInput {
  sender: string;
  subject: string;
  body: string;
}

export type MissionAgentRunner = (
  input: MissionAgentInput,
) => Promise<AgentState>;

async function defaultAgentRunner(
  input: MissionAgentInput,
): Promise<AgentState> {
  const { runAgent } =
    await import("@/lib/agent/orchestrator");

  return runAgent(input);
}

export interface MissionTaskResult {
  taskId: string;
  agentState: AgentState | null;
  status: AgentState["status"];
  error?: string;
}

export interface MissionRunResult {
  mission: MissionRecord;
  agentRunId: string;
  tasks: MissionTaskResult[];
}

function getMissionStatus(
  results: MissionTaskResult[],
): MissionStatus {
  if (results.length === 0) {
    return "FAILED";
  }

  const completedCount = results.filter(
    (result) =>
      result.status === "COMPLETED",
  ).length;

  if (
    completedCount === results.length
  ) {
    return "COMPLETED";
  }

  if (completedCount > 0) {
    return "PARTIAL";
  }

  return "FAILED";
}

export async function runMission(
  missionId: string,
  agentRunner: MissionAgentRunner =
    defaultAgentRunner,
): Promise<MissionRunResult> {
  const mission =
    findMissionById(missionId);

  if (!mission) {
    throw new Error(
      `Mission "${missionId}" was not found.`,
    );
  }

  if (
    mission.status === "RUNNING"
  ) {
    throw new Error(
      `Mission "${missionId}" is already running.`,
    );
  }

  if (
    mission.status === "COMPLETED"
  ) {
    throw new Error(
      `Mission "${missionId}" has already completed.`,
    );
  }

  updateMissionStatus(
    missionId,
    "RUNNING",
  );

  const agentRun = createAgentRun(
  mission.goal,
);

  const missionTasks =
    findMissionTasks(missionId);

  const results: MissionTaskResult[] = [];

  for (const missionTask of missionTasks) {
    const task =
      findTaskById(
        missionTask.taskId,
      );

    if (!task) {
      results.push({
        taskId: missionTask.taskId,
        agentState: null,
        status: "FAILED",
        error:
          `Task "${missionTask.taskId}" was not found.`,
      });

      continue;
    }

    if (!task.sourceEmailId) {
      results.push({
        taskId: task.id,
        agentState: null,
        status: "FAILED",
        error:
          "Task does not have a source email.",
      });

      continue;
    }

    const email =
      findEmailById(
        task.sourceEmailId,
      );

    if (!email) {
      results.push({
        taskId: task.id,
        agentState: null,
        status: "FAILED",
        error:
          `Source email "${task.sourceEmailId}" was not found.`,
      });

      continue;
    }

    try {
      const agentState =
  await agentRunner({
    sender: email.sender,
    subject: email.subject,
    body: email.body,
  });

for (const step of agentState.steps) {
  createExecutionStep({
    agentRunId: agentRun.id,
    taskId: task.id,
    stepNumber: step.stepNumber,
    action: step.action,
    status: agentState.status,
    observation:
      step.observation 
  });
}

results.push({
  taskId: task.id,
  agentState,
  status: agentState.status,
  ...(agentState.finalMessage
    ? {
        error:
          agentState.status ===
            "FAILED"
            ? agentState.finalMessage
            : undefined,
      }
    : {}),
});
    } catch (error) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : "Task execution failed.";

  createExecutionStep({
    agentRunId: agentRun.id,
    taskId: task.id,
    stepNumber: 1,
    action: "AGENT_EXECUTION",
    status: "FAILED",
    observation: errorMessage,
  });

  results.push({
    taskId: task.id,
    agentState: null,
    status: "FAILED",
    error: errorMessage,
  });
}
  }

  const finalStatus =
    getMissionStatus(results);

    updateAgentRun(
  agentRun.id,
  finalStatus,
);

  const updatedMission =
    updateMissionStatus(
      missionId,
      finalStatus,
    );

  if (!updatedMission) {
    throw new Error(
      `Mission "${missionId}" could not be updated.`,
    );
  }

 return {
  mission: updatedMission,
  agentRunId: agentRun.id,
  tasks: results,
};
}