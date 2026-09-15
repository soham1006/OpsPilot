import type { ToolName } from "@/types/tools";

import {
  evaluatePolicyRules,
} from "@/lib/policies/rules";

import type {
  PolicyContext,
  PolicyEvaluation,
} from "@/lib/policies/types";

export function evaluatePolicy(
  context: PolicyContext,
): PolicyEvaluation {
  const result = evaluatePolicyRules(context);

  return {
    decision: result.decision,
    riskLevel: result.riskLevel,
    reason: result.reason,
    requiresApproval:
      result.decision === "APPROVAL_REQUIRED",
  };
}

export function evaluateToolPolicy(
  toolName: ToolName,
  context: Omit<PolicyContext, "toolName"> = {},
): PolicyEvaluation {
  return evaluatePolicy({
    ...context,
    toolName,
  });
}