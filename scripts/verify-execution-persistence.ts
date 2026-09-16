import {
  createAgentRun,
  findAgentRunById,
  updateAgentRun,
} from "@/lib/db/repositories/agent-runs";

import {
  createExecutionStep,
  findExecutionStepsByAgentRunId,
  findExecutionStepsByTaskId,
} from "@/lib/db/repositories/execution-steps";

import {
  createTask,
} from "@/lib/db/repositories/tasks";

function assert(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function main(): void {
  // --------------------------------------------------
  // Create agent run
  // --------------------------------------------------

  const agentRun = createAgentRun(
    "Verify execution persistence",
  );

  const testTask = createTask({
  title: "Execution persistence test",
  description:
    "Temporary task used to verify execution step persistence.",
  priority: "LOW",
});

  assert(
    agentRun.id.startsWith("AR-"),
    "Agent run ID was not generated correctly.",
  );

  assert(
    agentRun.status === "RUNNING",
    "New agent run should start as RUNNING.",
  );

  // --------------------------------------------------
  // Create execution steps
  // --------------------------------------------------

  const firstStep = createExecutionStep({
    agentRunId: agentRun.id,
    taskId: testTask.id,
    stepNumber: 1,
    action: "IDENTIFY_CUSTOMER",
    status: "COMPLETED",
    observation:
      "Customer identified successfully.",
  });

  const secondStep = createExecutionStep({
    agentRunId: agentRun.id,
    taskId: testTask.id,
    stepNumber: 2,
    action: "CHECK_POLICY",
    status: "COMPLETED",
    observation:
      "Policy allows the requested operation.",
  });

  assert(
    firstStep.agentRunId === agentRun.id,
    "First execution step has incorrect agent run ID.",
  );

  assert(
    secondStep.agentRunId === agentRun.id,
    "Second execution step has incorrect agent run ID.",
  );

  assert(
    firstStep.stepNumber === 1,
    "First step number is incorrect.",
  );

  assert(
    secondStep.stepNumber === 2,
    "Second step number is incorrect.",
  );

  // --------------------------------------------------
  // Read by agent run
  // --------------------------------------------------

  const runSteps =
    findExecutionStepsByAgentRunId(
      agentRun.id,
    );

  assert(
    runSteps.length === 2,
    "Expected exactly two execution steps.",
  );

  assert(
    runSteps[0].action ===
      "IDENTIFY_CUSTOMER",
    "First execution action is incorrect.",
  );

  assert(
    runSteps[1].action ===
      "CHECK_POLICY",
    "Second execution action is incorrect.",
  );

  // --------------------------------------------------
  // Read by task
  // --------------------------------------------------
const taskSteps =
  findExecutionStepsByTaskId(
    testTask.id,
  );

  assert(
    taskSteps.length === 2,
    "Expected two execution steps for the test task.",
  );

  // --------------------------------------------------
  // Complete agent run
  // --------------------------------------------------

  const completedRun =
    updateAgentRun(
      agentRun.id,
      "COMPLETED",
    );

  assert(
    completedRun !== null,
    "Agent run could not be completed.",
  );

  assert(
    completedRun.status === "COMPLETED",
    "Agent run status was not updated.",
  );

  assert(
    completedRun.completedAt !== null,
    "Completed agent run should have completedAt.",
  );

  // --------------------------------------------------
  // Verify persisted agent run
  // --------------------------------------------------

  const persistedRun =
    findAgentRunById(
      agentRun.id,
    );

  assert(
    persistedRun !== null,
    "Persisted agent run could not be found.",
  );

  assert(
    persistedRun.status === "COMPLETED",
    "Persisted agent run has incorrect status.",
  );

  console.log(
    "Execution persistence verification completed successfully.",
  );

  console.log(
    `Agent run: ${persistedRun.id}`,
  );

  console.log(
    `Status: ${persistedRun.status}`,
  );

  console.log(
    `Execution steps: ${runSteps.length}`,
  );

  console.log(
    `First action: ${runSteps[0].action}`,
  );

  console.log(
    `Second action: ${runSteps[1].action}`,
  );
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}