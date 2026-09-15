import type {
  AgentPlan,
} from "@/types/agent";

import type {
  ToolResult,
} from "@/lib/tools/schemas";

import type {
  PolicyEvaluation,
} from "@/lib/policies/types";

export const AGENT_STATUSES = [
  "PENDING",
  "RUNNING",
  "WAITING_FOR_APPROVAL",
  "COMPLETED",
  "BLOCKED",
  "FAILED",
  "MAX_STEPS_REACHED",
] as const;

export type AgentStatus =
  (typeof AGENT_STATUSES)[number];

export interface AgentStep {
  stepNumber: number;
  action: string;
  toolName?: string;
  arguments?: Record<string, unknown>;
  policy?: PolicyEvaluation;
  result?: ToolResult;
  observation?: string;
}

export interface AgentState {
  mission: string;
  plan: AgentPlan | null;
  status: AgentStatus;
  currentStep: number;
  steps: AgentStep[];
  finalMessage: string | null;
}