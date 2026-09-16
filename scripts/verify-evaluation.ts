import {
  runEvaluationSuite,
} from "@/lib/evaluation/runner";

import {
  EVALUATION_CASES,
} from "@/lib/evaluation/cases";

import type {
  AgentState,
} from "@/lib/agent/types";

async function main(): Promise<void> {
  const mockAgentRunner =
    async ({
      body,
    }: {
      sender: string;
      subject: string;
      body: string;
    }): Promise<AgentState> => {
      const isRefund =
        body
          .toLowerCase()
          .includes("refund");

      if (isRefund) {
        return {
          mission:
            "Evaluation mock",

          plan: {
            intent:
              "REFUND_REQUEST",

            summary:
              "Evaluation refund request.",

            confidence: 1,

            entities: {
              customerName: null,
              customerEmail: null,
              appointmentReference: null,
              requestedDate: null,
              requestedTime: null,
              refundAmountCents: null,
            },

            requestedAction:
              "Request refund.",

            missingInformation: [],

            proposedSteps: [],

            riskSignals: [],
          },

          status:
            "WAITING_FOR_APPROVAL",

          currentStep: 2,

          steps: [
            {
              stepNumber: 1,
              action:
                "IDENTIFY_CUSTOMER",
              toolName:
                "get_customer",
            },

            {
              stepNumber: 2,
              action:
                "FIND_INVOICE",
              toolName:
                "get_invoice",
            },
          ],

          finalMessage:
            "Human approval required.",
        };
      }

      return {
        mission:
          "Evaluation mock",

        plan: {
          intent:
            "APPOINTMENT_RESCHEDULE",

          summary:
            "Evaluation appointment reschedule.",

          confidence: 1,

          entities: {
            customerName: null,
            customerEmail: null,
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
            "Reschedule appointment.",

          missingInformation: [],

          proposedSteps: [],

          riskSignals: [],
        },

        status:
          "COMPLETED",

        currentStep: 5,

        steps: [
          {
            stepNumber: 1,
            action:
              "IDENTIFY_CUSTOMER",
            toolName:
              "get_customer",
          },

          {
            stepNumber: 2,
            action:
              "FIND_APPOINTMENT",
            toolName:
              "get_appointment",
          },

          {
            stepNumber: 3,
            action:
              "CHECK_APPOINTMENT_AVAILABILITY",
            toolName:
              "check_availability",
          },

          {
            stepNumber: 4,
            action:
              "RESCHEDULE_APPOINTMENT",
            toolName:
              "reschedule_appointment",
          },

          {
            stepNumber: 5,
            action:
              "VERIFY_RESCHEDULE",
          },
        ],

        finalMessage:
          "Evaluation completed.",
      };
    };

  const {
    results,
    summary,
  } =
    await runEvaluationSuite(
      EVALUATION_CASES,
      mockAgentRunner,
    );

  console.log(
    "Evaluation summary:",
    JSON.stringify(
      summary,
      null,
      2,
    ),
  );

  console.log(
    "\nCase results:",
  );

  for (const result of results) {
    console.log(
      `${result.caseId} | ` +
        `${result.category} | ` +
        `${result.passed ? "PASS" : "FAIL"} | ` +
        `${result.error ?? "OK"}`,
    );
  }

  if (
    summary.totalCases !==
    EVALUATION_CASES.length
  ) {
    throw new Error(
      "Evaluation case count mismatch.",
    );
  }

  console.log(
    "\nEvaluation runner verification completed successfully.",
  );
}

main().catch((error) => {
  console.error(
    "Evaluation verification failed:",
    error,
  );

  process.exit(1);
});