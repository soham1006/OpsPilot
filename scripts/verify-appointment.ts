import db from "@/lib/db/client";

import {
  findAppointmentById,
} from "@/lib/db/repositories/appointments";

import {
  rescheduleAppointmentTool,
} from "@/lib/tools/implementations";

import {
  evaluateToolPolicy,
} from "@/lib/policies/engine";

import {
  verifyAppointmentReschedule,
} from "@/lib/verification/appointment";

let passed = 0;
let failed = 0;

function check(
  name: string,
  condition: boolean,
) {
  if (condition) {
    console.log(`✓ ${name}`);
    passed++;
  } else {
    console.error(`✗ ${name}`);
    failed++;
  }
}

async function main() {
  // ----------------------------------------------------------
  // Find seeded appointment
  // ----------------------------------------------------------

  const appointment =
    findAppointmentById(
      "A2001",
    );

  check(
    "A2001 exists",
    appointment !== null,
  );

  if (!appointment) {
    process.exit(1);
  }

  const originalStart =
    appointment.scheduledStart;

  // ----------------------------------------------------------
  // Policy
  // ----------------------------------------------------------

  const policy =
    evaluateToolPolicy(
      "reschedule_appointment",
      {
        appointmentId: "A2001",
        requestedDate:
          "2026-09-18",
        requestedTime:
          "10:00",
      },
    );

  check(
    "reschedule policy allows operation",
    policy.decision === "ALLOW",
  );

  // ----------------------------------------------------------
  // Execute
  // ----------------------------------------------------------

  const result =
    rescheduleAppointmentTool({
      appointmentId: "A2001",
      date: "2026-09-18",
      time: "10:00",
    });

  check(
    "reschedule tool executes successfully",
    result.success,
  );

  // ----------------------------------------------------------
  // Verify database state
  // ----------------------------------------------------------

  const updated =
    findAppointmentById(
      "A2001",
    );

  check(
    "appointment still exists after mutation",
    updated !== null,
  );

  check(
    "appointment time changed",
    updated !== null &&
      updated.scheduledStart !==
        originalStart,
  );

  // ----------------------------------------------------------
  // Verification layer
  // ----------------------------------------------------------

  const verification =
    verifyAppointmentReschedule(
      "A2001",
      "2026-09-18",
      "10:00",
    );

  check(
    "reschedule verification passes",
    verification.verified,
  );

  // ----------------------------------------------------------
  // Cleanup
  //
  // Restore the seeded appointment so this script
  // remains repeatable.
  // ----------------------------------------------------------

  db.prepare(`
    UPDATE appointments
    SET
      scheduled_start = ?,
      scheduled_end = ?
    WHERE id = ?
  `).run(
    originalStart,
    appointment.scheduledEnd,
    "A2001",
  );

  const restored =
    findAppointmentById(
      "A2001",
    );

  check(
    "seeded appointment restored",
    restored !== null &&
      restored.scheduledStart ===
        originalStart,
  );

  // ----------------------------------------------------------

  console.log("\n------------------------------");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log("------------------------------");

  if (failed > 0) {
    process.exit(1);
  }

  console.log(
    "Phase 10 appointment verification passed.",
  );
}

main().catch((error) => {
  console.error(
    "\nPhase 10 verification crashed:",
    error,
  );

  process.exit(1);
});