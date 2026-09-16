import db from "@/lib/db/client";

import {
  findInvoiceById,
} from "@/lib/db/repositories/invoices";

import {
  createTask,
} from "@/lib/db/repositories/tasks";

import {
  createApproval,
} from "@/lib/db/repositories/approvals";

import {
  executeApprovedRefund,
} from "@/lib/agent/approved-refund";

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
  console.log(
    "Starting approved refund verification...",
  );

  const invoiceId = "I3001";

  const invoice =
    findInvoiceById(invoiceId);

  if (!invoice) {
    throw new Error(
      `Invoice ${invoiceId} was not found.`,
    );
  }

  const originalStatus =
    invoice.status;

  // --------------------------------------------------------
  // Create test task
  // --------------------------------------------------------

  const task = createTask({
    title: "Approved refund verification",
    description:
      "Test task for approval-gated refund execution.",
    priority: "HIGH",
  });

  // --------------------------------------------------------
  // Create PENDING approval
  // --------------------------------------------------------

  const pendingApproval =
    createApproval({
      taskId: task.id,
      action: "request_refund",
      amountCents: 5000,
      riskLevel: "HIGH",
      reason:
        "Test approved refund. " +
        `Reference: ${invoiceId}.`,
    });

  // --------------------------------------------------------
  // Pending approval MUST NOT execute
  // --------------------------------------------------------

  const pendingExecution =
    executeApprovedRefund(
      pendingApproval.id,
    );

  assert(
    pendingExecution.success === false,
    "Pending refund cannot execute",
  );

  // --------------------------------------------------------
  // Create APPROVED approval
  // --------------------------------------------------------

  const approvedTask =
    createTask({
      title: "Approved refund execution",
      description:
        "Test task for approved refund execution.",
      priority: "HIGH",
    });

  const approvedApproval =
    createApproval({
      taskId: approvedTask.id,
      action: "request_refund",
      amountCents: 5000,
      riskLevel: "HIGH",
      reason:
        "Approved refund execution test. " +
        `Reference: ${invoiceId}.`,
    });

  db.prepare(`
    UPDATE approvals
    SET
      status = 'approved',
      decided_at = ?,
      decided_by = ?
    WHERE id = ?
  `).run(
    new Date().toISOString(),
    "human-reviewer",
    approvedApproval.id,
  );

  // --------------------------------------------------------
  // APPROVED refund may execute
  // --------------------------------------------------------

  const approvedExecution =
    executeApprovedRefund(
      approvedApproval.id,
    );

  assert(
    approvedExecution.success === true,
    "Approved refund executes successfully",
  );

  assert(
    approvedExecution.invoice?.status ===
      "refund_requested",
    "Approved refund changes invoice to refund_requested",
  );

  // --------------------------------------------------------
  // Restore invoice
  // --------------------------------------------------------

  db.prepare(`
    UPDATE invoices
    SET status = ?
    WHERE id = ?
  `).run(
    originalStatus,
    invoiceId,
  );

  // --------------------------------------------------------
  // Cleanup
  // --------------------------------------------------------

  db.prepare(`
    DELETE FROM approvals
    WHERE task_id IN (?, ?)
  `).run(
    task.id,
    approvedTask.id,
  );

  db.prepare(`
    DELETE FROM tasks
    WHERE id IN (?, ?)
  `).run(
    task.id,
    approvedTask.id,
  );

  const restoredInvoice =
    findInvoiceById(invoiceId);

  assert(
    restoredInvoice?.status ===
      originalStatus,
    "Invoice state restored after verification",
  );

  console.log(
    "\nApproved refund verification completed successfully.",
  );
}

main();