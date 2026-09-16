import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import db from "@/lib/db/client";

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
  findAgentRunById,
} from "@/lib/db/repositories/agent-runs";

import {
  findExecutionStepsByAgentRunId,
  findExecutionStepsByTaskId,
} from "@/lib/db/repositories/execution-steps";

import {
  findAppointmentById,
} from "@/lib/db/repositories/appointments";

import {
  runMission,
} from "@/lib/agent/mission";

function assert(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  const testEmailId =
    `E-REAL-${Date.now()}`;

  const originalAppointment =
    findAppointmentById("A2001");

  assert(
    originalAppointment !== null,
    "Appointment A2001 was not found.",
  );

  const originalStart =
    originalAppointment.scheduledStart;

  const originalEnd =
    originalAppointment.scheduledEnd;

  // --------------------------------------------------
  // Create deterministic test email
  // --------------------------------------------------

  db.prepare(`
    INSERT INTO emails (
      id,
      customer_id,
      sender,
      recipient,
      subject,
      body,
      status,
      received_at
    )
    VALUES (
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?
    )
  `).run(
    testEmailId,
    "C1001",
    "sarah.johnson@example.com",
    "support@northstar.example.com",
    "Reschedule appointment A2001",
    `Hi,

I would like to reschedule appointment A2001
to September 18, 2026 at 10:00 AM.

Thanks,
Sarah Johnson`,
    "unread",
    new Date().toISOString(),
  );

  try {
    const email =
      findEmailById(testEmailId);

    assert(
      email !== null,
      "Temporary test email was not created.",
    );

    // --------------------------------------------------
    // Create mission task
    // --------------------------------------------------

    const task = createTask({
      title:
        "Real appointment reschedule test",
      description:
        "Reschedule appointment A2001 using the real agent.",
      priority: "LOW",
      sourceEmailId: email.id,
    });

    const mission = createMission(
      "Execute and persist a real appointment reschedule",
    );

    addTaskToMission(
      mission.id,
      task.id,
    );

    // --------------------------------------------------
    // Run REAL agent
    // --------------------------------------------------

    const result = await runMission(
      mission.id,
    );

    console.log(
      "Planner plan:",
      JSON.stringify(
        result.tasks[0]?.agentState?.plan,
        null,
        2,
      ),
    );

    // --------------------------------------------------
    // Validate mission result
    // --------------------------------------------------

    assert(
      result.mission.id === mission.id,
      "Returned mission ID is incorrect.",
    );

    assert(
      result.agentRunId.length > 0,
      "Agent run ID was not returned.",
    );

    assert(
      result.tasks.length === 1,
      "Mission should process exactly one task.",
    );

    assert(
      result.tasks[0].taskId === task.id,
      "Returned task ID is incorrect.",
    );

    assert(
      result.tasks[0].agentState !== null,
      "Real agent did not return an AgentState.",
    );

    console.log(
  "Agent status:",
  result.tasks[0].agentState?.status,
);

console.log(
  "Agent final message:",
  result.tasks[0].agentState?.finalMessage,
);

console.log(
  "Agent steps:",
  JSON.stringify(
    result.tasks[0].agentState?.steps,
    null,
    2,
  ),
);

    assert(
      result.mission.status ===
        "COMPLETED",
      `Expected mission to complete, got ${result.mission.status}.`,
    );

    // --------------------------------------------------
    // Validate agent run persistence
    // --------------------------------------------------

    const persistedRun =
      findAgentRunById(
        result.agentRunId,
      );

    assert(
      persistedRun !== null,
      "Agent run was not persisted.",
    );

    assert(
      persistedRun.status ===
        "COMPLETED",
      "Agent run was not completed.",
    );

    assert(
      persistedRun.completedAt !== null,
      "Completed agent run should have completedAt.",
    );

    // --------------------------------------------------
    // Validate execution steps
    // --------------------------------------------------

    const runSteps =
      findExecutionStepsByAgentRunId(
        persistedRun.id,
      );

    const taskSteps =
      findExecutionStepsByTaskId(
        task.id,
      );

    assert(
      runSteps.length >= 4,
      `Expected at least 4 execution steps, got ${runSteps.length}.`,
    );

    assert(
      taskSteps.length === runSteps.length,
      "Agent-run and task execution step counts differ.",
    );

    const actions =
      runSteps.map(
        (step) => step.action,
      );

    console.log(
      "Execution actions:",
      actions,
    );

    assert(
      actions.includes(
        "IDENTIFY_CUSTOMER",
      ),
      "IDENTIFY_CUSTOMER step missing.",
    );

    assert(
      actions.includes(
        "FIND_APPOINTMENT",
      ),
      "FIND_APPOINTMENT step missing.",
    );

    assert(
      actions.includes(
        "CHECK_APPOINTMENT_AVAILABILITY",
      ),
      "CHECK_APPOINTMENT_AVAILABILITY step missing.",
    );

    assert(
      actions.includes(
        "RESCHEDULE_APPOINTMENT",
      ),
      "RESCHEDULE_APPOINTMENT step missing.",
    );

    assert(
      actions.includes(
        "VERIFY_RESCHEDULE",
      ),
      "VERIFY_RESCHEDULE step missing.",
    );

    // --------------------------------------------------
    // Validate appointment mutation
    // --------------------------------------------------

    const updatedAppointment =
      findAppointmentById("A2001");

    assert(
      updatedAppointment !== null,
      "Updated appointment could not be found.",
    );

    assert(
      updatedAppointment.scheduledStart.startsWith(
        "2026-09-18T10:00",
      ),
      "Appointment was not rescheduled to the requested time.",
    );

    // --------------------------------------------------
    // Validate mission persistence
    // --------------------------------------------------

    const persistedMission =
      findMissionById(mission.id);

    assert(
      persistedMission !== null,
      "Mission could not be reloaded.",
    );

    assert(
      persistedMission.status ===
        "COMPLETED",
      "Persisted mission is not COMPLETED.",
    );

    // --------------------------------------------------
    // Output
    // --------------------------------------------------

    console.log(
      "Real agent end-to-end persistence verification completed successfully.",
    );

    console.log(
      `Mission: ${mission.id}`,
    );

    console.log(
      `Mission status: ${result.mission.status}`,
    );

    console.log(
      `Agent run: ${persistedRun.id}`,
    );

    console.log(
      `Execution steps: ${runSteps.length}`,
    );

    for (const step of runSteps) {
      console.log(
        `Step ${step.stepNumber}: ${step.action} [${step.status}]`,
      );

      if (step.observation) {
        console.log(
          `  Observation: ${step.observation}`,
        );
      }
    }

    console.log(
      `Final message: ${
        result.tasks[0].agentState
          ?.finalMessage ??
        "No final message."
      }`,
    );
  } finally {
    // --------------------------------------------------
    // Restore appointment + remove test email
    // --------------------------------------------------

    db.prepare(`
      UPDATE appointments
      SET
        scheduled_start = ?,
        scheduled_end = ?
      WHERE id = ?
    `).run(
      originalStart,
      originalEnd,
      "A2001",
    );

    // Keep the temporary email because the task references it
// through a foreign key.

    console.log(
  "Appointment state restored; test records retained.",
);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});