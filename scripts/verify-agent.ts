import {
  createAgentState,
  MAX_AGENT_STEPS,
  addAgentStep,
} from "@/lib/agent/state";

let passed = 0;
let failed = 0;

function check(
  name: string,
  condition: boolean,
) {
  if (condition) {
    console.log(`✓ ${name}`);
    passed++;
  } else {
    console.error(`✗ ${name}`);
    failed++;
  }
}

// ------------------------------------------------------------
// State creation
// ------------------------------------------------------------

const state =
  createAgentState(
    "Reschedule Sarah's appointment.",
  );

check(
  "agent starts in PENDING state",
  state.status === "PENDING",
);

check(
  "agent starts with zero steps",
  state.steps.length === 0,
);

check(
  "agent starts with no plan",
  state.plan === null,
);

// ------------------------------------------------------------
// Step bound
// ------------------------------------------------------------

check(
  "maximum agent steps is 12",
  MAX_AGENT_STEPS === 12,
);

// ------------------------------------------------------------
// State transition
// ------------------------------------------------------------

const updatedState =
  addAgentStep(
    state,
    {
      stepNumber: 1,
      action: "IDENTIFY_CUSTOMER",
      observation:
        "Customer identification step recorded.",
    },
  );

check(
  "agent step is recorded",
  updatedState.steps.length === 1,
);

check(
  "current step is updated",
  updatedState.currentStep === 1,
);

// ------------------------------------------------------------

console.log("\n------------------------------");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log("------------------------------");

if (failed > 0) {
  process.exit(1);
}

console.log("Phase 8 state verification passed.");