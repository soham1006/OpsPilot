import {
  findTaskById,
  updateTaskStatus,
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

import { recordAuditEvent } from "@/lib/audit/events";

function getTaskStatus(
  agentStatus: AgentState["status"],
): "open" | "completed" | "blocked" | "failed" | "waiting_for_approval" {
  switch (agentStatus) {
    case "COMPLETED":
      return "completed";

    case "BLOCKED":
      return "blocked";

    case "FAILED":
    case "MAX_STEPS_REACHED":
      return "failed";

    case "WAITING_FOR_APPROVAL":
      return "waiting_for_approval";

    case "PENDING":
    case "RUNNING":
    default:
      return "open";
  }
}

function getAuditAction(action: string) {
  switch (action) {
    case "IDENTIFY_CUSTOMER":
      return "CUSTOMER_IDENTIFIED" as const;

    case "FIND_APPOINTMENT":
      return "APPOINTMENT_IDENTIFIED" as const;

    case "CHECK_APPOINTMENT_AVAILABILITY":
      return "AVAILABILITY_CHECKED" as const;

    case "READ_RELEVANT_POLICY":
      return "POLICY_EVALUATED" as const;

    case "RESCHEDULE_APPOINTMENT":
    case "CANCEL_APPOINTMENT":
    case "REQUEST_REFUND":
      return "TOOL_EXECUTED" as const;

    case "PREPARE_CUSTOMER_RESPONSE":
    case "SEND_CUSTOMER_RESPONSE":
      return "TOOL_EXECUTED" as const;

    case "VERIFY_RESCHEDULE":
     return "ACTION_VERIFIED" as const;

    default:
      return "TOOL_EXECUTED" as const;
  }
}

function getAuditActor(action: string) {
  switch (action) {
    case "READ_RELEVANT_POLICY":
      return "POLICY_ENGINE" as const;

    default:
      return "AI_AGENT" as const;
  }
}

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

  recordAuditEvent({
    actor: "SYSTEM",
    action: "MISSION_STARTED",
    target: missionId,
    result: "Mission execution started.",
  });

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

      recordAuditEvent({
        taskId: missionTask.taskId,
        actor: "SYSTEM",
        action: "TASK_FAILED",
        target: missionTask.taskId,
        result:
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

      recordAuditEvent({
        taskId: task.id,
        actor: "SYSTEM",
        action: "TASK_FAILED",
        target: task.id,
        result:
          "Task does not have a source email.",
      });

      continue;
    }

    const email =
      findEmailById(
        task.sourceEmailId,
      );

    if (!email) {
      const errorMessage =
        `Source email "${task.sourceEmailId}" was not found.`;

      results.push({
        taskId: task.id,
        agentState: null,
        status: "FAILED",
        error: errorMessage,
      });

      recordAuditEvent({
        taskId: task.id,
        actor: "SYSTEM",
        action: "TASK_FAILED",
        target: task.id,
        result: errorMessage,
      });

      continue;
    }

    try {
      recordAuditEvent({
        taskId: task.id,
        actor: "AI_AGENT",
        action: "TASK_STARTED",
        target: task.id,
        result: "Agent execution started.",
      });

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
            step.observation,
        });

        updateTaskStatus(task.id, getTaskStatus(agentState.status));

       recordAuditEvent({
  taskId: task.id,
  actor:
    step.action === "VERIFY_RESCHEDULE"
      ? "VERIFICATION"
      : getAuditActor(step.action),
  action: getAuditAction(step.action),
  target: step.toolName ?? step.action,
  riskLevel:
    step.policy?.riskLevel ?? null,
  policyDecision:
    step.policy?.decision ?? null,
  approvalStatus:
    null,
  result:
    step.observation ??
    (
      step.result?.success
        ? "Step completed successfully."
        : step.result?.error ??
          "Step did not complete successfully."
    ),
  verificationStatus:
    step.action === "VERIFY_RESCHEDULE"
      ? "VERIFIED"
      : null,
});
      }

      if (
        agentState.status ===
        "COMPLETED"
      ) {
        recordAuditEvent({
          taskId: task.id,
          actor: "SYSTEM",
          action: "TASK_COMPLETED",
          target: task.id,
          result:
            agentState.finalMessage ??
            "Task completed successfully.",
        });
      } else if (
        agentState.status ===
        "WAITING_FOR_APPROVAL"
      ) {
        recordAuditEvent({
          taskId: task.id,
          actor: "AI_AGENT",
          action: "APPROVAL_REQUESTED",
          target: task.id,
          approvalStatus: "PENDING",
          result:
            "Task requires human approval before execution.",
        });
      } else if (
        agentState.status ===
        "BLOCKED"
      ) {
        recordAuditEvent({
          taskId: task.id,
          actor: "POLICY_ENGINE",
          action: "ACTION_BLOCKED",
          target: task.id,
          result:
            agentState.finalMessage ??
            "Action blocked by policy.",
        });
      } else if (
        agentState.status ===
        "FAILED"
      ) {
        recordAuditEvent({
          taskId: task.id,
          actor: "SYSTEM",
          action: "TASK_FAILED",
          target: task.id,
          result:
            agentState.finalMessage ??
            "Task execution failed.",
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
      updateTaskStatus(task.id, "failed");
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

      recordAuditEvent({
        taskId: task.id,
        actor: "SYSTEM",
        action: "TASK_FAILED",
        target: task.id,
        result: errorMessage,
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

  if (
    finalStatus === "COMPLETED"
  ) {
    recordAuditEvent({
      actor: "SYSTEM",
      action: "MISSION_COMPLETED",
      target: missionId,
      result:
        "All mission tasks completed.",
    });
  } else if (
    finalStatus === "PARTIAL"
  ) {
    recordAuditEvent({
      actor: "SYSTEM",
      action: "MISSION_PARTIAL",
      target: missionId,
      result:
        "Mission completed with one or more non-completed tasks.",
    });
  } else {
    recordAuditEvent({
      actor: "SYSTEM",
      action: "MISSION_FAILED",
      target: missionId,
      result:
        "Mission did not complete successfully.",
    });
  }

  return {
    mission: updatedMission,
    agentRunId: agentRun.id,
    tasks: results,
  };
}