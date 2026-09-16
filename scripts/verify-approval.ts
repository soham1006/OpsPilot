import db from "@/lib/db/client";

import {
  createTask,
} from "@/lib/db/repositories/tasks";

import {
  createApproval,
  findApprovalById,
  findPendingApprovals,
} from "@/lib/db/repositories/approvals";

import {
  approveHumanRequest,
  rejectHumanRequest,
} from "@/lib/agent/approval-decision";

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
  console.log("Starting approval verification...");

  // --------------------------------------------------------
  // Create test task
  // --------------------------------------------------------

  const task = createTask({
    title: "Test refund approval",
    description:
      "Verification task for approval workflow.",
    priority: "HIGH",
  });

  assert(
    task.id.length > 0,
    "Approval test task is created",
  );

  // --------------------------------------------------------
  // Create pending approval
  // --------------------------------------------------------

  const approval = createApproval({
    taskId: task.id,
    action: "request_refund",
    amountCents: 5000,
    riskLevel: "HIGH",
    reason:
      "Customer requested a refund for verification.",
  });

  assert(
    approval.status === "pending",
    "New approval starts in pending state",
  );

  // --------------------------------------------------------
  // Verify pending queue
  // --------------------------------------------------------

  const pending =
    findPendingApprovals();

  assert(
    pending.some(
      (item) => item.id === approval.id,
    ),
    "Pending approval appears in approval queue",
  );

  // --------------------------------------------------------
  // Approve as human
  // --------------------------------------------------------

  const approved =
    approveHumanRequest(
      approval.id,
      "human-reviewer",
    );

  assert(
    approved.success === true,
    "Human approval succeeds",
  );

  assert(
    approved.approval?.status ===
      "approved",
    "Approval transitions to approved",
  );

  assert(
    approved.approval?.decidedBy ===
      "human-reviewer",
    "Approval records the human decision maker",
  );

  assert(
    approved.approval?.decidedAt !== null,
    "Approval records decision time",
  );

  // --------------------------------------------------------
  // Verify double-decision protection
  // --------------------------------------------------------

  const secondDecision =
    approveHumanRequest(
      approval.id,
      "another-reviewer",
    );

  assert(
    secondDecision.success === false,
    "Already-decided approval cannot be approved again",
  );

  // --------------------------------------------------------
  // Create second pending approval for rejection test
  // --------------------------------------------------------

  const rejectionApproval =
    createApproval({
      taskId: task.id,
      action: "request_refund",
      amountCents: 2500,
      riskLevel: "HIGH",
      reason:
        "Second refund approval for rejection test.",
    });

  assert(
    rejectionApproval.status ===
      "pending",
    "Second approval starts in pending state",
  );

  // --------------------------------------------------------
  // Reject as human
  // --------------------------------------------------------

  const rejected =
    rejectHumanRequest(
      rejectionApproval.id,
      "human-reviewer",
    );

  assert(
    rejected.success === true,
    "Human rejection succeeds",
  );

  assert(
    rejected.approval?.status ===
      "rejected",
    "Approval transitions to rejected",
  );

  // --------------------------------------------------------
  // Verify rejected request cannot be approved
  // --------------------------------------------------------

  const approveRejected =
    approveHumanRequest(
      rejectionApproval.id,
      "another-reviewer",
    );

  assert(
    approveRejected.success === false,
    "Rejected approval cannot be approved afterward",
  );

  // --------------------------------------------------------
  // Verify persisted state
  // --------------------------------------------------------

  const persistedApproved =
    findApprovalById(
      approval.id,
    );

  assert(
    persistedApproved?.status ===
      "approved",
    "Approved state persists in database",
  );

  const persistedRejected =
    findApprovalById(
      rejectionApproval.id,
    );

  assert(
    persistedRejected?.status ===
      "rejected",
    "Rejected state persists in database",
  );

  // --------------------------------------------------------
  // Cleanup test records
  // --------------------------------------------------------

  db.prepare(`
    DELETE FROM approvals
    WHERE task_id = ?
  `).run(task.id);

  db.prepare(`
    DELETE FROM tasks
    WHERE id = ?
  `).run(task.id);

  console.log(
    "\nApproval verification completed successfully.",
  );
}

main();