 

import db from "@/lib/db/client";

export interface EmailRecord {
  id: string;
  customerId: string | null;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  receivedAt: string;
}

export function findEmailById(
  emailId: string,
): EmailRecord | null {
  const email = db
    .prepare(`
      SELECT
        id,
        customer_id AS customerId,
        sender,
        recipient,
        subject,
        body,
        status,
        received_at AS receivedAt
      FROM emails
      WHERE id = ?
      LIMIT 1
    `)
    .get(emailId) as EmailRecord | undefined;

  return email ?? null;
}