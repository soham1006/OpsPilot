import db from "@/lib/db/client";
import {
  findAppointmentById,
  cancelAppointment,
} from "@/lib/db/repositories/appointments";
import { evaluateToolPolicy } from "@/lib/policies/engine";

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }

  console.log(`PASS: ${message}`);
}

function main() {
  const appointmentId = "A2002";

  const appointment =
    findAppointmentById(appointmentId);

  if (!appointment) {
    throw new Error(
      `Appointment ${appointmentId} was not found.`,
    );
  }

  console.log(
    `Testing cancellation for ${appointmentId}`,
  );

  // --------------------------------------------------------
  // Test 1: cancellation >= 24 hours before appointment
  // --------------------------------------------------------

  const appointmentTime =
    new Date(appointment.scheduledStart);

  const allowedCurrentTime =
    new Date(
      appointmentTime.getTime() -
        48 * 60 * 60 * 1000,
    );

  const allowedPolicy =
    evaluateToolPolicy(
      "cancel_appointment",
      {
        appointmentId,
        requestedDate:
          appointmentTime
            .toISOString()
            .slice(0, 10),
        requestedTime:
          appointmentTime
            .toISOString()
            .slice(11, 16),
        currentTime:
          allowedCurrentTime.toISOString(),
      },
    );

  assert(
    allowedPolicy.decision === "ALLOW",
    "Cancellation 48 hours before appointment is allowed",
  );

  // --------------------------------------------------------
  // Test 2: cancellation < 24 hours before appointment
  // --------------------------------------------------------

  const blockedCurrentTime =
    new Date(
      appointmentTime.getTime() -
        12 * 60 * 60 * 1000,
    );

  const blockedPolicy =
    evaluateToolPolicy(
      "cancel_appointment",
      {
        appointmentId,
        requestedDate:
          appointmentTime
            .toISOString()
            .slice(0, 10),
        requestedTime:
          appointmentTime
            .toISOString()
            .slice(11, 16),
        currentTime:
          blockedCurrentTime.toISOString(),
      },
    );

  assert(
    blockedPolicy.decision === "BLOCK",
    "Cancellation 12 hours before appointment is blocked",
  );

  // --------------------------------------------------------
  // Test 3: execute cancellation after ALLOW
  // --------------------------------------------------------

  const cancelled =
    cancelAppointment(appointmentId);

  assert(
    cancelled !== null,
    "Cancellation mutation succeeds",
  );

  assert(
    cancelled?.status === "cancelled",
    "Appointment status becomes cancelled",
  );

  // --------------------------------------------------------
  // Restore seeded state
  // --------------------------------------------------------

  db.prepare(`
    UPDATE appointments
    SET status = 'scheduled'
    WHERE id = ?
  `).run(appointmentId);

  const restored =
    findAppointmentById(appointmentId);

  assert(
    restored?.status === "scheduled",
    "Appointment state restored after verification",
  );

  console.log(
    "\nCancellation verification completed successfully.",
  );
}

main();