import { evaluateToolPolicy } from "@/lib/policies/engine";
import { ToolCallSchema } from "@/lib/tools/schemas";
import { isRegisteredTool } from "@/lib/tools/registry";

type SecurityTest = {
  name: string;
  run: () => void;
};

const tests: SecurityTest[] = [
    {
    name: "Critical bank-account change cannot be executed",
    run: () => {
      const registered = isRegisteredTool(
        "change_bank_account" as never,
      );

      if (registered) {
        throw new Error(
          "change_bank_account is incorrectly registered",
        );
      }

      const parsed = ToolCallSchema.safeParse({
        toolName: "change_bank_account",
        arguments: {
          accountNumber: "123456789",
        },
      });

      if (parsed.success) {
        throw new Error(
          "change_bank_account incorrectly passed ToolCallSchema",
        );
      }
    },
  },

  {
    name: "Refund requires human approval",
    run: () => {
      const result = evaluateToolPolicy("request_refund", {
        amountCents: 5000,
      });

      if (result.decision !== "APPROVAL_REQUIRED") {
        throw new Error(
          `Expected APPROVAL_REQUIRED, received ${result.decision}`,
        );
      }
    },
  },

  {
    name: "Customer read is allowed",
    run: () => {
      const result = evaluateToolPolicy("get_customer");

      if (result.decision !== "ALLOW") {
        throw new Error(
          `Expected ALLOW, received ${result.decision}`,
        );
      }

      if (result.riskLevel !== "LOW") {
        throw new Error(
          `Expected LOW, received ${result.riskLevel}`,
        );
      }
    },
  },

  {
    name: "Appointment read is allowed",
    run: () => {
      const result = evaluateToolPolicy("get_appointment");

      if (result.decision !== "ALLOW") {
        throw new Error(
          `Expected ALLOW, received ${result.decision}`,
        );
      }
    },
  },

  {
    name: "Arbitrary SQL is not registered",
    run: () => {
      const registered = isRegisteredTool("execute_sql" as never);

      if (registered) {
        throw new Error(
          "execute_sql is incorrectly registered",
        );
      }

      const parsed = ToolCallSchema.safeParse({
        toolName: "execute_sql",
        arguments: {
          query: "DROP TABLE customers",
        },
      });

      if (parsed.success) {
        throw new Error(
          "execute_sql incorrectly passed ToolCallSchema",
        );
      }
    },
  },

  {
    name: "Arbitrary shell execution is not registered",
    run: () => {
      const registered = isRegisteredTool("execute_shell" as never);

      if (registered) {
        throw new Error(
          "execute_shell is incorrectly registered",
        );
      }

      const parsed = ToolCallSchema.safeParse({
        toolName: "execute_shell",
        arguments: {
          command: "rm -rf /",
        },
      });

      if (parsed.success) {
        throw new Error(
          "execute_shell incorrectly passed ToolCallSchema",
        );
      }
    },
  },

  {
    name: "Arbitrary code execution is not registered",
    run: () => {
      const registered = isRegisteredTool("execute_code" as never);

      if (registered) {
        throw new Error(
          "execute_code is incorrectly registered",
        );
      }

      const parsed = ToolCallSchema.safeParse({
        toolName: "execute_code",
        arguments: {
          code: "process.exit(1)",
        },
      });

      if (parsed.success) {
        throw new Error(
          "execute_code incorrectly passed ToolCallSchema",
        );
      }
    },
  },

  {
    name: "Unknown tool cannot pass tool-call validation",
    run: () => {
      const parsed = ToolCallSchema.safeParse({
        toolName: "delete_database",
        arguments: {},
      });

      if (parsed.success) {
        throw new Error(
          "Unknown tool incorrectly passed ToolCallSchema",
        );
      }

      const registered = isRegisteredTool("delete_database" as never);

      if (registered) {
        throw new Error(
          "delete_database is incorrectly registered",
        );
      }
    },
  },
];

function main() {
  console.log("========================================");
  console.log("SECURITY VERIFICATION");
  console.log("========================================\n");

  let passed = 0;

  for (const test of tests) {
    try {
      test.run();
      console.log(`✓ ${test.name}`);
      passed++;
    } catch (error) {
      console.error(`✗ ${test.name}`);

      if (error instanceof Error) {
        console.error(`  ${error.message}`);
      } else {
        console.error("  Unknown error");
      }

      process.exitCode = 1;
    }
  }

  console.log("\n========================================");
  console.log(`Security tests: ${passed}/${tests.length} passed`);
  console.log("========================================");

  if (passed !== tests.length) {
    console.error("\nSecurity verification failed.");
    process.exitCode = 1;
    return;
  }

  console.log("\nSecurity verification passed.");
}

main();