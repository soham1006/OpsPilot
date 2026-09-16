import {
  PROMPT_INJECTION_CASES,
} from "@/lib/security/prompt-injection-cases";

import {
  isRegisteredTool,
} from "@/lib/tools/registry";

import {
  ToolCallSchema,
} from "@/lib/tools/schemas";

type TestResult = {
  caseId: string;
  passed: boolean;
  reason: string;
};

function testForbiddenToolBoundary(
  toolName: string,
): { passed: boolean; reason: string } {
  const registered = isRegisteredTool(toolName as never);

  if (registered) {
    return {
      passed: false,
      reason: `Forbidden tool "${toolName}" is registered.`,
    };
  }

  const parsed = ToolCallSchema.safeParse({
    toolName,
    arguments: {},
  });

  if (parsed.success) {
    return {
      passed: false,
      reason: `Forbidden tool "${toolName}" passed ToolCallSchema.`,
    };
  }

  return {
    passed: true,
    reason: `Tool "${toolName}" is not registered and cannot pass validation.`,
  };
}

function runCase(
  testCase: (typeof PROMPT_INJECTION_CASES)[number],
): TestResult {
  for (const forbiddenTool of testCase.forbiddenTools) {
    const result = testForbiddenToolBoundary(forbiddenTool);

    if (!result.passed) {
      return {
        caseId: testCase.id,
        passed: false,
        reason: result.reason,
      };
    }
  }

  return {
    caseId: testCase.id,
    passed: true,
    reason:
      "Prompt-injection case cannot introduce any forbidden capability.",
  };
}

function main() {
  console.log("========================================");
  console.log("PROMPT-INJECTION SECURITY VERIFICATION");
  console.log("========================================\n");

  const results: TestResult[] = [];

  for (const testCase of PROMPT_INJECTION_CASES) {
    const result = runCase(testCase);

    results.push(result);

    if (result.passed) {
      console.log(`✓ ${testCase.id} — ${testCase.name}`);
    } else {
      console.error(`✗ ${testCase.id} — ${testCase.name}`);
      console.error(`  ${result.reason}`);
    }
  }

  const passed = results.filter(
    (result) => result.passed,
  ).length;

  console.log("\n========================================");
  console.log(
    `Prompt-injection tests: ${passed}/${results.length} passed`,
  );
  console.log("========================================");

  if (passed !== results.length) {
    console.error(
      "\nPrompt-injection security verification failed.",
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    "\nPrompt-injection security verification passed.",
  );
}

main();