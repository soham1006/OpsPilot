import db from "@/lib/db/client";

export interface AgentRunRecord {
  id: string;
  mission: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
}

export function createAgentRun(
  mission: string,
  status = "RUNNING",
): AgentRunRecord {
  const id = `AR-${crypto.randomUUID()}`;
  const startedAt = new Date().toISOString();

  return db
    .prepare(`
      INSERT INTO agent_runs (
        id,
        mission,
        status,
        started_at
      )
      VALUES (?, ?, ?, ?)
      RETURNING
        id,
        mission,
        status,
        started_at AS startedAt,
        completed_at AS completedAt
    `)
    .get(
      id,
      mission,
      status,
      startedAt,
    ) as AgentRunRecord;
}

export function findAgentRunById(
  agentRunId: string,
): AgentRunRecord | null {
  const run = db
    .prepare(`
      SELECT
        id,
        mission,
        status,
        started_at AS startedAt,
        completed_at AS completedAt
      FROM agent_runs
      WHERE id = ?
      LIMIT 1
    `)
    .get(agentRunId) as
    | AgentRunRecord
    | undefined;

  return run ?? null;
}

export function updateAgentRun(
  agentRunId: string,
  status: string,
): AgentRunRecord | null {
  const completedAt =
    status === "RUNNING"
      ? null
      : new Date().toISOString();

  return db
    .prepare(`
      UPDATE agent_runs
      SET
        status = ?,
        completed_at = ?
      WHERE id = ?
      RETURNING
        id,
        mission,
        status,
        started_at AS startedAt,
        completed_at AS completedAt
    `)
    .get(
      status,
      completedAt,
      agentRunId,
    ) as AgentRunRecord | null;
}

export function findLatestAgentRunByMission(
  mission: string,
): AgentRunRecord | null {
  const run = db
    .prepare(
      `
      SELECT
        id,
        mission,
        status,
        started_at,
        completed_at
      FROM agent_runs
      WHERE mission = ?
      ORDER BY started_at DESC
      LIMIT 1
      `,
    )
    .get(mission) as
    | {
        id: string;
        mission: string;
        status: string;
        started_at: string;
        completed_at: string | null;
      }
    | undefined;

  if (!run) {
    return null;
  }

  return {
    id: run.id,
    mission: run.mission,
    status: run.status,
    startedAt: run.started_at,
    completedAt: run.completed_at,
  };
}