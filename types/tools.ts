export const TOOL_NAMES = [
  "get_customer",
  "get_appointment",
  "get_invoice",
  "check_availability",
  "get_company_policy",
  "reschedule_appointment",
  "cancel_appointment",
  "request_refund",
  "create_internal_task",
  "send_email",
  "request_human_approval",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

export const TOOL_CATEGORIES = [
  "READ",
  "WRITE",
  "APPROVAL",
] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

export const RISK_LEVELS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export type RiskLevel = (typeof RISK_LEVELS)[number];

export interface ToolMetadata {
  name: ToolName;
  description: string;
  category: ToolCategory;
  riskLevel: RiskLevel;
}