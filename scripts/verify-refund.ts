import {
  findInvoiceById,
} from "@/lib/db/repositories/invoices";

import {
  evaluateToolPolicy,
} from "@/lib/policies/engine";

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
  const invoiceId = "I3001";

  const invoice =
    findInvoiceById(invoiceId);

  if (!invoice) {
    throw new Error(
      `Invoice ${invoiceId} was not found.`,
    );
  }

  console.log(
    `Testing refund policy for ${invoiceId}`,
  );

  // --------------------------------------------------------
  // Test 1: Valid refund requires human approval
  // --------------------------------------------------------

  const approvalPolicy =
    evaluateToolPolicy(
      "request_refund",
      {
        invoiceId,
        amountCents: invoice.amountCents,
      },
    );

  assert(
    approvalPolicy.decision ===
      "APPROVAL_REQUIRED",
    "Valid refund requires human approval",
  );

  assert(
    approvalPolicy.requiresApproval === true,
    "Refund policy marks approval as required",
  );

  assert(
    approvalPolicy.riskLevel === "HIGH",
    "Refund is classified as HIGH risk",
  );

  // --------------------------------------------------------
  // Test 2: Invalid refund amount is blocked
  // --------------------------------------------------------

  const invalidPolicy =
    evaluateToolPolicy(
      "request_refund",
      {
        invoiceId,
        amountCents: 0,
      },
    );

  assert(
    invalidPolicy.decision === "BLOCK",
    "Zero-value refund is blocked",
  );

  // --------------------------------------------------------
  // Test 3: Refund exceeding invoice is not
  // automatically authorized
  // --------------------------------------------------------

  const excessiveAmount =
    invoice.amountCents + 1;

  const excessivePolicy =
    evaluateToolPolicy(
      "request_refund",
      {
        invoiceId,
        amountCents: excessiveAmount,
      },
    );

  assert(
    excessivePolicy.decision ===
      "APPROVAL_REQUIRED",
    "Refund policy requires approval even for an excessive requested amount",
  );

  console.log(
    "\nRefund policy verification completed successfully.",
  );
}

main();