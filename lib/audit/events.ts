import {
  type AuditAction,
  type AuditActor,
  type AuditApprovalStatus,
  type AuditEvent,
  type AuditVerificationStatus,
} from "@/types/audit";
import { createAuditLog } from "@/lib/db/repositories/audit-logs";

export interface AuditEventInput extends AuditEvent {
  riskLevel?: string | null;
  policyDecision?: string | null;
  approvalStatus?: AuditApprovalStatus | null;
  verificationStatus?: AuditVerificationStatus | null;
}

export function recordAuditEvent(
  event: AuditEventInput,
) {
  return createAuditLog({
    taskId: event.taskId ?? null,
    actor: event.actor,
    action: event.action,
    target: event.target ?? null,
    riskLevel: event.riskLevel ?? null,
    policyDecision: event.policyDecision ?? null,
    approvalStatus: event.approvalStatus ?? null,
    result: event.result ?? null,
    verificationStatus: event.verificationStatus ?? null,
  });
}

export function recordPolicyDecisionEvent(input: {
  taskId?: string | null;
  action: AuditAction;
  target?: string | null;
  riskLevel: string;
  policyDecision: string;
  result?: string;
}) {
  return recordAuditEvent({
    taskId: input.taskId,
    actor: "POLICY_ENGINE" satisfies AuditActor,
    action: input.action,
    target: input.target,
    riskLevel: input.riskLevel,
    policyDecision: input.policyDecision,
    result: input.result,
  });
}

export function recordToolExecutionEvent(input: {
  taskId?: string | null;
  action: AuditAction;
  target?: string | null;
  riskLevel?: string | null;
  policyDecision?: string | null;
  result: string;
}) {
  return recordAuditEvent({
    taskId: input.taskId,
    actor: "TOOL_EXECUTOR" satisfies AuditActor,
    action: input.action,
    target: input.target,
    riskLevel: input.riskLevel,
    policyDecision: input.policyDecision,
    result: input.result,
  });
}

export function recordVerificationEvent(input: {
  taskId?: string | null;
  target?: string | null;
  result: string;
  verificationStatus: AuditVerificationStatus;
}) {
  return recordAuditEvent({
    taskId: input.taskId,
    actor: "VERIFICATION" satisfies AuditActor,
    action: "ACTION_VERIFIED",
    target: input.target,
    result: input.result,
    verificationStatus: input.verificationStatus,
  });
}