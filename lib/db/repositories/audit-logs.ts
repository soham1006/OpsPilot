import { randomUUID } from "crypto";

import db from "@/lib/db/client";

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  taskId: string | null;
  actor: string;
  action: string;
  target: string | null;
  riskLevel: string | null;
  policyDecision: string | null;
  approvalStatus: string | null;
  result: string | null;
  verificationStatus: string | null;
}

export interface CreateAuditLogInput {
  taskId?: string | null;
  actor: string;
  action: string;
  target?: string | null;
  riskLevel?: string | null;
  policyDecision?: string | null;
  approvalStatus?: string | null;
  result?: string | null;
  verificationStatus?: string | null;
}

function mapAuditLog(
  row: {
    id: string;
    timestamp: string;
    task_id: string | null;
    actor: string;
    action: string;
    target: string | null;
    risk_level: string | null;
    policy_decision: string | null;
    approval_status: string | null;
    result: string | null;
    verification_status: string | null;
  },
): AuditLogRecord {
  return {
    id: row.id,
    timestamp: row.timestamp,
    taskId: row.task_id,
    actor: row.actor,
    action: row.action,
    target: row.target,
    riskLevel: row.risk_level,
    policyDecision: row.policy_decision,
    approvalStatus: row.approval_status,
    result: row.result,
    verificationStatus:
      row.verification_status,
  };
}

export function createAuditLog(
  input: CreateAuditLogInput,
): AuditLogRecord {
  const id = `AL-${randomUUID()}`;
  const timestamp =
    new Date().toISOString();

  const row = db
    .prepare(
      `
      INSERT INTO audit_logs (
        id,
        timestamp,
        task_id,
        actor,
        action,
        target,
        risk_level,
        policy_decision,
        approval_status,
        result,
        verification_status
      )
      VALUES (
        @id,
        @timestamp,
        @taskId,
        @actor,
        @action,
        @target,
        @riskLevel,
        @policyDecision,
        @approvalStatus,
        @result,
        @verificationStatus
      )
      RETURNING
        id,
        timestamp,
        task_id,
        actor,
        action,
        target,
        risk_level,
        policy_decision,
        approval_status,
        result,
        verification_status
      `,
    )
    .get({
      id,
      timestamp,
      taskId: input.taskId ?? null,
      actor: input.actor,
      action: input.action,
      target: input.target ?? null,
      riskLevel: input.riskLevel ?? null,
      policyDecision:
        input.policyDecision ?? null,
      approvalStatus:
        input.approvalStatus ?? null,
      result: input.result ?? null,
      verificationStatus:
        input.verificationStatus ?? null,
    }) as {
    id: string;
    timestamp: string;
    task_id: string | null;
    actor: string;
    action: string;
    target: string | null;
    risk_level: string | null;
    policy_decision: string | null;
    approval_status: string | null;
    result: string | null;
    verification_status: string | null;
  };

  return mapAuditLog(row);
}

export function findAuditLogs(
  limit = 100,
): AuditLogRecord[] {
  const rows = db
    .prepare(
      `
      SELECT
        id,
        timestamp,
        task_id,
        actor,
        action,
        target,
        risk_level,
        policy_decision,
        approval_status,
        result,
        verification_status
      FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT ?
      `,
    )
    .all(limit) as Array<{
    id: string;
    timestamp: string;
    task_id: string | null;
    actor: string;
    action: string;
    target: string | null;
    risk_level: string | null;
    policy_decision: string | null;
    approval_status: string | null;
    result: string | null;
    verification_status: string | null;
  }>;

  return rows.map(mapAuditLog);
}

export function findAuditLogsByTaskId(
  taskId: string,
): AuditLogRecord[] {
  const rows = db
    .prepare(
      `
      SELECT
        id,
        timestamp,
        task_id,
        actor,
        action,
        target,
        risk_level,
        policy_decision,
        approval_status,
        result,
        verification_status
      FROM audit_logs
      WHERE task_id = ?
      ORDER BY timestamp ASC
      `,
    )
    .all(taskId) as Array<{
    id: string;
    timestamp: string;
    task_id: string | null;
    actor: string;
    action: string;
    target: string | null;
    risk_level: string | null;
    policy_decision: string | null;
    approval_status: string | null;
    result: string | null;
    verification_status: string | null;
  }>;

  return rows.map(mapAuditLog);
}