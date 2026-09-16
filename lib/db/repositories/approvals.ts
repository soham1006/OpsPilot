import db from "@/lib/db/client";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface ApprovalRecord {
  id: string;
  taskId: string;
  action: string;
  amountCents: number | null;
  riskLevel: string;
  reason: string;
  status: ApprovalStatus;
  requestedAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
}

export function createApproval(
  input: {
    taskId: string;
    action: string;
    amountCents?: number;
    riskLevel: string;
    reason: string;
  },
): ApprovalRecord {
  const id = `APR-${crypto.randomUUID()}`;
  const requestedAt =
    new Date().toISOString();

  const approval = db
    .prepare(`
      INSERT INTO approvals (
        id,
        task_id,
        action,
        amount_cents,
        risk_level,
        reason,
        status,
        requested_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
      RETURNING
        id,
        task_id AS taskId,
        action,
        amount_cents AS amountCents,
        risk_level AS riskLevel,
        reason,
        status,
        requested_at AS requestedAt,
        decided_at AS decidedAt,
        decided_by AS decidedBy
    `)
    .get(
      id,
      input.taskId,
      input.action,
      input.amountCents ?? null,
      input.riskLevel,
      input.reason,
      requestedAt,
    ) as ApprovalRecord;

  return approval;
}

export function findApprovalById(
  approvalId: string,
): ApprovalRecord | null {
  const approval = db
    .prepare(`
      SELECT
        id,
        task_id AS taskId,
        action,
        amount_cents AS amountCents,
        risk_level AS riskLevel,
        reason,
        status,
        requested_at AS requestedAt,
        decided_at AS decidedAt,
        decided_by AS decidedBy
      FROM approvals
      WHERE id = ?
      LIMIT 1
    `)
    .get(approvalId) as ApprovalRecord | undefined;

  return approval ?? null;
}

export function findPendingApprovals(): ApprovalRecord[] {
  return db
    .prepare(`
      SELECT
        id,
        task_id AS taskId,
        action,
        amount_cents AS amountCents,
        risk_level AS riskLevel,
        reason,
        status,
        requested_at AS requestedAt,
        decided_at AS decidedAt,
        decided_by AS decidedBy
      FROM approvals
      WHERE status = 'pending'
      ORDER BY requested_at ASC
    `)
    .all() as ApprovalRecord[];
}

export function approveApproval(
  approvalId: string,
  decidedBy: string,
): ApprovalRecord | null {
  const approval =
    findApprovalById(approvalId);

  if (!approval) {
    return null;
  }

  if (approval.status !== "pending") {
    return null;
  }

  const decidedAt =
    new Date().toISOString();

  const updatedApproval = db
    .prepare(`
      UPDATE approvals
      SET
        status = 'approved',
        decided_at = ?,
        decided_by = ?
      WHERE id = ?
        AND status = 'pending'
      RETURNING
        id,
        task_id AS taskId,
        action,
        amount_cents AS amountCents,
        risk_level AS riskLevel,
        reason,
        status,
        requested_at AS requestedAt,
        decided_at AS decidedAt,
        decided_by AS decidedBy
    `)
    .get(
      decidedAt,
      decidedBy,
      approvalId,
    ) as ApprovalRecord | undefined;

  return updatedApproval ?? null;
}

export function rejectApproval(
  approvalId: string,
  decidedBy: string,
): ApprovalRecord | null {
  const approval =
    findApprovalById(approvalId);

  if (!approval) {
    return null;
  }

  if (approval.status !== "pending") {
    return null;
  }

  const decidedAt =
    new Date().toISOString();

  const updatedApproval = db
    .prepare(`
      UPDATE approvals
      SET
        status = 'rejected',
        decided_at = ?,
        decided_by = ?
      WHERE id = ?
        AND status = 'pending'
      RETURNING
        id,
        task_id AS taskId,
        action,
        amount_cents AS amountCents,
        risk_level AS riskLevel,
        reason,
        status,
        requested_at AS requestedAt,
        decided_at AS decidedAt,
        decided_by AS decidedBy
    `)
    .get(
      decidedAt,
      decidedBy,
      approvalId,
    ) as ApprovalRecord | undefined;

  return updatedApproval ?? null;
}