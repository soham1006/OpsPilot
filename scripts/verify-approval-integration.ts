import { createApprovalRequest } from "@/lib/agent/approval";
import {
  findApprovalById,
} from "@/lib/db/repositories/approvals";

const result = createApprovalRequest({
  action: "request_refund",
  reason: "Refund requires human approval before execution.",
  riskLevel: "HIGH",
  referenceId: "I3001",
  amountCents: 5000,
});

const approval = findApprovalById(result.approval.id);

if (!approval) {
  throw new Error("Approval request was not persisted.");
}

if (approval.action !== "request_refund") {
  throw new Error(
    `Expected request_refund, got ${approval.action}`,
  );
}

if (approval.amountCents !== 5000) {
  throw new Error(
    `Expected 5000 cents, got ${approval.amountCents}`,
  );
}

if (approval.riskLevel !== "HIGH") {
  throw new Error(
    `Expected HIGH risk, got ${approval.riskLevel}`,
  );
}

console.log("Approval integration verification passed.");
console.log(`Approval: ${approval.id}`);
console.log(`Task: ${result.taskId}`);
console.log(`Status: ${approval.status}`);
console.log(`Action: ${approval.action}`);
console.log(`Risk: ${approval.riskLevel}`);