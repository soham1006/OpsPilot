import {
  createTask,
} from "@/lib/db/repositories/tasks";

import {
  createApproval,
  findApprovalById,
  type ApprovalRecord,
} from "@/lib/db/repositories/approvals";

import type { RiskLevel } from "@/types/tools";

export interface CreateApprovalRequestInput {
  action: string;
  reason: string;
  riskLevel: RiskLevel;
  referenceId: string;
  amountCents?: number;
  sourceEmailId?: string;
}

export interface ApprovalRequestResult {
  approval: ApprovalRecord;
  taskId: string;
}

export function createApprovalRequest(
  input: CreateApprovalRequestInput,
): ApprovalRequestResult {
  const task = createTask({
    title: `Approval required: ${input.action}`,
    description: input.reason,
    priority:
      input.riskLevel === "CRITICAL"
        ? "HIGH"
        : input.riskLevel === "HIGH"
          ? "HIGH"
          : "MEDIUM",
    sourceEmailId:
      input.sourceEmailId,
  });

  const approval = createApproval({
    taskId: task.id,
    action: input.action,
    amountCents: input.amountCents,
    riskLevel: input.riskLevel,
    reason:
      `${input.reason} ` +
      `Reference: ${input.referenceId}.`,
  });

  return {
    approval,
    taskId: task.id,
  };
}

export function getApprovalRequest(
  approvalId: string,
): ApprovalRecord | null {
  return findApprovalById(approvalId);
}