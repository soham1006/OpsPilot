import {
  isAllowedNorthstarUrl,
} from "@/lib/browser/browser";

import {
  executeBrowserObservation,
} from "@/lib/browser/executor";

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
  // ------------------------------------------------------------
  // URL security
  // ------------------------------------------------------------

  check(
    "Northstar inbox URL is allowed",
    isAllowedNorthstarUrl(
      "http://localhost:3000/inbox",
    ),
  );

  check(
    "Northstar appointments URL is allowed",
    isAllowedNorthstarUrl(
      "http://localhost:3000/appointments",
    ),
  );

  check(
    "external URL is blocked",
    !isAllowedNorthstarUrl(
      "https://example.com",
    ),
  );

  check(
    "arbitrary localhost route is blocked",
    !isAllowedNorthstarUrl(
      "http://localhost:3000/api/agent/run",
    ),
  );

  // ------------------------------------------------------------
  // Browser observations
  // ------------------------------------------------------------

  const appointment =
    await executeBrowserObservation({
      action: "FIND_APPOINTMENT",
      appointmentId: "A2001",
    });

  check(
    "browser can locate A2001",
    appointment.success &&
      appointment.data !== null &&
      appointment.data.appointmentId ===
        "A2001",
  );

  check(
    "browser observes Sarah's appointment",
    appointment.success &&
      appointment.data !== null &&
      appointment.data.customerId ===
        "C1001",
  );

  const missingAppointment =
    await executeBrowserObservation({
      action: "FIND_APPOINTMENT",
      appointmentId: "A9999",
    });

  check(
    "missing appointment returns null observation",
    missingAppointment.success &&
      missingAppointment.data === null,
  );

  const email =
    await executeBrowserObservation({
      action: "FIND_EMAIL",
      emailId: "E4001",
    });

  check(
    "browser can locate E4001",
    email.success &&
      email.data !== null &&
      email.data.emailId ===
        "E4001",
  );

  // ------------------------------------------------------------

  console.log("\n------------------------------");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log("------------------------------");

  if (failed > 0) {
    process.exit(1);
  }

  console.log(
    "Phase 9 browser verification passed.",
  );
}

main().catch((error) => {
  console.error(
    "\nPhase 9 browser verification crashed:",
    error,
  );

  process.exit(1);
});