export const REQUEST_INTENTS = [
  "APPOINTMENT_RESCHEDULE",
  "APPOINTMENT_CANCEL",
  "REFUND_REQUEST",
  "BANK_ACCOUNT_CHANGE",
  "GENERAL_QUERY",
  "UNKNOWN",
] as const;

export type RequestIntent = (typeof REQUEST_INTENTS)[number];

export const PLANNING_ACTIONS = [
  "IDENTIFY_CUSTOMER",
  "FIND_APPOINTMENT",
  "FIND_INVOICE",
  "CHECK_APPOINTMENT_AVAILABILITY",
  "READ_RELEVANT_POLICY",
  "REVIEW_BILLING_CONTEXT",
  "PREPARE_CUSTOMER_RESPONSE",
  "ESCALATE_FOR_CLARIFICATION",
] as const;

export type PlanningAction = (typeof PLANNING_ACTIONS)[number];

export interface ExtractedEntities {
  customerName: string | null;
  customerEmail: string | null;
  appointmentReference: string | null;
  invoiceReference: string | null;
  requestedDate: string | null;
  requestedTime: string | null;
  refundAmountCents: number | null;
}

export interface AgentPlan {
  intent: RequestIntent;
  summary: string;
  confidence: number;
  entities: ExtractedEntities;
  requestedAction: string;
  missingInformation: string[];
  proposedSteps: Array<{
    action: PlanningAction;
    purpose: string;
  }>;
  riskSignals: string[];
}