import {
  findInvoiceById,
} from "@/lib/db/repositories/invoices";

export interface RefundVerification {
  verified: boolean;
  invoiceId: string;
  expectedStatus: string;
  actualStatus: string | null;
  reason: string;
}

export function verifyRefundRequest(
  invoiceId: string,
): RefundVerification {
  const invoice =
    findInvoiceById(invoiceId);

  if (!invoice) {
    return {
      verified: false,
      invoiceId,
      expectedStatus:
        "refund_requested",
      actualStatus: null,
      reason:
        "Invoice could not be found after refund execution.",
    };
  }

  const verified =
    invoice.status ===
    "refund_requested";

  return {
    verified,
    invoiceId,
    expectedStatus:
      "refund_requested",
    actualStatus:
      invoice.status,
    reason: verified
      ? "Refund request verified successfully."
      : "Invoice status does not show refund_requested.",
  };
}