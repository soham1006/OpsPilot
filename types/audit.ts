export const AUDIT_ACTORS = [
  "AI_AGENT",
  "POLICY_ENGINE",
  "TOOL_EXECUTOR",
  "VERIFICATION",
  "HUMAN",
  "SYSTEM",
] as const;

export type AuditActor = (typeof AUDIT_ACTORS)[number];

export const AUDIT_ACTIONS = [
  "MISSION_STARTED",
  "TASK_STARTED",
  "CUSTOMER_IDENTIFIED",
  "APPOINTMENT_IDENTIFIED",
  "AVAILABILITY_CHECKED",
  "POLICY_EVALUATED",
  "TOOL_EXECUTED",
  "ACTION_BLOCKED",
  "APPROVAL_REQUESTED",
  "APPROVAL_GRANTED",
  "APPROVAL_REJECTED",
  "ACTION_VERIFIED",
  "ACTION_RETRY_REQUIRED",
  "ACTION_ESCALATED",
  "TASK_COMPLETED",
  "TASK_FAILED",
  "MISSION_COMPLETED",
  "MISSION_PARTIAL",
  "MISSION_FAILED",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_APPROVAL_STATUSES = [
  "NOT_REQUIRED",
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;

export type AuditApprovalStatus =
  (typeof AUDIT_APPROVAL_STATUSES)[number];

export const AUDIT_VERIFICATION_STATUSES = [
  "NOT_REQUIRED",
  "PENDING",
  "VERIFIED",
  "FAILED",
] as const;

export type AuditVerificationStatus =
  (typeof AUDIT_VERIFICATION_STATUSES)[number];

export interface AuditEvent {
  taskId?: string | null;
  actor: AuditActor;
  action: AuditAction;
  target?: string | null;
  riskLevel?: string | null;
  policyDecision?: string | null;
  approvalStatus?: AuditApprovalStatus | null;
  result?: string | null;
  verificationStatus?: AuditVerificationStatus | null;
}