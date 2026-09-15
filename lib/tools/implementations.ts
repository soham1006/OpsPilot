 

import {
  findCustomerByEmail,
  findCustomerById,
  findCustomerByName,
} from "@/lib/db/repositories/customers";

import {
  findAppointmentById,
  findAppointmentsByCustomerId,
  findAppointmentAtTime,
} from "@/lib/db/repositories/appointments";

import {
  findInvoiceById,
  findInvoicesByCustomerId,
} from "@/lib/db/repositories/invoices";

import {
  findActivePolicyByCategory,
} from "@/lib/db/repositories/policies";

import {
  findEmailById,
} from "@/lib/db/repositories/emails";

export function getCustomer(
  input: {
    customerId?: string;
    email?: string;
    name?: string;
  },
) {
  if (input.customerId) {
    return findCustomerById(input.customerId);
  }

  if (input.email) {
    return findCustomerByEmail(input.email);
  }

  if (input.name) {
    return findCustomerByName(input.name);
  }

  return null;
}

export function getAppointment(
  input: {
    appointmentId: string;
  },
) {
  return findAppointmentById(input.appointmentId);
}

export function getInvoice(
  input: {
    invoiceId: string;
  },
) {
  return findInvoiceById(input.invoiceId);
}

export function getCustomerAppointments(
  customerId: string,
) {
  return findAppointmentsByCustomerId(customerId);
}

export function getCustomerInvoices(
  customerId: string,
) {
  return findInvoicesByCustomerId(customerId);
}

export function checkAvailability(
  input: {
    date: string;
    time: string;
    durationMinutes: number;
  },
) {
  const existingAppointment = findAppointmentAtTime(
    input.date,
    input.time,
  );

  return {
    available: existingAppointment === null,
    requestedDate: input.date,
    requestedTime: input.time,
    durationMinutes: input.durationMinutes,
    conflictingAppointment: existingAppointment,
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
    BANK_ACCOUNT_CHANGE: "financial_security",
    GENERAL: "privacy",
  } as const;

  return findActivePolicyByCategory(
    categoryMap[policyType],
  );
}

export function getEmail(emailId: string) {
  return findEmailById(emailId);
}