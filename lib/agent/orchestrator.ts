import {
  createAgentPlan,
} from "@/lib/ai/gemini";

import {
  executeRegisteredTool,
  validateToolArguments,
} from "@/lib/tools/execute";

import {
  isRegisteredTool,
} from "@/lib/tools/registry";

import {
  evaluateToolPolicy,
} from "@/lib/policies/engine";

import {
  addAgentStep,
  attachPlan,
  createAgentState,
  MAX_AGENT_STEPS,
  setAgentStatus,
} from "@/lib/agent/state";

import type {
  AgentState,
} from "@/lib/agent/types";

import type {
  AgentPlan,
} from "@/types/agent";

type PlannerInput = {
  sender: string;
  subject: string;
  body: string;
};

interface PlannedTool {
  toolName:
    | "get_customer"
    | "get_appointment"
    | "check_availability"
    | "get_company_policy"
    | "get_invoice";
  arguments: Record<string, unknown>;
}

function mapPlanStepToTool(
  step: AgentPlan["proposedSteps"][number],
  plan: AgentPlan,
): PlannedTool | null {
  const entities = plan.entities;

  switch (step.action) {
    case "IDENTIFY_CUSTOMER": {
      if (entities.customerEmail) {
        return {
          toolName: "get_customer",
          arguments: {
            email: entities.customerEmail,
          },
        };
      }

      if (entities.customerName) {
        return {
          toolName: "get_customer",
          arguments: {
            name: entities.customerName,
          },
        };
      }

      return null;
    }

    case "FIND_APPOINTMENT": {
      if (!entities.appointmentReference) {
        return null;
      }

      return {
        toolName: "get_appointment",
        arguments: {
          appointmentId:
            entities.appointmentReference,
        },
      };
    }

    case "CHECK_APPOINTMENT_AVAILABILITY": {
      if (
        !entities.requestedDate ||
        !entities.requestedTime
      ) {
        return null;
      }

      return {
        toolName: "check_availability",
        arguments: {
          date: entities.requestedDate,
          time: entities.requestedTime,
          durationMinutes: 60,
        },
      };
    }

    case "READ_RELEVANT_POLICY": {
      switch (plan.intent) {
        case "APPOINTMENT_RESCHEDULE":
          return {
            toolName: "get_company_policy",
            arguments: {
              policyType: "APPOINTMENT",
            },
          };

        case "APPOINTMENT_CANCEL":
          return {
            toolName: "get_company_policy",
            arguments: {
              policyType: "CANCELLATION",
            },
          };

        case "REFUND_REQUEST":
          return {
            toolName: "get_company_policy",
            arguments: {
              policyType: "REFUND",
            },
          };

        case "BANK_ACCOUNT_CHANGE":
          return {
            toolName: "get_company_policy",
            arguments: {
              policyType: "BANK_ACCOUNT_CHANGE",
            },
          };

        default:
          return {
            toolName: "get_company_policy",
            arguments: {
              policyType: "GENERAL",
            },
          };
      }
    }

    case "REVIEW_BILLING_CONTEXT": {
      if (!entities.refundAmountCents) {
        return null;
      }

      // At this stage the planner may not know the invoice ID.
      // We therefore require an explicit appointment/invoice
      // reference rather than guessing.
      return null;
    }

    case "PREPARE_CUSTOMER_RESPONSE":
      return null;

    case "ESCALATE_FOR_CLARIFICATION":
      return null;

    default:
      return null;
  }
}

