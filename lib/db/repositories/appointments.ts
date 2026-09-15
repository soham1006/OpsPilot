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

export function rescheduleAppointment(
  appointmentId: string,
  requestedDate: string,
  requestedTime: string,
): AppointmentRecord | null {
  const current =
    findAppointmentById(appointmentId);

  if (!current) {
    return null;
  }

  const currentStart =
    new Date(current.scheduledStart);

  const currentEnd =
    new Date(current.scheduledEnd);

  const durationMs =
    currentEnd.getTime() -
    currentStart.getTime();

  const newStart =
    new Date(
      `${requestedDate}T${requestedTime}:00Z`,
    );

  if (Number.isNaN(newStart.getTime())) {
    return null;
  }

  const newEnd =
    new Date(
      newStart.getTime() +
        durationMs,
    );

  const appointment =
    db
      .prepare(`
        UPDATE appointments
        SET
          scheduled_start = ?,
          scheduled_end = ?
        WHERE id = ?
        RETURNING
          id,
          customer_id AS customerId,
          service,
          scheduled_start AS scheduledStart,
          scheduled_end AS scheduledEnd,
          status,
          technician,
          location
      `)
      .get(
        newStart.toISOString(),
        newEnd.toISOString(),
        appointmentId,
      ) as AppointmentRecord | undefined;

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