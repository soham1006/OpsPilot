import {
  findApprovalById,
} from "@/lib/db/repositories/approvals";

import {
  requestRefund,
  findInvoiceById,
} from "@/lib/db/repositories/invoices";

export interface ApprovedRefundResult {
  success: boolean;
  invoice: ReturnType<typeof findInvoiceById>;
  error: string | null;
}

export function executeApprovedRefund(
  approvalId: string,
): ApprovedRefundResult {
  const approval =
    findApprovalById(approvalId);

  if (!approval) {
    return {
      success: false,
      invoice: null,
      error:
        "Approval request was not found.",
    };
  }

  if (approval.status !== "approved") {
    return {
      success: false,
      invoice: null,
      error:
        "Refund cannot execute because the approval is not approved.",
    };
  }

  if (
    approval.action !== "request_refund"
  ) {
    return {
      success: false,
      invoice: null,
      error:
        "Approval action is not a refund request.",
    };
  }

  if (!approval.amountCents) {
    return {
      success: false,
      invoice: null,
      error:
        "Approved refund is missing an amount.",
    };
  }

  const referenceMatch =
    approval.reason.match(
      /Reference:\s*([A-Za-z0-9_-]+)/,
    );

  if (!referenceMatch) {
    return {
      success: false,
      invoice: null,
      error:
        "Approved refund is missing its invoice reference.",
    };
  }

  const invoiceId =
    referenceMatch[1];

  const invoice =
    findInvoiceById(invoiceId);

  if (!invoice) {
    return {
      success: false,
      invoice: null,
      error:
        "The invoice associated with the approved refund was not found.",
    };
  }

  if (
    approval.amountCents >
    invoice.amountCents
  ) {
    return {
      success: false,
      invoice: null,
      error:
        "Approved refund amount exceeds the invoice amount.",
    };
  }

  const updatedInvoice =
    requestRefund(
      invoiceId,
      approval.amountCents,
    );

  if (!updatedInvoice) {
    return {
      success: false,
      invoice: null,
      error:
        "Approved refund could not be executed.",
    };
  }

  return {
    success: true,
    invoice: updatedInvoice,
    error: null,
  };
}