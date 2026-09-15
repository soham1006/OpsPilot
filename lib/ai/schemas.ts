import { z } from "zod";

export const RequestIntentSchema = z.enum([
  "APPOINTMENT_RESCHEDULE",
  "APPOINTMENT_CANCEL",
  "REFUND_REQUEST",
  "BANK_ACCOUNT_CHANGE",
  "GENERAL_QUERY",
  "UNKNOWN",
]);

export const PlanningActionSchema = z.enum([
  "IDENTIFY_CUSTOMER",
  "FIND_APPOINTMENT",
  "CHECK_APPOINTMENT_AVAILABILITY",
  "READ_RELEVANT_POLICY",
  "REVIEW_BILLING_CONTEXT",
  "PREPARE_CUSTOMER_RESPONSE",
  "ESCALATE_FOR_CLARIFICATION",
]);

export const ExtractedEntitiesSchema = z.object({
  customerName: z.string().nullable(),
  customerEmail: z.string().nullable(),
  appointmentReference: z.string().nullable(),
  requestedDate: z.string().nullable(),
  requestedTime: z.string().nullable(),
  refundAmountCents: z.number().int().nonnegative().nullable(),
});

export const AgentPlanSchema = z.object({
  intent: RequestIntentSchema,

  summary: z
    .string()
    .min(1)
    .max(500),

  confidence: z
    .number()
    .min(0)
    .max(1),

  entities: ExtractedEntitiesSchema,

  requestedAction: z
    .string()
    .min(1)
    .max(300),

  missingInformation: z
    .array(z.string().min(1))
    .max(10),

  proposedSteps: z
    .array(
      z.object({
        action: PlanningActionSchema,
        purpose: z.string().min(1).max(300),
      }),
    )
    .min(1)
    .max(8),

  riskSignals: z
    .array(z.string().min(1).max(300))
    .max(10),
});

export type AgentPlan = z.infer<typeof AgentPlanSchema>;

export const AnalyzeEmailRequestSchema = z.object({
  sender: z.string().min(1).max(320),
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(20_000),
});