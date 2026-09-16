import db from "@/lib/db/client";

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  sourceEmailId: string | null;
  createdAt: string;
}

export function createTask(input: {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  sourceEmailId?: string;
}): TaskRecord {
  const id = `T-${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();

  const priority =
    input.priority.toLowerCase();

  const task = db
    .prepare(`
      INSERT INTO tasks (
        id,
        title,
        description,
        status,
        priority,
        source_email_id,
        created_at
      )
      VALUES (?, ?, ?, 'open', ?, ?, ?)
      RETURNING
        id,
        title,
        description,
        status,
        priority,
        assigned_to AS assignedTo,
        source_email_id AS sourceEmailId,
        created_at AS createdAt
    `)
    .get(
      id,
      input.title,
      input.description,
      priority,
      input.sourceEmailId ?? null,
      createdAt,
    ) as TaskRecord;

  return task;
}

export function findTaskById(
  taskId: string,
): TaskRecord | null {
  const task = db
    .prepare(`
      SELECT
        id,
        title,
        description,
        status,
        priority,
        assigned_to AS assignedTo,
        source_email_id AS sourceEmailId,
        created_at AS createdAt
      FROM tasks
      WHERE id = ?
      LIMIT 1
    `)
    .get(taskId) as TaskRecord | undefined;

  return task ?? null;
}