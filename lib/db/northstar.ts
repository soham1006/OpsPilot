import db from "./client";

export type NorthstarEmail = {
  id: string;
  customer_id: string | null;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  received_at: string;
};

export type NorthstarCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: string;
  created_at: string;
};

export type NorthstarAppointment = {
  id: string;
  customer_id: string;
  customer_name: string;
  service: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  technician: string | null;
  location: string | null;
};

export type NorthstarInvoice = {
  id: string;
  customer_id: string;
  customer_name: string;
  appointment_id: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  payment_reference: string | null;
  created_at: string;
};

export type NorthstarPolicy = {
  id: string;
  name: string;
  category: string;
  description: string;
  rules_json: string;
  active: number;
  updated_at: string;
};

export type NorthstarTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  source_email_id: string | null;
  created_at: string;
};

export function getEmails(): NorthstarEmail[] {
  return db
    .prepare(
      `
      SELECT
        id,
        customer_id,
        sender,
        recipient,
        subject,
        body,
        status,
        received_at
      FROM emails
      ORDER BY received_at DESC
    `,
    )
    .all() as NorthstarEmail[];
}

export function getCustomers(): NorthstarCustomer[] {
  return db
    .prepare(
      `
      SELECT
        id,
        name,
        email,
        phone,
        address,
        status,
        created_at
      FROM customers
      ORDER BY name ASC
    `,
    )
    .all() as NorthstarCustomer[];
}

export function getAppointments(): NorthstarAppointment[] {
  return db
    .prepare(
      `
      SELECT
        a.id,
        a.customer_id,
        c.name AS customer_name,
        a.service,
        a.scheduled_start,
        a.scheduled_end,
        a.status,
        a.technician,
        a.location
      FROM appointments a
      JOIN customers c ON c.id = a.customer_id
      ORDER BY a.scheduled_start ASC
    `,
    )
    .all() as NorthstarAppointment[];
}

export function getInvoices(): NorthstarInvoice[] {
  return db
    .prepare(
      `
      SELECT
        i.id,
        i.customer_id,
        c.name AS customer_name,
        i.appointment_id,
        i.amount_cents,
        i.currency,
        i.status,
        i.payment_reference,
        i.created_at
      FROM invoices i
      JOIN customers c ON c.id = i.customer_id
      ORDER BY i.created_at DESC
    `,
    )
    .all() as NorthstarInvoice[];
}

export function getPolicies(): NorthstarPolicy[] {
  return db
    .prepare(
      `
      SELECT
        id,
        name,
        category,
        description,
        rules_json,
        active,
        updated_at
      FROM policies
      ORDER BY category ASC
    `,
    )
    .all() as NorthstarPolicy[];
}

export function getTasks(): NorthstarTask[] {
  return db
    .prepare(
      `
      SELECT
        id,
        title,
        description,
        status,
        priority,
        assigned_to,
        source_email_id,
        created_at
      FROM tasks
      ORDER BY created_at DESC
    `,
    )
    .all() as NorthstarTask[];
}