import type { RiskLevel, ToolName } from "@/types/tools";

import type {
  PolicyContext,
  PolicyDecision,
} from "@/lib/policies/types";

export interface PolicyRuleResult {
  decision: PolicyDecision;
  riskLevel: RiskLevel;
  reason: string;
}

const DEFAULT_RISK_BY_TOOL: Record<
  ToolName,
  RiskLevel
> = {
  get_customer: "LOW",
  get_appointment: "LOW",
  get_invoice: "LOW",
  check_availability: "LOW",
  get_company_policy: "LOW",
  reschedule_appointment: "LOW",
  cancel_appointment: "LOW",
  request_refund: "HIGH",
  create_internal_task: "LOW",
  send_email: "LOW",
  request_human_approval: "HIGH",
};

export function evaluatePolicyRules(
  context: PolicyContext,
): PolicyRuleResult {
  const { toolName } = context;


  // ----------------------------------------------------------
  // Refund policy
  // ----------------------------------------------------------

  if (toolName === "request_refund") {
    if (
      typeof context.amountCents !== "number" ||
      context.amountCents <= 0
    ) {
      return {
        decision: "BLOCK",
        riskLevel: "HIGH",
        reason:
          "A refund requires a valid positive amount.",
      };
    }

    return {
      decision: "APPROVAL_REQUIRED",
      riskLevel: "HIGH",
      reason:
        "Refunds require human authorization before execution.",
    };
  }

  // ----------------------------------------------------------
  // Human approval tool itself
  // ----------------------------------------------------------

  if (toolName === "request_human_approval") {
    return {
      decision: "ALLOW",
      riskLevel: "HIGH",
      reason:
        "Creating an approval request is permitted for sensitive actions.",
    };
  }

  // ----------------------------------------------------------
  // Normal reads
  // ----------------------------------------------------------

  if (
    toolName === "get_customer" ||
    toolName === "get_appointment" ||
    toolName === "get_invoice" ||
    toolName === "check_availability" ||
    toolName === "get_company_policy"
  ) {
    return {
      decision: "ALLOW",
      riskLevel: "LOW",
      reason: "Read operation is permitted.",
    };
  }

  // ----------------------------------------------------------
  // Appointment operations
  // ----------------------------------------------------------

  if (toolName === "reschedule_appointment") {
    if (
      !context.appointmentId ||
      !context.requestedDate ||
      !context.requestedTime
    ) {
      return {
        decision: "BLOCK",
        riskLevel: "LOW",
        reason:
          "Appointment rescheduling requires an appointment and requested date/time.",
      };
    }

    return {
      decision: "ALLOW",
      riskLevel: "LOW",
      reason:
        "Appointment rescheduling is permitted subject to availability and policy verification.",
    };
  }

if (toolName === "cancel_appointment") {
  if (!context.appointmentId) {
    return {
      decision: "BLOCK",
      riskLevel: "LOW",
      reason:
        "Appointment cancellation requires an appointment identifier.",
    };
  }

  if (!context.currentTime) {
    return {
      decision: "BLOCK",
      riskLevel: "LOW",
      reason:
        "Cancellation requires a known current time to enforce the cancellation policy.",
    };
  }

  if (!context.requestedDate || !context.requestedTime) {
    return {
      decision: "BLOCK",
      riskLevel: "LOW",
      reason:
        "Cancellation requires the appointment date and time to enforce the cancellation policy.",
    };
  }

  const currentTime = new Date(context.currentTime);

  const appointmentTime = new Date(
    `${context.requestedDate}T${context.requestedTime}:00Z`,
  );

  if (
    Number.isNaN(currentTime.getTime()) ||
    Number.isNaN(appointmentTime.getTime())
  ) {
    return {
      decision: "BLOCK",
      riskLevel: "LOW",
      reason:
        "Cancellation could not be authorized because the appointment time or current time is invalid.",
    };
  }

  const hoursUntilAppointment =
    (appointmentTime.getTime() - currentTime.getTime()) /
    (1000 * 60 * 60);

  if (hoursUntilAppointment < 24) {
    return {
      decision: "BLOCK",
      riskLevel: "LOW",
      reason:
        "Appointments cannot be cancelled less than 24 hours before the scheduled start time.",
    };
  }

  return {
    decision: "ALLOW",
    riskLevel: "LOW",
    reason:
      "Appointment cancellation is permitted because the appointment is at least 24 hours away.",
  };
}
  

  // ----------------------------------------------------------
  // Internal task
  // ----------------------------------------------------------

  if (toolName === "create_internal_task") {
    return {
      decision: "ALLOW",
      riskLevel: "LOW",
      reason:
        "Creating an internal operational task is permitted.",
    };
  }

  // ----------------------------------------------------------
  // Email
  // ----------------------------------------------------------

  if (toolName === "send_email") {
    return {
      decision: "ALLOW",
      riskLevel: "LOW",
      reason:
        "Customer communication is permitted after the underlying action is authorized and verified.",
    };
  }

  // ----------------------------------------------------------
  // Defensive fallback
  // ----------------------------------------------------------

  return {
    decision: "BLOCK",
    riskLevel: DEFAULT_RISK_BY_TOOL[toolName],
    reason:
      "No explicit policy rule permits this operation.",
  };
}

