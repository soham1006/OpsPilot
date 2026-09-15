 

import db from "@/lib/db/client";

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: string;
}

export function findCustomerById(
  customerId: string,
): CustomerRecord | null {
  const customer = db
    .prepare(`
      SELECT
        id,
        name,
        email,
        phone,
        address,
        status
      FROM customers
      WHERE id = ?
      LIMIT 1
    `)
    .get(customerId) as CustomerRecord | undefined;

  return customer ?? null;
}

export function findCustomerByEmail(
  email: string,
): CustomerRecord | null {
  const customer = db
    .prepare(`
      SELECT
        id,
        name,
        email,
        phone,
        address,
        status
      FROM customers
      WHERE LOWER(email) = LOWER(?)
      LIMIT 1
    `)
    .get(email) as CustomerRecord | undefined;

  return customer ?? null;
}

export function findCustomerByName(
  name: string,
): CustomerRecord | null {
  const customer = db
    .prepare(`
      SELECT
        id,
        name,
        email,
        phone,
        address,
        status
      FROM customers
      WHERE LOWER(name) = LOWER(?)
      LIMIT 1
    `)
    .get(name) as CustomerRecord | undefined;

  return customer ?? null;
}