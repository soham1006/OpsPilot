import db from "@/lib/db/client";

export interface ExecutionStepRecord {
  id: string;
  agentRunId: string;
  taskId: string | null;
  stepNumber: number;
  action: string;
  status: string;
  observation: string | null;
  createdAt: string;
}

export function createExecutionStep(
  input: {
    agentRunId: string;
    taskId?: string;
    stepNumber: number;
    action: string;
    status: string;
    observation?: string;
  },
): ExecutionStepRecord {
  const id = `ES-${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();

  return db
    .prepare(`
      INSERT INTO execution_steps (
        id,
        agent_run_id,
        task_id,
        step_number,
        action,
        status,
        observation,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING
        id,
        agent_run_id AS agentRunId,
        task_id AS taskId,
        step_number AS stepNumber,
        action,
        status,
        observation,
        created_at AS createdAt
    `)
    .get(
      id,
      input.agentRunId,
      input.taskId ?? null,
      input.stepNumber,
      input.action,
      input.status,
      input.observation ?? null,
      createdAt,
    ) as ExecutionStepRecord;
}

export function findExecutionStepsByAgentRunId(
  agentRunId: string,
): ExecutionStepRecord[] {
  return db
    .prepare(`
      SELECT
        id,
        agent_run_id AS agentRunId,
        task_id AS taskId,
        step_number AS stepNumber,
        action,
        status,
        observation,
        created_at AS createdAt
      FROM execution_steps
      WHERE agent_run_id = ?
      ORDER BY step_number ASC, created_at ASC
    `)
    .all(agentRunId) as ExecutionStepRecord[];
}

export function findExecutionStepsByTaskId(
  taskId: string,
): ExecutionStepRecord[] {
  return db
    .prepare(`
      SELECT
        id,
        agent_run_id AS agentRunId,
        task_id AS taskId,
        step_number AS stepNumber,
        action,
        status,
        observation,
        created_at AS createdAt
      FROM execution_steps
      WHERE task_id = ?
      ORDER BY step_number ASC, created_at ASC
    `)
    .all(taskId) as ExecutionStepRecord[];
}