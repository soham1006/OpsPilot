import {
  findAppointmentById,
} from "@/lib/db/repositories/appointments";

export interface AppointmentVerification {
  verified: boolean;
  appointmentId: string;
  expectedDate: string;
  expectedTime: string;
  actualScheduledStart: string | null;
  reason: string;
}

export function verifyAppointmentReschedule(
  appointmentId: string,
  expectedDate: string,
  expectedTime: string,
): AppointmentVerification {
  const appointment =
    findAppointmentById(
      appointmentId,
    );

  if (!appointment) {
    return {
      verified: false,
      appointmentId,
      expectedDate,
      expectedTime,
      actualScheduledStart: null,
      reason:
        "Appointment could not be found after rescheduling.",
    };
  }

  const expectedStart =
    new Date(
      `${expectedDate}T${expectedTime}:00Z`,
    );

  const actualStart =
    new Date(
      appointment.scheduledStart,
    );

  if (
    Number.isNaN(
      expectedStart.getTime(),
    ) ||
    Number.isNaN(
      actualStart.getTime(),
    )
  ) {
    return {
      verified: false,
      appointmentId,
      expectedDate,
      expectedTime,
      actualScheduledStart:
        appointment.scheduledStart,
      reason:
        "Unable to compare the requested and actual appointment times.",
    };
  }

  const verified =
    expectedStart.getTime() ===
    actualStart.getTime();

  return {
    verified,
    appointmentId,
    expectedDate,
    expectedTime,
    actualScheduledStart:
      appointment.scheduledStart,
    reason: verified
      ? "Appointment reschedule verified successfully."
      : "Appointment time does not match the requested reschedule time.",
  };
}

export function verifyAppointmentCancellation(
  appointmentId: string,
): {
  verified: boolean;
  appointmentId: string;
  expectedStatus: string;
  actualStatus: string | null;
  reason: string;
} {
  const appointment =
    findAppointmentById(
      appointmentId,
    );

  if (!appointment) {
    return {
      verified: false,
      appointmentId,
      expectedStatus: "cancelled",
      actualStatus: null,
      reason:
        "Appointment could not be found after cancellation.",
    };
  }

  const verified =
    appointment.status === "cancelled";

  return {
    verified,
    appointmentId,
    expectedStatus: "cancelled",
    actualStatus: appointment.status,
    reason: verified
      ? "Appointment cancellation verified successfully."
      : "Appointment status does not show cancelled.",
  };
}