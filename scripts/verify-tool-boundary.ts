import { executeRegisteredTool } from "@/lib/tools/execute";
import { ToolCallSchema } from "@/lib/tools/schemas";

type SecurityTest = {
  name: string;
  run: () => Promise<void>;
};

const tests: SecurityTest[] = [
  {
    name: "Unknown tool is rejected",
    run: async () => {
      const result = await executeRegisteredTool({
        toolName: "delete_database" as never,
        arguments: {},
      });

      if (result.success) {
        throw new Error(
          "Unknown tool was executed successfully.",
        );
      }
    },
  },

  {
    name: "Arbitrary shell tool is rejected",
    run: async () => {
      const result = await executeRegisteredTool({
        toolName: "execute_shell" as never,
        arguments: {
          command: "whoami",
        },
      });

      if (result.success) {
        throw new Error(
          "Arbitrary shell execution was allowed.",
        );
      }
    },
  },

  {
    name: "Arbitrary SQL tool is rejected",
    run: async () => {
      const result = await executeRegisteredTool({
        toolName: "execute_sql" as never,
        arguments: {
          query: "SELECT * FROM customers",
        },
      });

      if (result.success) {
        throw new Error(
          "Arbitrary SQL execution was allowed.",
        );
      }
    },
  },

  {
    name: "Arbitrary code tool is rejected",
    run: async () => {
      const result = await executeRegisteredTool({
        toolName: "execute_code" as never,
        arguments: {
          code: "process.exit(1)",
        },
      });

      if (result.success) {
        throw new Error(
          "Arbitrary code execution was allowed.",
        );
      }
    },
  },

  {
    name: "Appointment lookup requires an appointment ID",
    run: async () => {
      const result = await executeRegisteredTool({
        toolName: "get_appointment",
        arguments: {},
      });

      if (result.success) {
        throw new Error(
          "Appointment lookup succeeded without an appointment ID.",
        );
      }
    },
  },

  {
    name: "Refund requires required arguments",
    run: async () => {
      const result = await executeRegisteredTool({
        toolName: "request_refund",
        arguments: {},
      });

      if (result.success) {
        throw new Error(
          "Refund execution succeeded with missing arguments.",
        );
      }
    },
  },

  {
    name: "Reschedule requires all required arguments",
    run: async () => {
      const result = await executeRegisteredTool({
        toolName: "reschedule_appointment",
        arguments: {
          appointmentId: "A2001",
        },
      });

      if (result.success) {
        throw new Error(
          "Reschedule succeeded with incomplete arguments.",
        );
      }
    },
  },

  {
    name: "Malformed tool call fails schema validation",
    run: async () => {
      const parsed = ToolCallSchema.safeParse({
        toolName: "get_customer",
        arguments: "DROP TABLE customers",
      });

      if (parsed.success) {
        throw new Error(
          "Malformed tool arguments passed ToolCallSchema.",
        );
      }
    },
  },
];

async function main() {
  console.log("========================================");
  console.log("TOOL-BOUNDARY SECURITY VERIFICATION");
  console.log("========================================\n");

  let passed = 0;

  for (const test of tests) {
    try {
      await test.run();

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
  console.log(`Tool-boundary tests: ${passed}/${tests.length} passed`);
  console.log("========================================");

  if (passed !== tests.length) {
    console.error("\nTool-boundary security verification failed.");
    process.exitCode = 1;
    return;
  }

  console.log("\nTool-boundary security verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});