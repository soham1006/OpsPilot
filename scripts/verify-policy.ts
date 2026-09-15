import {
  evaluateToolPolicy,
} from "@/lib/policies/engine";

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

// ------------------------------------------------------------
// Read operations
// ------------------------------------------------------------

const customerRead = evaluateToolPolicy(
  "get_customer",
);

check(
  "customer read is allowed",
  customerRead.decision === "ALLOW",
);

check(
  "customer read is LOW risk",
  customerRead.riskLevel === "LOW",
);

// ------------------------------------------------------------
// Rescheduling
// ------------------------------------------------------------

const reschedule = evaluateToolPolicy(
  "reschedule_appointment",
  {
    appointmentId: "A2001",
    requestedDate: "2026-09-18",
    requestedTime: "10:00",
  },
);

check(
  "valid reschedule is allowed",
  reschedule.decision === "ALLOW",
);

check(
  "reschedule is LOW risk",
  reschedule.riskLevel === "LOW",
);

// ------------------------------------------------------------
// Missing reschedule information
// ------------------------------------------------------------

const invalidReschedule = evaluateToolPolicy(
  "reschedule_appointment",
  {
    appointmentId: "A2001",
  },
);

check(
  "incomplete reschedule is blocked",
  invalidReschedule.decision === "BLOCK",
);

// ------------------------------------------------------------
// Cancellation
// ------------------------------------------------------------

const cancellation = evaluateToolPolicy(
  "cancel_appointment",
  {
    appointmentId: "A2002",
  },
);

check(
  "valid cancellation is allowed",
  cancellation.decision === "ALLOW",
);

// ------------------------------------------------------------
// Refund
// ------------------------------------------------------------

const refund = evaluateToolPolicy(
  "request_refund",
  {
    invoiceId: "I3003",
    amountCents: 12500,
  },
);

check(
  "refund requires approval",
  refund.decision === "APPROVAL_REQUIRED",
);

check(
  "refund is HIGH risk",
  refund.riskLevel === "HIGH",
);

check(
  "refund explicitly requires approval",
  refund.requiresApproval === true,
);

// ------------------------------------------------------------
// Invalid refund
// ------------------------------------------------------------

const invalidRefund = evaluateToolPolicy(
  "request_refund",
  {
    invoiceId: "I3003",
    amountCents: 0,
  },
);

check(
  "invalid refund is blocked",
  invalidRefund.decision === "BLOCK",
);

// ------------------------------------------------------------
// Approval request
// ------------------------------------------------------------

const approvalRequest = evaluateToolPolicy(
  "request_human_approval",
);

check(
  "human approval request is allowed",
  approvalRequest.decision === "ALLOW",
);

// ------------------------------------------------------------
// Email
// ------------------------------------------------------------

const email = evaluateToolPolicy(
  "send_email",
);

check(
  "email operation is allowed",
  email.decision === "ALLOW",
);

// ------------------------------------------------------------

console.log("\n------------------------------");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log("------------------------------");

if (failed > 0) {
  process.exit(1);
}

console.log("Phase 7 policy verification passed.");