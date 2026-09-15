import { chromium, type Browser, type BrowserContext } from "playwright";

const DEFAULT_BASE_URL =
  process.env.OPSPILOT_BASE_URL ?? "http://localhost:3000";

const ALLOWED_HOSTNAME =
  new URL(DEFAULT_BASE_URL).hostname;

export interface BrowserSession {
  browser: Browser;
  context: BrowserContext;
  baseUrl: string;
}

export async function createBrowserSession(): Promise<BrowserSession> {
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: {
      width: 1440,
      height: 900,
    },
  });

  return {
    browser,
    context,
    baseUrl: DEFAULT_BASE_URL,
  };
}

export function isAllowedNorthstarUrl(
  targetUrl: string,
): boolean {
  try {
    const url = new URL(
      targetUrl,
      DEFAULT_BASE_URL,
    );

    const allowedPaths = [
      "/inbox",
      "/customers",
      "/appointments",
      "/billing",
      "/policies",
      "/tasks",
    ];

    return (
      url.hostname === ALLOWED_HOSTNAME &&
      allowedPaths.some(
        (path) =>
          url.pathname === path ||
          url.pathname.startsWith(`${path}/`),
      )
    );
  } catch {
    return false;
  }
}

export async function closeBrowserSession(
  session: BrowserSession,
): Promise<void> {
  await session.context.close();
  await session.browser.close();
}