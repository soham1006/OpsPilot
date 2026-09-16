import {
  findCustomerByEmail,
  findCustomerById,
  findCustomerByName,
} from "@/lib/db/repositories/customers";

import {
  findAppointmentById,
  findAppointmentsByCustomerId,
  findAppointmentAtTime,
  rescheduleAppointment,
  cancelAppointment,
} from "@/lib/db/repositories/appointments";

import {
  findInvoiceById,
  findInvoicesByCustomerId,
  requestRefund,
} from "@/lib/db/repositories/invoices";

import {
  findActivePolicyByCategory,
} from "@/lib/db/repositories/policies";

import {
  findEmailById,
} from "@/lib/db/repositories/emails";

import {
  createApprovalRequest,
} from "@/lib/agent/approval";

export function getCustomer(
  input: {
    customerId?: string;
    email?: string;
    name?: string;
  },
) {
  if (input.customerId) {
    return findCustomerById(
      input.customerId,
    );
  }

  if (input.email) {
    return findCustomerByEmail(
      input.email,
    );
  }

  if (input.name) {
    return findCustomerByName(
      input.name,
    );
  }

  return null;
}

export function getAppointment(
  input: {
    appointmentId: string;
  },
) {
  return findAppointmentById(
    input.appointmentId,
  );
}

export function getInvoice(
  input: {
    invoiceId: string;
  },
) {
  return findInvoiceById(
    input.invoiceId,
  );
}

export function getCustomerAppointments(
  customerId: string,
) {
  return findAppointmentsByCustomerId(
    customerId,
  );
}

export function getCustomerInvoices(
  customerId: string,
) {
  return findInvoicesByCustomerId(
    customerId,
  );
}

export function checkAvailability(
  input: {
    date: string;
    time: string;
    durationMinutes: number;
  },
) {
  const existingAppointment =
    findAppointmentAtTime(
      input.date,
      input.time,
    );

  return {
    available:
      existingAppointment === null,
    requestedDate: input.date,
    requestedTime: input.time,
    durationMinutes:
      input.durationMinutes,
    conflictingAppointment:
      existingAppointment,
  };
}

export function getCompanyPolicy(
  policyType:
    | "APPOINTMENT"
    | "CANCELLATION"
    | "REFUND"
    | "BANK_ACCOUNT_CHANGE"
    | "GENERAL",
) {
  const categoryMap = {
    APPOINTMENT: "appointments",
    CANCELLATION: "appointments",
    REFUND: "billing",
    BANK_ACCOUNT_CHANGE:
      "financial_security",
    GENERAL: "privacy",
  } as const;

  return findActivePolicyByCategory(
    categoryMap[policyType],
  );
}

export function rescheduleAppointmentTool(
  input: {
    appointmentId: string;
    date: string;
    time: string;
  },
) {
  const appointment =
    rescheduleAppointment(
      input.appointmentId,
      input.date,
      input.time,
    );

  if (!appointment) {
    return {
      success: false,
      appointment: null,
      error:
        "Appointment could not be rescheduled. " +
        "The appointment may not exist, " +
        "the requested time may be invalid, " +
        "or the requested slot may already be occupied.",
    };
  }

  return {
    success: true,
    appointment,
    error: null,
  };
}

export function cancelAppointmentTool(input: {
  appointmentId: string;
  reason: string;
}) {
  const appointment = cancelAppointment(
    input.appointmentId,
  );

  if (!appointment) {
    return {
      success: false,
      appointment: null,
      error:
        "Appointment could not be cancelled because it was not found.",
    };
  }

  return {
    success: true,
    appointment,
    reason: input.reason,
    error: null,
  };
}

export function requestRefundTool(input: {
  invoiceId: string;
  amountCents: number;
  reason: string;
}) {
  const invoice = findInvoiceById(
    input.invoiceId,
  );

  if (!invoice) {
    return {
      success: false,
      invoice: null,
      error:
        "Refund could not be requested because the invoice was not found.",
    };
  }

  if (input.amountCents <= 0) {
    return {
      success: false,
      invoice: null,
      error:
        "Refund amount must be greater than zero.",
    };
  }

  if (input.amountCents > invoice.amountCents) {
    return {
      success: false,
      invoice: null,
      error:
        "Refund amount cannot exceed the invoice amount.",
    };
  }

  const updatedInvoice = requestRefund(
    input.invoiceId,
    input.amountCents,
  );

  if (!updatedInvoice) {
    return {
      success: false,
      invoice: null,
      error:
        "Refund request could not be recorded.",
    };
  }

  return {
    success: true,
    invoice: updatedInvoice,
    amountCents: input.amountCents,
    reason: input.reason,
    error: null,
  };
}

export function requestHumanApprovalTool(
  input: {
    action: string;
    reason: string;
    riskLevel:
      | "MEDIUM"
      | "HIGH"
      | "CRITICAL";
    referenceId: string;
  },
) {
  try {
    const result =
      createApprovalRequest({
        action: input.action,
        reason: input.reason,
        riskLevel: input.riskLevel,
        referenceId: input.referenceId,
      });

    return {
      success: true,
      approval: result.approval,
      taskId: result.taskId,
      error: null,
    };
  } catch {
    return {
      success: false,
      approval: null,
      taskId: null,
      error:
        "Human approval request could not be created.",
    };
  }
}

export function getEmail(
  emailId: string,
) {
  return findEmailById(emailId);
}