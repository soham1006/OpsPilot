import {
  executeRegisteredTool,
  validateToolArguments,
} from "@/lib/tools/execute";
import {
  getToolMetadata,
  isRegisteredTool,
} from "@/lib/tools/registry";

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean) {
  if (condition) {
    console.log(`✓ ${name}`);
    passed++;
  } else {
    console.error(`✗ ${name}`);
    failed++;
  }
}

// 1. Registered tools
check(
  "get_customer is registered",
  isRegisteredTool("get_customer"),
);

check(
  "request_refund is registered",
  isRegisteredTool("request_refund"),
);

// 2. Unknown tools rejected
check(
  "execute_sql is not registered",
  !isRegisteredTool("execute_sql"),
);

check(
  "run_shell is not registered",
  !isRegisteredTool("run_shell"),
);

check(
  "arbitrary tool is not registered",
  !isRegisteredTool("delete_database"),
);

// 3. Risk metadata
const refundMetadata = getToolMetadata("request_refund");

check(
  "refund tool is HIGH risk",
  refundMetadata?.riskLevel === "HIGH",
);

// 4. Valid arguments
const validAppointment = validateToolArguments(
  "get_appointment",
  {
    appointmentId: "APT-001",
  },
);

check(
  "valid appointment arguments accepted",
  validAppointment.success,
);

// 5. Invalid arguments
const invalidAppointment = validateToolArguments(
  "get_appointment",
  {},
);

check(
  "invalid appointment arguments rejected",
  !invalidAppointment.success,
);

// 6. Unknown tool execution blocked
const unknownExecution = executeRegisteredTool({
  toolName: "execute_sql",
  arguments: {
    query: "DROP TABLE customers",
  },
});

check(
  "unknown tool execution blocked",
  !unknownExecution.success,
);

// 7. Valid tool is not executed prematurely
const validExecution = executeRegisteredTool({
  toolName: "get_appointment",
  arguments: {
    appointmentId: "APT-001",
  },
});

check(
  "registered tool execution remains disabled in Phase 5",
  !validExecution.success &&
    validExecution.error?.includes(
      "execution is intentionally disabled in Phase 5",
    ) === true,
);

console.log("\n------------------------------");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log("------------------------------");

if (failed > 0) {
  process.exit(1);
}

console.log("Phase 5 tool verification passed.");