export async function runAgent(
  input: PlannerInput,
): Promise<AgentState> {
  let state = createAgentState(
    input.body,
  );

  state = setAgentStatus(
    state,
    "RUNNING",
  );

  // ----------------------------------------------------------
  // STEP 1 — Planning
  // ----------------------------------------------------------

  let plan: AgentPlan;

  try {
    plan = await createAgentPlan(input);
  } catch (error) {
    return {
      ...state,
      status: "FAILED",
      finalMessage:
        error instanceof Error
          ? error.message
          : "Agent planning failed.",
    };
  }

  state = attachPlan(
    state,
    plan,
  );

  // ----------------------------------------------------------
  // Risk / confidence guard
  // ----------------------------------------------------------

  if (plan.confidence < 0.5) {
    return {
      ...state,
      status: "BLOCKED",
      finalMessage:
        "Agent confidence is too low to continue autonomously.",
    };
  }

  // ----------------------------------------------------------
  // Missing information guard
  // ----------------------------------------------------------

  if (
    plan.missingInformation.length > 0 &&
    plan.proposedSteps.length === 0
  ) {
    return {
      ...state,
      status: "BLOCKED",
      finalMessage:
        "The request requires additional information before execution.",
    };
  }

  // ----------------------------------------------------------
  // Bounded execution loop
  // ----------------------------------------------------------

  for (
    let index = 0;
    index < plan.proposedSteps.length;
    index++
  ) {
    const stepNumber = index + 2;

    if (
      stepNumber > MAX_AGENT_STEPS
    ) {
      return {
        ...state,
        status: "MAX_STEPS_REACHED",
        finalMessage:
          "Agent stopped after reaching the maximum step limit.",
      };
    }

    const plannedStep =
      plan.proposedSteps[index];

    const mappedTool =
      mapPlanStepToTool(
        plannedStep,
        plan,
      );

    // --------------------------------------------------------
    // No executable tool mapping
    // --------------------------------------------------------

    if (!mappedTool) {
      state = addAgentStep(
        state,
        {
          stepNumber,
          action: plannedStep.action,
          observation:
            `Planning step "${plannedStep.action}" requires clarification or is not executable yet.`,
        },
      );

      continue;
    }

    // --------------------------------------------------------
    // Registry
    // --------------------------------------------------------

    if (
      !isRegisteredTool(
        mappedTool.toolName,
      )
    ) {
      state = addAgentStep(
        state,
        {
          stepNumber,
          action: plannedStep.action,
          toolName: mappedTool.toolName,
          arguments: mappedTool.arguments,
          observation:
            "Mapped tool is not registered.",
        },
      );

      return {
        ...state,
        status: "BLOCKED",
        finalMessage:
          `Tool "${mappedTool.toolName}" is not registered.`,
      };
    }

    // --------------------------------------------------------
    // Argument validation
    // --------------------------------------------------------

    const argumentValidation =
      validateToolArguments(
        mappedTool.toolName,
        mappedTool.arguments,
      );

    if (
      !argumentValidation.success
    ) {
      state = addAgentStep(
        state,
        {
          stepNumber,
          action: plannedStep.action,
          toolName: mappedTool.toolName,
          arguments: mappedTool.arguments,
          observation:
            argumentValidation.error,
        },
      );

      return {
        ...state,
        status: "BLOCKED",
        finalMessage:
          "Agent stopped because the generated tool arguments were invalid.",
      };
    }

    // --------------------------------------------------------
    // Deterministic policy
    // --------------------------------------------------------

    const policy =
      evaluateToolPolicy(
        mappedTool.toolName,
        mappedTool.arguments,
      );

    // --------------------------------------------------------
    // BLOCK
    // --------------------------------------------------------

    if (
      policy.decision === "BLOCK"
    ) {
      state = addAgentStep(
        state,
        {
          stepNumber,
          action: plannedStep.action,
          toolName: mappedTool.toolName,
          arguments: mappedTool.arguments,
          policy,
          observation:
            policy.reason,
        },
      );

      return {
        ...state,
        status: "BLOCKED",
        finalMessage:
          policy.reason,
      };
    }

    // --------------------------------------------------------
    // APPROVAL REQUIRED
    // --------------------------------------------------------

    if (
      policy.decision ===
      "APPROVAL_REQUIRED"
    ) {
      state = addAgentStep(
        state,
        {
          stepNumber,
          action: plannedStep.action,
          toolName: mappedTool.toolName,
          arguments: mappedTool.arguments,
          policy,
          observation:
            "Human approval is required before execution.",
        },
      );

      return {
        ...state,
        status: "WAITING_FOR_APPROVAL",
        finalMessage:
          "Human approval is required before this operation can execute.",
      };
    }

    // --------------------------------------------------------
    // ALLOW
    // --------------------------------------------------------

    const result =
      executeRegisteredTool({
        toolName:
          mappedTool.toolName,
        arguments:
          mappedTool.arguments,
      });

    state = addAgentStep(
      state,
      {
        stepNumber,
        action: plannedStep.action,
        toolName:
          mappedTool.toolName,
        arguments:
          mappedTool.arguments,
        policy,
        result,
        observation:
          result.error ??
          "Tool execution completed.",
      },
    );

    // Phase 5 intentionally doesn't execute
    // registered tools yet.
    if (!result.success) {
      return {
        ...state,
        status: "FAILED",
        finalMessage:
          result.error ??
          "Tool execution failed.",
      };
    }
  }

  return {
    ...state,
    status: "COMPLETED",
    finalMessage:
      "Agent completed its planned operations.",
  };
}