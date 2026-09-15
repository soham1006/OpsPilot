import type { AgentPlan } from "@/types/agent";
import type {
  AgentState,
  AgentStatus,
  AgentStep,
} from "@/lib/agent/types";

export const MAX_AGENT_STEPS = 12;

export function createAgentState(
  mission: string,
): AgentState {
  return {
    mission,
    plan: null,
    status: "PENDING",
    currentStep: 0,
    steps: [],
    finalMessage: null,
  };
}

export function setAgentStatus(
  state: AgentState,
  status: AgentStatus,
): AgentState {
  return {
    ...state,
    status,
  };
}

export function attachPlan(
  state: AgentState,
  plan: AgentPlan,
): AgentState {
  return {
    ...state,
    plan,
  };
}

export function addAgentStep(
  state: AgentState,
  step: AgentStep,
): AgentState {
  return {
    ...state,
    currentStep: step.stepNumber,
    steps: [...state.steps, step],
  };
}