import {
  approveApproval,
  rejectApproval,
  findApprovalById,
  type ApprovalRecord,
} from "@/lib/db/repositories/approvals";

export interface ApprovalDecisionResult {
  success: boolean;
  approval: ApprovalRecord | null;
  error: string | null;
}

export function approveHumanRequest(
  approvalId: string,
  decidedBy: string,
): ApprovalDecisionResult {
  const approval =
    findApprovalById(approvalId);

  if (!approval) {
    return {
      success: false,
      approval: null,
      error: "Approval request was not found.",
    };
  }

  if (approval.status !== "pending") {
    return {
      success: false,
      approval: null,
      error:
        "Approval request has already been decided.",
    };
  }

  const updatedApproval =
    approveApproval(
      approvalId,
      decidedBy,
    );

  if (!updatedApproval) {
    return {
      success: false,
      approval: null,
      error:
        "Approval request could not be approved.",
    };
  }

  return {
    success: true,
    approval: updatedApproval,
    error: null,
  };
}

export function rejectHumanRequest(
  approvalId: string,
  decidedBy: string,
): ApprovalDecisionResult {
  const approval =
    findApprovalById(approvalId);

  if (!approval) {
    return {
      success: false,
      approval: null,
      error: "Approval request was not found.",
    };
  }

  if (approval.status !== "pending") {
    return {
      success: false,
      approval: null,
      error:
        "Approval request has already been decided.",
    };
  }

  const updatedApproval =
    rejectApproval(
      approvalId,
      decidedBy,
    );

  if (!updatedApproval) {
    return {
      success: false,
      approval: null,
      error:
        "Approval request could not be rejected.",
    };
  }

  return {
    success: true,
    approval: updatedApproval,
    error: null,
  };
}