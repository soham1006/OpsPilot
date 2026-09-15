PRAGMA foreign_keys = ON;

CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL
);

CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  service TEXT NOT NULL,
  scheduled_start TEXT NOT NULL,
  scheduled_end TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  technician TEXT,
  location TEXT,
  created_at TEXT NOT NULL,

  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  appointment_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL,
  payment_reference TEXT,
  created_at TEXT NOT NULL,

  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

CREATE TABLE emails (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unresolved',
  received_at TEXT NOT NULL,

  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE policies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  rules_json TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_to TEXT,
  source_email_id TEXT,
  created_at TEXT NOT NULL,

  FOREIGN KEY (source_email_id) REFERENCES emails(id)
);

CREATE TABLE agent_runs (
  id TEXT PRIMARY KEY,
  mission TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE execution_steps (
  id TEXT PRIMARY KEY,
  agent_run_id TEXT NOT NULL,
  task_id TEXT,
  step_number INTEGER NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  observation TEXT,
  created_at TEXT NOT NULL,

  FOREIGN KEY (agent_run_id) REFERENCES agent_runs(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE TABLE approvals (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  action TEXT NOT NULL,
  amount_cents INTEGER,
  risk_level TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TEXT NOT NULL,
  decided_at TEXT,
  decided_by TEXT,

  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  task_id TEXT,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  risk_level TEXT,
  policy_decision TEXT,
  approval_status TEXT,
  result TEXT,
  verification_status TEXT,

  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE INDEX idx_emails_status
  ON emails(status);

CREATE INDEX idx_appointments_customer
  ON appointments(customer_id);

CREATE INDEX idx_tasks_status
  ON tasks(status);

CREATE INDEX idx_audit_task
  ON audit_logs(task_id);