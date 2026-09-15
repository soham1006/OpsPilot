import type { Page } from "playwright";

import {
  isAllowedNorthstarUrl,
} from "@/lib/browser/browser";

export async function openNorthstarPage(
  page: Page,
  baseUrl: string,
  route: string,
): Promise<void> {
  const targetUrl = new URL(
    route,
    baseUrl,
  ).toString();

  if (!isAllowedNorthstarUrl(targetUrl)) {
    throw new Error(
      `Blocked browser navigation to unauthorized URL: ${targetUrl}`,
    );
  }

  await page.goto(targetUrl, {
    waitUntil: "domcontentloaded",
  });
}

export async function openInbox(
  page: Page,
  baseUrl: string,
): Promise<void> {
  await openNorthstarPage(
    page,
    baseUrl,
    "/inbox",
  );
}

export async function openAppointments(
  page: Page,
  baseUrl: string,
): Promise<void> {
  await openNorthstarPage(
    page,
    baseUrl,
    "/appointments",
  );
}

export async function openCustomers(
  page: Page,
  baseUrl: string,
): Promise<void> {
  await openNorthstarPage(
    page,
    baseUrl,
    "/customers",
  );
}

export async function openBilling(
  page: Page,
  baseUrl: string,
): Promise<void> {
  await openNorthstarPage(
    page,
    baseUrl,
    "/billing",
  );
}

export async function openPolicies(
  page: Page,
  baseUrl: string,
): Promise<void> {
  await openNorthstarPage(
    page,
    baseUrl,
    "/policies",
  );
}

export async function openTasks(
  page: Page,
  baseUrl: string,
): Promise<void> {
  await openNorthstarPage(
    page,
    baseUrl,
    "/tasks",
  );
}