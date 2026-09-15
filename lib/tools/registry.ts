import type { ToolMetadata, ToolName } from "@/types/tools";

export const TOOL_REGISTRY: Record<ToolName, ToolMetadata> = {
  get_customer: {
    name: "get_customer",
    description: "Retrieve a customer using an approved identifier.",
    category: "READ",
    riskLevel: "LOW",
  },

  get_appointment: {
    name: "get_appointment",
    description: "Retrieve appointment information.",
    category: "READ",
    riskLevel: "LOW",
  },

  get_invoice: {
    name: "get_invoice",
    description: "Retrieve invoice information.",
    category: "READ",
    riskLevel: "LOW",
  },

  check_availability: {
    name: "check_availability",
    description: "Check appointment availability.",
    category: "READ",
    riskLevel: "LOW",
  },

  get_company_policy: {
    name: "get_company_policy",
    description: "Retrieve the relevant company policy.",
    category: "READ",
    riskLevel: "LOW",
  },

  reschedule_appointment: {
    name: "reschedule_appointment",
    description: "Request an appointment reschedule.",
    category: "WRITE",
    riskLevel: "LOW",
  },

  cancel_appointment: {
    name: "cancel_appointment",
    description: "Request appointment cancellation.",
    category: "WRITE",
    riskLevel: "LOW",
  },

  request_refund: {
    name: "request_refund",
    description: "Request a customer refund.",
    category: "WRITE",
    riskLevel: "HIGH",
  },

  create_internal_task: {
    name: "create_internal_task",
    description: "Create an internal operations task.",
    category: "WRITE",
    riskLevel: "LOW",
  },

  send_email: {
    name: "send_email",
    description: "Send an approved customer-facing email.",
    category: "WRITE",
    riskLevel: "LOW",
  },

  request_human_approval: {
    name: "request_human_approval",
    description: "Request human approval for a sensitive action.",
    category: "APPROVAL",
    riskLevel: "HIGH",
  },
};

export function isRegisteredTool(
  toolName: string,
): toolName is ToolName {
  return Object.prototype.hasOwnProperty.call(
    TOOL_REGISTRY,
    toolName,
  );
}

export function getToolMetadata(
  toolName: string,
): ToolMetadata | null {
  if (!isRegisteredTool(toolName)) {
    return null;
  }

  return TOOL_REGISTRY[toolName];
}