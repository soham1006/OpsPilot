import type { RiskLevel, ToolName } from "@/types/tools";

export const POLICY_DECISIONS = [
  "ALLOW",
  "APPROVAL_REQUIRED",
  "BLOCK",
] as const;

export type PolicyDecision =
  (typeof POLICY_DECISIONS)[number];

export interface PolicyContext {
  toolName: ToolName;
  customerId?: string;
  appointmentId?: string;
  invoiceId?: string;
  amountCents?: number;
  requestedDate?: string;
  requestedTime?: string;
  currentTime?: string;
}

export interface PolicyEvaluation {
  decision: PolicyDecision;
  riskLevel: RiskLevel;
  reason: string;
  requiresApproval: boolean;
}