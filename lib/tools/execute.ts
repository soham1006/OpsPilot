import {
  ToolCallSchema,
  ToolInputSchemas,
  type ToolResult,
} from "@/lib/tools/schemas";
import {
  getToolMetadata,
  isRegisteredTool,
} from "@/lib/tools/registry";
import {
  rescheduleAppointmentTool,
} from "@/lib/tools/implementations";

export function validateToolCall(input: unknown) {
  return ToolCallSchema.safeParse(input);
}

export function validateToolArguments(
  toolName: string,
  args: unknown,
) {
  if (!isRegisteredTool(toolName)) {
    return {
      success: false as const,
      error: `Tool "${toolName}" is not registered.`,
    };
  }

  const schema = ToolInputSchemas[toolName];
  const result = schema.safeParse(args);

  if (!result.success) {
    return {
      success: false as const,
      error: result.error.issues
        .map((issue) => issue.message)
        .join("; "),
    };
  }

  return {
    success: true as const,
    data: result.data,
  };
}

export function executeRegisteredTool(
  input: unknown,
): ToolResult {
  const parsedCall =
    validateToolCall(input);

  if (!parsedCall.success) {
    const possibleToolName =
      input &&
      typeof input === "object" &&
      "toolName" in input
        ? String(
            (input as {
              toolName?: unknown;
            }).toolName ?? "unknown",
          )
        : "unknown";

    return {
      success: false,
      toolName: possibleToolName,
      data: null,
      error:
        "Invalid or unregistered tool call.",
    };
  }

  const {
    toolName,
    arguments: args,
  } = parsedCall.data;

  const argumentResult =
    validateToolArguments(
      toolName,
      args,
    );

  if (!argumentResult.success) {
    return {
      success: false,
      toolName,
      data: null,
      error: argumentResult.error,
    };
  }

  // ----------------------------------------------------------
  // Executable tool: reschedule appointment
  // ----------------------------------------------------------

  if (
    toolName ===
    "reschedule_appointment"
  ) {
    const rescheduleArgs =
      ToolInputSchemas
        .reschedule_appointment
        .safeParse(args);

    if (!rescheduleArgs.success) {
      return {
        success: false,
        toolName,
        data: null,
        error:
          rescheduleArgs.error.issues
            .map(
              (issue) => issue.message,
            )
            .join("; "),
      };
    }

   const result =
  rescheduleAppointmentTool({
    appointmentId:
      rescheduleArgs.data.appointmentId,
    date:
      rescheduleArgs.data.requestedDate,
    time:
      rescheduleArgs.data.requestedTime,
  });

    return {
      success: result.success,
      toolName,
      data: result.success
        ? result.appointment
        : null,
      error: result.success
        ? result.error ?? null
        : result.error ?? "Appointment rescheduling failed.",
    };
  }

  // ----------------------------------------------------------
  // Other registered tools are not executable yet.
  // ----------------------------------------------------------

  const metadata =
    getToolMetadata(toolName);

  void metadata;

  return {
    success: false,
    toolName,
    data: null,
    error:
      `Tool "${toolName}" is registered and validated, ` +
      `but execution is not implemented yet.`,
  };
}