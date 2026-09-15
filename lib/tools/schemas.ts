import { z } from "zod";
import { TOOL_NAMES } from "@/types/tools";

export const GetCustomerInputSchema = z
  .object({
    customerId: z.string().optional(),
    email: z.string().email().optional(),
    name: z.string().optional(),
  })
  .refine(
    (value) => Boolean(value.customerId || value.email || value.name),
    {
      message: "At least one customer identifier is required.",
    },
  );

export const GetAppointmentInputSchema = z.object({
  appointmentId: z.string().min(1),
});

export const GetInvoiceInputSchema = z.object({
  invoiceId: z.string().min(1),
});

export const CheckAvailabilityInputSchema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  durationMinutes: z.number().int().positive().max(480).default(60),
});

export const GetCompanyPolicyInputSchema = z.object({
  policyType: z.enum([
    "APPOINTMENT",
    "CANCELLATION",
    "REFUND",
    "BANK_ACCOUNT_CHANGE",
    "GENERAL",
  ]),
});

export const RescheduleAppointmentInputSchema = z.object({
  appointmentId: z.string().min(1),
  requestedDate: z.string().min(1),
  requestedTime: z.string().min(1),
});

export const CancelAppointmentInputSchema = z.object({
  appointmentId: z.string().min(1),
  reason: z.string().min(1),
});

export const RequestRefundInputSchema = z.object({
  invoiceId: z.string().min(1),
  amountCents: z.number().int().positive(),
  reason: z.string().min(1),
});

export const CreateInternalTaskInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export const SendEmailInputSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
});

export const RequestHumanApprovalInputSchema = z.object({
  action: z.string().min(1),
  reason: z.string().min(1),
  riskLevel: z.enum(["MEDIUM", "HIGH", "CRITICAL"]),
  referenceId: z.string().min(1),
});

export const ToolInputSchemas = {
  get_customer: GetCustomerInputSchema,
  get_appointment: GetAppointmentInputSchema,
  get_invoice: GetInvoiceInputSchema,
  check_availability: CheckAvailabilityInputSchema,
  get_company_policy: GetCompanyPolicyInputSchema,
  reschedule_appointment: RescheduleAppointmentInputSchema,
  cancel_appointment: CancelAppointmentInputSchema,
  request_refund: RequestRefundInputSchema,
  create_internal_task: CreateInternalTaskInputSchema,
  send_email: SendEmailInputSchema,
  request_human_approval: RequestHumanApprovalInputSchema,
} as const;

export const ToolCallSchema = z.object({
  toolName: z.enum(TOOL_NAMES),
  arguments: z.record(z.string(), z.unknown()),
});

export const ToolResultSchema = z.object({
  success: z.boolean(),
  toolName: z.string(),
  data: z.unknown().nullable(),
  error: z.string().nullable(),
});

export type ToolCall = z.infer<typeof ToolCallSchema>;
export type ToolResult = z.infer<typeof ToolResultSchema>;