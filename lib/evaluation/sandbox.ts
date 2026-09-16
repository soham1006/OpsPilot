import db from "@/lib/db/client";

import {
  findAppointmentById,
} from "@/lib/db/repositories/appointments";

export interface EvaluationSnapshot {
  appointmentId: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
}

export function snapshotAppointment(
  appointmentId: string,
): EvaluationSnapshot | null {
  const appointment =
    findAppointmentById(appointmentId);

  if (!appointment) {
    return null;
  }

  return {
    appointmentId,
    scheduledStart:
      appointment.scheduledStart,
    scheduledEnd:
      appointment.scheduledEnd,
    status:
      appointment.status,
  };
}

export function snapshotAllAppointments(): EvaluationSnapshot[] {
  const rows = db
    .prepare(`
      SELECT
        id,
        scheduled_start,
        scheduled_end,
        status
      FROM appointments
    `)
    .all() as Array<{
      id: string;
      scheduled_start: string;
      scheduled_end: string;
      status: string;
    }>;

  return rows.map((row) => ({
    appointmentId: row.id,
    scheduledStart:
      row.scheduled_start,
    scheduledEnd:
      row.scheduled_end,
    status:
      row.status,
  }));
}

export function restoreAppointment(
  snapshot: EvaluationSnapshot,
): void {
  db.prepare(`
    UPDATE appointments
    SET
      scheduled_start = ?,
      scheduled_end = ?,
      status = ?
    WHERE id = ?
  `).run(
    snapshot.scheduledStart,
    snapshot.scheduledEnd,
    snapshot.status,
    snapshot.appointmentId,
  );
}

export function restoreEvaluationState(
  snapshots: EvaluationSnapshot[],
): void {
  for (const snapshot of snapshots) {
    restoreAppointment(snapshot);
  }
}