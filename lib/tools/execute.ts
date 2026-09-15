import {
  ToolCallSchema,
  ToolInputSchemas,
  type ToolResult,
} from "@/lib/tools/schemas";
import {
  getToolMetadata,
  isRegisteredTool,
} from "@/lib/tools/registry";

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
  const parsedCall = validateToolCall(input);

  if (!parsedCall.success) {
    const possibleToolName =
      input &&
      typeof input === "object" &&
      "toolName" in input
        ? String(
            (input as { toolName?: unknown }).toolName ??
              "unknown",
          )
        : "unknown";

    return {
      success: false,
      toolName: possibleToolName,
      data: null,
      error: "Invalid or unregistered tool call.",
    };
  }

  const { toolName, arguments: args } = parsedCall.data;

  const argumentResult = validateToolArguments(
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

  const metadata = getToolMetadata(toolName);

  return {
    success: false,
    toolName,
    data: null,
    error:
      `Tool "${toolName}" is registered and validated, ` +
      `but execution is intentionally disabled in Phase 5.`,
  };
}