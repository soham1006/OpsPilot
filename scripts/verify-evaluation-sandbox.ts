import {
  findAppointmentById,
  rescheduleAppointment,
} from "@/lib/db/repositories/appointments";

import {
  snapshotAppointment,
  restoreAppointment,
} from "@/lib/evaluation/sandbox";

function assert(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  const appointmentId =
    "A2001";

  const original =
    snapshotAppointment(
      appointmentId,
    );

  assert(
    original !== null,
    `Appointment "${appointmentId}" was not found.`,
  );

  console.log(
    "Original appointment:",
    original,
  );

  // Simulate a mutation that an evaluation case
  // could perform.
  rescheduleAppointment(
    appointmentId,
    "2026-09-18",
    "10:00",
  );

  const mutated =
    findAppointmentById(
      appointmentId,
    );

  assert(
    mutated !== null,
    "Appointment disappeared after mutation.",
  );

  assert(
    mutated.scheduledStart.startsWith(
      "2026-09-18T10:00",
    ),
    "Test mutation did not occur.",
  );

  console.log(
    "Mutation successfully simulated:",
    mutated.scheduledStart,
  );

  // Restore original state.
  restoreAppointment(
    original,
  );

  const restored =
    findAppointmentById(
      appointmentId,
    );

  assert(
    restored !== null,
    "Appointment could not be restored.",
  );

  assert(
    restored.scheduledStart ===
      original.scheduledStart,
    "Appointment start time was not restored.",
  );

  assert(
    restored.scheduledEnd ===
      original.scheduledEnd,
    "Appointment end time was not restored.",
  );

  assert(
    restored.status ===
      original.status,
    "Appointment status was not restored.",
  );

  console.log(
    "Restored appointment:",
    restored,
  );

  console.log(
    "Evaluation sandbox verification completed successfully.",
  );
}

main().catch((error) => {
  console.error(
    "Evaluation sandbox verification failed:",
    error,
  );

  process.exit(1);
});