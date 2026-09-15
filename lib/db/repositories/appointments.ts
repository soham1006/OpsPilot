import db from "@/lib/db/client";

export interface AppointmentRecord {
  id: string;
  customerId: string;
  service: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  technician: string;
  location: string;
}

export function findAppointmentById(
  appointmentId: string,
): AppointmentRecord | null {
  const appointment = db
    .prepare(`
      SELECT
        id,
        customer_id AS customerId,
        service,
        scheduled_start AS scheduledStart,
        scheduled_end AS scheduledEnd,
        status,
        technician,
        location
      FROM appointments
      WHERE id = ?
      LIMIT 1
    `)
    .get(appointmentId) as AppointmentRecord | undefined;

  return appointment ?? null;
}

export function findAppointmentsByCustomerId(
  customerId: string,
): AppointmentRecord[] {
  return db
    .prepare(`
      SELECT
        id,
        customer_id AS customerId,
        service,
        scheduled_start AS scheduledStart,
        scheduled_end AS scheduledEnd,
        status,
        technician,
        location
      FROM appointments
      WHERE customer_id = ?
      ORDER BY scheduled_start ASC
    `)
    .all(customerId) as AppointmentRecord[];
}

export function findAppointmentAtTime(
  date: string,
  time: string,
): AppointmentRecord | null {
  const appointment = db
    .prepare(`
      SELECT
        id,
        customer_id AS customerId,
        service,
        scheduled_start AS scheduledStart,
        scheduled_end AS scheduledEnd,
        status,
        technician,
        location
      FROM appointments
      WHERE scheduled_start = ?
      LIMIT 1
    `)
    .get(`${date}T${time}:00Z`) as
    | AppointmentRecord
    | undefined;

  return appointment ?? null;
}