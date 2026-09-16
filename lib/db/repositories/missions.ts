import db from "@/lib/db/client";

export const MISSION_STATUSES = [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "PARTIAL",
  "FAILED",
] as const;

export type MissionStatus =
  (typeof MISSION_STATUSES)[number];

export interface MissionRecord {
  id: string;
  goal: string;
  status: MissionStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface MissionTaskRecord {
  missionId: string;
  taskId: string;
  createdAt: string;
}

function ensureMissionTables(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS missions (
      id TEXT PRIMARY KEY,
      goal TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS mission_tasks (
      mission_id TEXT NOT NULL,
      task_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (mission_id, task_id),
      FOREIGN KEY (mission_id) REFERENCES missions(id),
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    );

    CREATE INDEX IF NOT EXISTS idx_missions_status
      ON missions(status);

    CREATE INDEX IF NOT EXISTS idx_mission_tasks_mission
      ON mission_tasks(mission_id);

    CREATE INDEX IF NOT EXISTS idx_mission_tasks_task
      ON mission_tasks(task_id);
  `);
}

export function createMission(
  goal: string,
): MissionRecord {
  ensureMissionTables();

  const id = `M-${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();

  return db
    .prepare(`
      INSERT INTO missions (
        id,
        goal,
        status,
        created_at
      )
      VALUES (?, ?, 'PENDING', ?)
      RETURNING
        id,
        goal,
        status,
        created_at AS createdAt,
        started_at AS startedAt,
        completed_at AS completedAt
    `)
    .get(
      id,
      goal,
      createdAt,
    ) as MissionRecord;
}

export function findMissionById(
  missionId: string,
): MissionRecord | null {
  ensureMissionTables();

  const mission = db
    .prepare(`
      SELECT
        id,
        goal,
        status,
        created_at AS createdAt,
        started_at AS startedAt,
        completed_at AS completedAt
      FROM missions
      WHERE id = ?
      LIMIT 1
    `)
    .get(missionId) as MissionRecord | undefined;

  return mission ?? null;
}

export function findMissions(
  limit = 50,
): MissionRecord[] {
  ensureMissionTables();

  const safeLimit = Math.max(
    1,
    Math.min(limit, 100),
  );

  return db
    .prepare(`
      SELECT
        id,
        goal,
        status,
        created_at AS createdAt,
        started_at AS startedAt,
        completed_at AS completedAt
      FROM missions
      ORDER BY created_at DESC
      LIMIT ?
    `)
    .all(safeLimit) as MissionRecord[];
}

export function addTaskToMission(
  missionId: string,
  taskId: string,
): MissionTaskRecord {
  ensureMissionTables();

  const createdAt = new Date().toISOString();

  return db
    .prepare(`
      INSERT INTO mission_tasks (
        mission_id,
        task_id,
        created_at
      )
      VALUES (?, ?, ?)
      RETURNING
        mission_id AS missionId,
        task_id AS taskId,
        created_at AS createdAt
    `)
    .get(
      missionId,
      taskId,
      createdAt,
    ) as MissionTaskRecord;
}

export function findMissionTasks(
  missionId: string,
): MissionTaskRecord[] {
  ensureMissionTables();

  return db
    .prepare(`
      SELECT
        mission_id AS missionId,
        task_id AS taskId,
        created_at AS createdAt
      FROM mission_tasks
      WHERE mission_id = ?
      ORDER BY created_at ASC
    `)
    .all(missionId) as MissionTaskRecord[];
}

export function updateMissionStatus(
  missionId: string,
  status: MissionStatus,
): MissionRecord | null {
  ensureMissionTables();

  const now = new Date().toISOString();

  if (status === "RUNNING") {
    return db
      .prepare(`
        UPDATE missions
        SET
          status = ?,
          started_at = COALESCE(started_at, ?)
        WHERE id = ?
        RETURNING
          id,
          goal,
          status,
          created_at AS createdAt,
          started_at AS startedAt,
          completed_at AS completedAt
      `)
      .get(
        status,
        now,
        missionId,
      ) as MissionRecord | null;
  }

  if (
    status === "COMPLETED" ||
    status === "PARTIAL" ||
    status === "FAILED"
  ) {
    return db
      .prepare(`
        UPDATE missions
        SET
          status = ?,
          completed_at = ?
        WHERE id = ?
        RETURNING
          id,
          goal,
          status,
          created_at AS createdAt,
          started_at AS startedAt,
          completed_at AS completedAt
      `)
      .get(
        status,
        now,
        missionId,
      ) as MissionRecord | null;
  }

  return db
    .prepare(`
      UPDATE missions
      SET status = ?
      WHERE id = ?
      RETURNING
        id,
        goal,
        status,
        created_at AS createdAt,
        started_at AS startedAt,
        completed_at AS completedAt
    `)
    .get(
      status,
      missionId,
    ) as MissionRecord | null;
}