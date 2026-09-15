import {
  createBrowserSession,
  closeBrowserSession,
} from "@/lib/browser/browser";

import {
  findAppointmentInNorthstar,
  findEmailInNorthstar,
  type AppointmentObservation,
  type InboxObservation,
} from "@/lib/browser/actions";

type AppointmentInput = {
  action: "FIND_APPOINTMENT";
  appointmentId: string;
};

type EmailInput = {
  action: "FIND_EMAIL";
  emailId: string;
};

type BrowserInput =
  | AppointmentInput
  | EmailInput;

type AppointmentResult = {
  success: boolean;
  action: "FIND_APPOINTMENT";
  data: AppointmentObservation | null;
  error: string | null;
};

type EmailResult = {
  success: boolean;
  action: "FIND_EMAIL";
  data: InboxObservation | null;
  error: string | null;
};

// Overloads give TypeScript precise return types
// based on the action passed by the caller.
export function executeBrowserObservation(
  input: AppointmentInput,
): Promise<AppointmentResult>;

export function executeBrowserObservation(
  input: EmailInput,
): Promise<EmailResult>;

// Implementation
export async function executeBrowserObservation(
  input: BrowserInput,
): Promise<
  AppointmentResult | EmailResult
> {
  const session =
    await createBrowserSession();

  try {
    const page =
      await session.context.newPage();

    if (
      input.action ===
      "FIND_APPOINTMENT"
    ) {
      const result =
        await findAppointmentInNorthstar(
          page,
          session.baseUrl,
          input.appointmentId,
        );

      return {
        success: true,
        action: "FIND_APPOINTMENT",
        data: result,
        error: null,
      };
    }

    if (
      input.action ===
      "FIND_EMAIL"
    ) {
      const result =
        await findEmailInNorthstar(
          page,
          session.baseUrl,
          input.emailId,
        );

      return {
        success: true,
        action: "FIND_EMAIL",
        data: result,
        error: null,
      };
    }

    throw new Error(
      "Unsupported browser action.",
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Browser execution failed.";

    if (
      input.action ===
      "FIND_APPOINTMENT"
    ) {
      return {
        success: false,
        action: "FIND_APPOINTMENT",
        data: null,
        error: message,
      };
    }

    return {
      success: false,
      action: "FIND_EMAIL",
      data: null,
      error: message,
    };
  } finally {
    await closeBrowserSession(
      session,
    );
  }
}