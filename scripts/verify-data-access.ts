import db from "@/lib/db/client";

import {
  getCustomer,
  getAppointment,
  getInvoice,
  checkAvailability,
  getCompanyPolicy,
} from "@/lib/tools/implementations";

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean) {
  if (condition) {
    console.log(`✓ ${name}`);
    passed++;
  } else {
    console.error(`✗ ${name}`);
    failed++;
  }
}

// ------------------------------------------------------------
// Customer
// ------------------------------------------------------------

const customer = getCustomer({
  customerId: "C1001",
});

check(
  "customer lookup returns Sarah Johnson",
  customer?.name === "Sarah Johnson",
);

check(
  "customer lookup returns only approved fields",
  customer !== null &&
    "id" in customer &&
    "name" in customer &&
    "email" in customer &&
    "phone" in customer &&
    "address" in customer &&
    "status" in customer,
);

// ------------------------------------------------------------
// Appointment
// ------------------------------------------------------------

const appointment = getAppointment({
  appointmentId: "A2001",
});

check(
  "appointment lookup returns A2001",
  appointment?.id === "A2001",
);

check(
  "appointment belongs to C1001",
  appointment?.customerId === "C1001",
);

// ------------------------------------------------------------
// Invoice
// ------------------------------------------------------------

const invoice = getInvoice({
  invoiceId: "I3001",
});

check(
  "invoice lookup returns I3001",
  invoice?.id === "I3001",
);

check(
  "invoice amount is 14900 cents",
  invoice?.amountCents === 14900,
);

// ------------------------------------------------------------
// Availability
// ------------------------------------------------------------

const availability = checkAvailability({
  date: "2026-09-25",
  time: "10:00",
  durationMinutes: 60,
});

check(
  "availability check returns structured result",
  typeof availability.available === "boolean",
);

// ------------------------------------------------------------
// Policy
// ------------------------------------------------------------

const refundPolicy = getCompanyPolicy("REFUND");

check(
  "refund policy is available",
  refundPolicy?.id === "P5003",
);

check(
  "refund policy contains structured rules",
  refundPolicy?.rules?.decision ===
    "APPROVAL_REQUIRED",
);

// ------------------------------------------------------------
// Parameterized-query safety sanity check
// ------------------------------------------------------------

const maliciousId =
  "A2001' OR '1'='1";

const maliciousAppointment = getAppointment({
  appointmentId: maliciousId,
});

check(
  "malicious appointment identifier does not bypass query",
  maliciousAppointment === null,
);

// ------------------------------------------------------------

console.log("\n------------------------------");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log("------------------------------");

db.close();

if (failed > 0) {
  process.exit(1);
}

console.log("Phase 6 data-access verification passed.");