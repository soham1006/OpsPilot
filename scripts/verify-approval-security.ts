import db from "@/lib/db/client";
import { requestRefundTool } from "@/lib/tools/implementations";
import {
  createApprovalRequest,
} from "@/lib/agent/approval";
import {
  approveApproval,
  rejectApproval,
} from "@/lib/db/repositories/approvals";
import {
  executeApprovedRefund,
} from "@/lib/agent/approved-refund";
import {
  findInvoiceById,
} from "@/lib/db/repositories/invoices";
import {
  evaluateToolPolicy,
} from "@/lib/policies/engine";

type SecurityTest = {
  name: string;
  run: () => void | Promise<void>;
};

function createTestApproval(
  action: string,
  amountCents: number,
  referenceId: string,
) {
  return createApprovalRequest({
    action,
    reason: "Security verification",
    riskLevel: "HIGH",
    referenceId,
    amountCents,
  });
}

const tests: SecurityTest[] = [
  {
    name: "Refund policy requires approval",
    run: () => {
      const result = evaluateToolPolicy("request_refund", {
        amountCents: 5000,
      });

      if (result.decision !== "APPROVAL_REQUIRED") {
        throw new Error(
          `Expected APPROVAL_REQUIRED, received ${result.decision}.`,
        );
      }

      if (!result.requiresApproval) {
        throw new Error(
          "Refund policy did not mark the operation as requiring approval.",
        );
      }
    },
  },

  {
    name: "Nonexistent approval cannot execute refund",
    run: () => {
      const result =
        executeApprovedRefund(
          "APR-DOES-NOT-EXIST",
        );

      if (result.success) {
        throw new Error(
          "Refund executed using a nonexistent approval.",
        );
      }
    },
  },

  {
    name: "Pending approval cannot execute refund",
    run: () => {
      const approvalResult =
        createTestApproval(
          "request_refund",
          5000,
          "I3001",
        );

      const result =
        executeApprovedRefund(
          approvalResult.approval.id,
        );

      if (result.success) {
        throw new Error(
          "Pending approval incorrectly authorized a refund.",
        );
      }
    },
  },

  {
    name: "Rejected approval cannot execute refund",
    run: () => {
      const approvalResult =
        createTestApproval(
          "request_refund",
          5000,
          "I3001",
        );

      const rejected =
        rejectApproval(
          approvalResult.approval.id,
          "security-test-reviewer",
        );

      if (!rejected) {
        throw new Error(
          "Could not reject test approval.",
        );
      }

      const result =
        executeApprovedRefund(
          approvalResult.approval.id,
        );

      if (result.success) {
        throw new Error(
          "Rejected approval incorrectly authorized a refund.",
        );
      }
    },
  },

  {
    name: "Approval for another action cannot authorize refund",
    run: () => {
      const approvalResult =
        createTestApproval(
          "cancel_appointment",
          5000,
          "I3001",
        );

      const approved =
        approveApproval(
          approvalResult.approval.id,
          "security-test-reviewer",
        );

      if (!approved) {
        throw new Error(
          "Could not approve test approval.",
        );
      }

      const result =
        executeApprovedRefund(
          approvalResult.approval.id,
        );

      if (result.success) {
        throw new Error(
          "Approval for another action authorized a refund.",
        );
      }
    },
  },

  {
    name: "Approved refund with invalid invoice cannot execute",
    run: () => {
      const approvalResult =
        createTestApproval(
          "request_refund",
          5000,
          "NONEXISTENT-INVOICE",
        );

      const approved =
        approveApproval(
          approvalResult.approval.id,
          "security-test-reviewer",
        );

      if (!approved) {
        throw new Error(
          "Could not approve test approval.",
        );
      }

      const result =
        executeApprovedRefund(
          approvalResult.approval.id,
        );

      if (result.success) {
        throw new Error(
          "Refund executed against a nonexistent invoice.",
        );
      }
    },
  },

  {
    name: "Approved refund cannot exceed invoice amount",
    run: () => {
      const invoice =
        findInvoiceById("I3001");

      if (!invoice) {
        throw new Error(
          "Test invoice I3001 does not exist.",
        );
      }

      const approvalResult =
        createTestApproval(
          "request_refund",
          invoice.amountCents + 1,
          invoice.id,
        );

      const approved =
        approveApproval(
          approvalResult.approval.id,
          "security-test-reviewer",
        );

      if (!approved) {
        throw new Error(
          "Could not approve test approval.",
        );
      }

      const result =
        executeApprovedRefund(
          approvalResult.approval.id,
        );

      if (result.success) {
        throw new Error(
          "Refund exceeding invoice amount was executed.",
        );
      }
    },
  },

 {
  name: "Approved refund executes only after genuine approval",
  run: () => {
    const invoice =
      findInvoiceById("I3001");

    if (!invoice) {
      throw new Error(
        "Test invoice I3001 does not exist.",
      );
    }

    const originalStatus =
      invoice.status;

    try {
      const amountCents =
        Math.min(
          1000,
          invoice.amountCents,
        );

      const approvalResult =
        createTestApproval(
          "request_refund",
          amountCents,
          invoice.id,
        );

      const approved =
        approveApproval(
          approvalResult.approval.id,
          "security-test-reviewer",
        );

      if (!approved) {
        throw new Error(
          "Could not approve test refund.",
        );
      }

      const result =
        executeApprovedRefund(
          approvalResult.approval.id,
        );

      if (!result.success) {
        throw new Error(
          result.error ??
            "Genuinely approved refund failed.",
        );
      }
    } finally {
      db
        .prepare(`
          UPDATE invoices
          SET status = ?
          WHERE id = ?
        `)
        .run(
          originalStatus,
          invoice.id,
        );
    }
  },
},

  {
    name: "Direct refund tool is not authorization",
    run: () => {
      /*
       * requestRefundTool performs the underlying mutation.
       *
       * Therefore the security invariant is enforced BEFORE
       * this function is called by the agent:
       *
       * request_refund
       *      ↓
       * policy
       *      ↓
       * APPROVAL_REQUIRED
       *      ↓
       * agent must stop
       *
       * This test documents that the tool itself is an execution
       * primitive, not an authorization mechanism.
       */
      const result =
        evaluateToolPolicy(
          "request_refund",
          {
            amountCents: 5000,
          },
        );

      if (
        result.decision !==
        "APPROVAL_REQUIRED"
      ) {
        throw new Error(
          "Refund tool does not have an approval-required policy.",
        );
      }

      if (!result.requiresApproval) {
        throw new Error(
          "Refund tool policy does not require approval.",
        );
      }

      void requestRefundTool;
    },
  },
];

function main() {
  console.log("========================================");
  console.log(
    "APPROVAL-BYPASS SECURITY VERIFICATION",
  );
  console.log("========================================\n");

  let passed = 0;

  for (const test of tests) {
    try {
      test.run();

      console.log(
        `✓ ${test.name}`,
      );

      passed++;
    } catch (error) {
      console.error(
        `✗ ${test.name}`,
      );

      if (error instanceof Error) {
        console.error(
          `  ${error.message}`,
        );
      } else {
        console.error(
          "  Unknown error",
        );
      }

      process.exitCode = 1;
    }
  }

  console.log("\n========================================");
  console.log(
    `Approval security tests: ${passed}/${tests.length} passed`,
  );
  console.log("========================================");

  if (
    passed !== tests.length
  ) {
    console.error(
      "\nApproval-bypass security verification failed.",
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    "\nApproval-bypass security verification passed.",
  );
}

main();