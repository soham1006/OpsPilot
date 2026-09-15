import type { Page } from "playwright";

import {
  openAppointments,
  openInbox,
} from "@/lib/browser/northstar";

export interface AppointmentObservation {
  appointmentId: string;
  customerId: string;
  customerName: string;
  service: string;
  scheduledStart: string;
  technician: string;
  status: string;
}

export async function findAppointmentInNorthstar(
  page: Page,
  baseUrl: string,
  appointmentId: string,
): Promise<AppointmentObservation | null> {
  await openAppointments(
    page,
    baseUrl,
  );

  const row = page.locator(
    `[data-appointment-id="${appointmentId}"]`,
  );

  if ((await row.count()) === 0) {
    return null;
  }

  return {
    appointmentId,
    customerId:
      (
        await row
          .locator("td")
          .nth(1)
          .locator("div")
          .nth(1)
          .textContent()
      )?.trim() ?? "",

    customerName:
      (
        await row
          .locator("td")
          .nth(1)
          .locator("div")
          .nth(0)
          .textContent()
      )?.trim() ?? "",

    service:
      (
        await row
          .locator("td")
          .nth(2)
          .textContent()
      )?.trim() ?? "",

    scheduledStart:
      (
        await row
          .locator("td")
          .nth(3)
          .textContent()
      )?.trim() ?? "",

    technician:
      (
        await row
          .locator("td")
          .nth(4)
          .textContent()
      )?.trim() ?? "",

    status:
      (
        await row
          .locator("td")
          .nth(5)
          .textContent()
      )?.trim() ?? "",
  };
}

export interface InboxObservation {
  emailId: string;
  subject: string;
  sender: string;
  bodyPreview: string;
  status: string;
}

export async function findEmailInNorthstar(
  page: Page,
  baseUrl: string,
  emailId: string,
): Promise<InboxObservation | null> {
  await openInbox(
    page,
    baseUrl,
  );

  const link = page.locator(
    `a[href="/inbox?email=${emailId}"]`,
  );

  if ((await link.count()) === 0) {
    return null;
  }

  const subject =
    (
      await link
        .locator("span.font-medium")
        .first()
        .textContent()
    )?.trim() ?? "";

  const bodyPreview =
    (
      await link
        .locator("p")
        .nth(0)
        .textContent()
    )?.trim() ?? "";

  const senderText =
    (
      await link
        .locator("p")
        .nth(1)
        .textContent()
    )?.trim() ?? "";

  const status =
  (
    await link
      .locator("span")
      .filter({
        hasText:
          /^(unresolved|resolved|pending|closed)$/i,
      })
      .textContent()
  )?.trim() ?? "";

  return {
    emailId,
    subject,
    sender: senderText.replace(
      /^From\s+/,
      "",
    ),
    bodyPreview,
    status,
  };
}