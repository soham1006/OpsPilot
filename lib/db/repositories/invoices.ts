 

import db from "@/lib/db/client";

export interface InvoiceRecord {
  id: string;
  customerId: string;
  appointmentId: string;
  amountCents: number;
  currency: string;
  status: string;
  paymentReference: string;
}

export function findInvoiceById(
  invoiceId: string,
): InvoiceRecord | null {
  const invoice = db
    .prepare(`
      SELECT
        id,
        customer_id AS customerId,
        appointment_id AS appointmentId,
        amount_cents AS amountCents,
        currency,
        status,
        payment_reference AS paymentReference
      FROM invoices
      WHERE id = ?
      LIMIT 1
    `)
    .get(invoiceId) as InvoiceRecord | undefined;

  return invoice ?? null;
}

export function findInvoicesByCustomerId(
  customerId: string,
): InvoiceRecord[] {
  return db
    .prepare(`
      SELECT
        id,
        customer_id AS customerId,
        appointment_id AS appointmentId,
        amount_cents AS amountCents,
        currency,
        status,
        payment_reference AS paymentReference
      FROM invoices
      WHERE customer_id = ?
      ORDER BY created_at DESC
    `)
    .all(customerId) as InvoiceRecord[];
}

export function requestRefund(
  invoiceId: string,
  amountCents: number,
): InvoiceRecord | null {
  const invoice = findInvoiceById(invoiceId);

  if (!invoice) {
    return null;
  }

  if (amountCents <= 0) {
    return null;
  }

  if (amountCents > invoice.amountCents) {
    return null;
  }

  const updatedInvoice = db
    .prepare(`
      UPDATE invoices
      SET status = 'refund_requested'
      WHERE id = ?
      RETURNING
        id,
        customer_id AS customerId,
        appointment_id AS appointmentId,
        amount_cents AS amountCents,
        currency,
        status,
        payment_reference AS paymentReference
    `)
    .get(invoiceId) as InvoiceRecord | undefined;

  return updatedInvoice ?? null;
}