import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import db from "@/lib/db/client";

import {
  findAuditLogs,
  findAuditLogsByTaskId,
} from "@/lib/db/repositories/audit-logs";

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
    `E-AUDIT-${Date.now()}`;

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
        "Audit trail appointment reschedule test",
      description:
        "Verify audit events for appointment rescheduling.",
      priority: "LOW",
      sourceEmailId: email.id,
    });

    const mission = createMission(
      "Verify persisted audit trail for appointment rescheduling.",
    );

    addTaskToMission(
      mission.id,
      task.id,
    );

    console.log(
      `Mission created: ${mission.id}`,
    );

    // --------------------------------------------------
    // Run mission with deterministic AgentState
    // --------------------------------------------------

    const result = await runMission(
      mission.id,
      async () => ({
        mission:
          "Verify persisted audit trail for appointment rescheduling.",

        plan: {
          intent:
            "APPOINTMENT_RESCHEDULE",

          summary:
            "Reschedule appointment A2001.",

          confidence: 1,

          entities: {
            customerName:
              "Sarah Johnson",

            customerEmail:
              "sarah.johnson@example.com",

            appointmentReference:
              "A2001",

            requestedDate:
              "2026-09-18",

            requestedTime:
              "10:00",

            refundAmountCents:
              null,
          },

          requestedAction:
            "Reschedule appointment A2001.",

          missingInformation: [],

          proposedSteps: [
            {
              action:
                "IDENTIFY_CUSTOMER",
              purpose:
                "Identify the customer.",
            },
            {
              action:
                "FIND_APPOINTMENT",
              purpose:
                "Find appointment A2001.",
            },
            {
              action:
                "CHECK_APPOINTMENT_AVAILABILITY",
              purpose:
                "Check requested availability.",
            },
            {
              action:
                "READ_RELEVANT_POLICY",
              purpose:
                "Read applicable policy.",
            },
            {
              action:
                "PREPARE_CUSTOMER_RESPONSE",
              purpose:
                "Prepare customer response.",
            },
          ],

          riskSignals: [],
        },

        status: "COMPLETED",

        currentStep: 6,

        steps: [
          {
            stepNumber: 1,

            action:
              "IDENTIFY_CUSTOMER",

            toolName:
              "get_customer",

            policy: {
              decision:
                "ALLOW",

              riskLevel:
                "LOW",

              reason:
                "Read operation is permitted.",

              requiresApproval:
                false,
            },

            result: {
              success: true,

              toolName:
                "get_customer",

              data: {
                id:
                  "C1001",
              },

              error:
                null,
            },

            observation:
              "Customer identified.",
          },

          {
            stepNumber: 2,

            action:
              "FIND_APPOINTMENT",

            toolName:
              "get_appointment",

            policy: {
              decision:
                "ALLOW",

              riskLevel:
                "LOW",

              reason:
                "Read operation is permitted.",

              requiresApproval:
                false,
            },

            result: {
              success: true,

              toolName:
                "get_appointment",

              data: {
                id:
                  "A2001",
              },

              error:
                null,
            },

            observation:
              "Appointment identified.",
          },

          {
            stepNumber: 3,

            action:
              "CHECK_APPOINTMENT_AVAILABILITY",

            toolName:
              "check_availability",

            policy: {
              decision:
                "ALLOW",

              riskLevel:
                "LOW",

              reason:
                "Read operation is permitted.",

              requiresApproval:
                false,
            },

            result: {
              success: true,

              toolName:
                "check_availability",

              data: {
                available:
                  true,
              },

              error:
                null,
            },

            observation:
              "Availability confirmed.",
          },

          {
            stepNumber: 4,

            action:
              "READ_RELEVANT_POLICY",

            toolName:
              "get_company_policy",

            policy: {
              decision:
                "ALLOW",

              riskLevel:
                "LOW",

              reason:
                "Policy read permitted.",

              requiresApproval:
                false,
            },

            result: {
              success: true,

              toolName:
                "get_company_policy",

              data: {
                action:
                  "reschedule_appointment",
              },

              error:
                null,
            },

            observation:
              "Policy evaluated.",
          },

          {
            stepNumber: 5,

            action:
              "RESCHEDULE_APPOINTMENT",

            toolName:
              "reschedule_appointment",

            policy: {
              decision:
                "ALLOW",

              riskLevel:
                "LOW",

              reason:
                "Appointment rescheduling is permitted.",

              requiresApproval:
                false,
            },

            result: {
              success: true,

              toolName:
                "reschedule_appointment",

              data: {
                id:
                  "A2001",
              },

              error:
                null,
            },

            observation:
              "Appointment rescheduled.",
          },

          {
            stepNumber: 6,

            action:
              "VERIFY_RESCHEDULE",

            observation:
              "Appointment reschedule verified successfully.",
          },
        ],

        finalMessage:
          "Appointment rescheduled and verified successfully.",
      }),
    );

    console.log(
      `Mission status: ${result.mission.status}`,
    );

    // --------------------------------------------------
    // Validate mission result
    // --------------------------------------------------

    assert(
      result.mission.status ===
        "COMPLETED",
      `Expected mission to complete, got ${result.mission.status}.`,
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
      "AgentState was not returned.",
    );

    // --------------------------------------------------
    // Read persisted audit events
    // --------------------------------------------------

    const taskAuditLogs =
      findAuditLogsByTaskId(task.id);

    console.log(
      `Task audit events: ${taskAuditLogs.length}`,
    );

    assert(
      taskAuditLogs.length > 0,
      "No audit events were persisted for the task.",
    );

    const actions =
      taskAuditLogs.map(
        (log) => log.action,
      );

    console.log(
      "Task audit actions:",
      actions,
    );

    // --------------------------------------------------
    // Validate required audit events
    // --------------------------------------------------

    const requiredActions = [
      "TASK_STARTED",
      "CUSTOMER_IDENTIFIED",
      "APPOINTMENT_IDENTIFIED",
      "AVAILABILITY_CHECKED",
      "POLICY_EVALUATED",
      "TOOL_EXECUTED",
      "ACTION_VERIFIED",
      "TASK_COMPLETED",
    ];

    for (
      const requiredAction of requiredActions
    ) {
      assert(
        actions.includes(
          requiredAction,
        ),
        `Missing required audit action: ${requiredAction}`,
      );
    }

    // --------------------------------------------------
    // Validate policy metadata
    // --------------------------------------------------

    const policyEvent =
      taskAuditLogs.find(
        (log) =>
          log.action ===
          "POLICY_EVALUATED",
      );

    assert(
      policyEvent !== undefined,
      "Expected POLICY_EVALUATED audit event.",
    );

    assert(
      policyEvent.policyDecision !==
        null,
      "Policy audit event is missing policyDecision.",
    );

    assert(
      policyEvent.riskLevel !==
        null,
      "Policy audit event is missing riskLevel.",
    );

    console.log(
      "Policy decision:",
      policyEvent.policyDecision,
    );

    console.log(
      "Policy risk:",
      policyEvent.riskLevel,
    );

    // --------------------------------------------------
    // Validate verification metadata
    // --------------------------------------------------

    const verificationEvent =
      taskAuditLogs.find(
        (log) =>
          log.action ===
          "ACTION_VERIFIED",
      );

    assert(
      verificationEvent !== undefined,
      "Expected ACTION_VERIFIED audit event.",
    );

    assert(
      verificationEvent.verificationStatus ===
        "VERIFIED",
      "Expected verificationStatus to be VERIFIED.",
    );

    // --------------------------------------------------
    // Validate data minimization
    // --------------------------------------------------

    const rawEmailFound =
      taskAuditLogs.some(
        (log) =>
          log.result?.includes(
            "sarah.johnson@example.com",
          ) ||
          log.result?.includes(
            "I would like to reschedule",
          ) ||
          log.result?.includes(
            "Thanks,",
          ),
      );

    assert(
      !rawEmailFound,
      "Audit log appears to contain raw customer email content.",
    );

    console.log(
      "Data minimization check: PASSED",
    );

    // --------------------------------------------------
    // Validate mission-level audit events
    // --------------------------------------------------

    const allAuditLogs =
      findAuditLogs(100);

    const missionEvents =
      allAuditLogs.filter(
        (log) =>
          log.target ===
          mission.id,
      );

    console.log(
      `Mission audit events: ${missionEvents.length}`,
    );

    const missionStarted =
      missionEvents.some(
        (log) =>
          log.action ===
          "MISSION_STARTED",
      );

    const missionCompleted =
      missionEvents.some(
        (log) =>
          log.action ===
          "MISSION_COMPLETED",
      );

    assert(
      missionStarted,
      "MISSION_STARTED audit event is missing.",
    );

    assert(
      missionCompleted,
      "MISSION_COMPLETED audit event is missing.",
    );

    // --------------------------------------------------
    // Validate mission persistence
    // --------------------------------------------------

    const persistedMission =
      findMissionById(
        mission.id,
      );

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
    // Success
    // --------------------------------------------------

    console.log(
      "Audit persistence verification completed successfully.",
    );

    console.log(
      `Mission: ${mission.id}`,
    );

    console.log(
      `Task: ${task.id}`,
    );

    console.log(
      `Audit events: ${taskAuditLogs.length}`,
    );
  } finally {
    console.log(
      "Audit test records retained for inspection.",
    );
  }
}

main().catch((error) => {
  console.error(
    "Audit verification failed:",
    error,
  );

  process.exit(1);
});