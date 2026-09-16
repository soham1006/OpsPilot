import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import {
  createMission,
  addTaskToMission,
  findMissionById,
} from "@/lib/db/repositories/missions";

import {
  createTask,
} from "@/lib/db/repositories/tasks";

import {
  findEmailById,
} from "@/lib/db/repositories/emails";

import {
  runMission,
  type MissionAgentInput,
} from "@/lib/agent/mission";

import type {
  AgentState,
} from "@/lib/agent/types";

function assert(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  // Use a real seeded email so the runner exercises
  // the complete task -> email -> agent path.
  const email = findEmailById("E4001");

  assert(
    email !== null,
    "Seed email E4001 was not found.",
  );

  // --------------------------------------------------
  // Create three tasks with different expected outcomes
  // --------------------------------------------------

  const completedTask = createTask({
    title: "Completed mission task",
    description:
      "Process a successfully handled customer request.",
    priority: "LOW",
    sourceEmailId: email.id,
  });

  const blockedTask = createTask({
    title: "Blocked mission task",
    description:
      "Process a request that must be blocked.",
    priority: "HIGH",
    sourceEmailId: email.id,
  });

  const approvalTask = createTask({
    title: "Approval mission task",
    description:
      "Process a request requiring human approval.",
    priority: "HIGH",
    sourceEmailId: email.id,
  });

  // --------------------------------------------------
  // Create mission and attach all three tasks
  // --------------------------------------------------

  const mission = createMission(
    "Handle today's unresolved customer requests",
  );

  addTaskToMission(
    mission.id,
    completedTask.id,
  );

  addTaskToMission(
    mission.id,
    blockedTask.id,
  );

  addTaskToMission(
    mission.id,
    approvalTask.id,
  );

  // --------------------------------------------------
  // Mock agent runner
  //
  // The mission runner currently passes the same source
  // email to each task, so use invocation order to create
  // deterministic mixed outcomes.
  // --------------------------------------------------

  let invocationCount = 0;

  const mockAgentRunner = async (
    input: MissionAgentInput,
  ): Promise<AgentState> => {
    const currentInvocation = invocationCount;
    invocationCount += 1;

    if (currentInvocation === 0) {
      return {
        mission: input.body,
        plan: null,
        status: "COMPLETED",
        currentStep: 1,
        steps: [],
        finalMessage:
          "Customer request completed successfully.",
      };
    }

    if (currentInvocation === 1) {
      return {
        mission: input.body,
        plan: null,
        status: "BLOCKED",
        currentStep: 1,
        steps: [],
        finalMessage:
          "Operation was blocked by policy.",
      };
    }

    return {
      mission: input.body,
      plan: null,
      status: "WAITING_FOR_APPROVAL",
      currentStep: 1,
      steps: [],
      finalMessage:
        "Human approval is required.",
    };
  };

  // --------------------------------------------------
  // Run mission
  // --------------------------------------------------

  const result = await runMission(
    mission.id,
    mockAgentRunner,
  );

  // --------------------------------------------------
  // Validate mission result
  // --------------------------------------------------

  assert(
    result.mission.id === mission.id,
    "Returned mission ID is incorrect.",
  );

  assert(
    result.tasks.length === 3,
    "Mission should process exactly three tasks.",
  );

  assert(
    result.mission.status === "PARTIAL",
    `Mission should be PARTIAL, got ${result.mission.status}.`,
  );

  // --------------------------------------------------
  // Validate individual task results
  // --------------------------------------------------

  const completedResult = result.tasks.find(
    (task) => task.taskId === completedTask.id,
  );

  const blockedResult = result.tasks.find(
    (task) => task.taskId === blockedTask.id,
  );

  const approvalResult = result.tasks.find(
    (task) => task.taskId === approvalTask.id,
  );

  assert(
    completedResult !== undefined,
    "Completed task result was not returned.",
  );

  assert(
    blockedResult !== undefined,
    "Blocked task result was not returned.",
  );

  assert(
    approvalResult !== undefined,
    "Approval task result was not returned.",
  );

  assert(
    completedResult.agentState !== null,
    "Completed task did not invoke the agent.",
  );

  assert(
    blockedResult.agentState !== null,
    "Blocked task did not invoke the agent.",
  );

  assert(
    approvalResult.agentState !== null,
    "Approval task did not invoke the agent.",
  );

  assert(
    completedResult.status === "COMPLETED",
    `Expected completed task to be COMPLETED, got ${completedResult.status}.`,
  );

  assert(
    blockedResult.status === "BLOCKED",
    `Expected blocked task to be BLOCKED, got ${blockedResult.status}.`,
  );

  assert(
    approvalResult.status === "WAITING_FOR_APPROVAL",
    `Expected approval task to be WAITING_FOR_APPROVAL, got ${approvalResult.status}.`,
  );

  // --------------------------------------------------
  // Validate persistence
  // --------------------------------------------------

  const persistedMission =
    findMissionById(mission.id);

  assert(
    persistedMission?.status === "PARTIAL",
    "Final mission status was not persisted as PARTIAL.",
  );

  assert(
    persistedMission?.status === result.mission.status,
    "Persisted mission status does not match returned status.",
  );

  // --------------------------------------------------
  // Output verification summary
  // --------------------------------------------------

  console.log(
    "Mission runner verification completed successfully.",
  );

  console.log(
    `Mission status: ${result.mission.status}`,
  );

  console.log(
    `Completed task: ${completedResult.status}`,
  );

  console.log(
    `Blocked task: ${blockedResult.status}`,
  );

  console.log(
    `Approval task: ${approvalResult.status}`,
  );

  console.log(
    `Completed message: ${
      completedResult.agentState?.finalMessage ??
      completedResult.error ??
      "No error message."
    }`,
  );

  console.log(
    `Blocked message: ${
      blockedResult.agentState?.finalMessage ??
      blockedResult.error ??
      "No error message."
    }`,
  );

  console.log(
    `Approval message: ${
      approvalResult.agentState?.finalMessage ??
      approvalResult.error ??
      "No error message."
    }`,
  );

  console.log(
    "Agent steps:",
    JSON.stringify(
      result.tasks.map((task) => ({
        taskId: task.taskId,
        status: task.status,
        steps: task.agentState?.steps ?? [],
      })),
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});