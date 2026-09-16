import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import { runAgent } from "@/lib/agent/orchestrator";
import {
  runEvaluationSuite,
} from "@/lib/evaluation/runner";
import {
  EVALUATION_CASES,
} from "@/lib/evaluation/cases";

import {
  snapshotAllAppointments,
  restoreEvaluationState,
} from "@/lib/evaluation/sandbox";

async function runRealAgent(
  input: {
    sender: string;
    subject: string;
    body: string;
  },
) {
  const snapshots =
    snapshotAllAppointments();

  try {
    const result = await runAgent({
      sender: input.sender,
      subject: input.subject,
      body: input.body,
    });

    return result;
  } finally {
    restoreEvaluationState(
      snapshots,
    );
  }
}

async function main(): Promise<void> {
  console.log(
    "========================================",
  );

  console.log(
    "REAL AGENT EVALUATION",
  );

  console.log(
    "========================================",
  );

  console.log(
    `Evaluation cases: ${EVALUATION_CASES.length}`,
  );

  const {
    results,
    summary,
  } = await runEvaluationSuite(
    EVALUATION_CASES,
    runRealAgent,
  );

  console.log(
    "\n========================================",
  );

  console.log(
    "REAL AGENT EVALUATION SUMMARY",
  );

  console.log(
    "========================================",
  );

  console.log(
    `Total cases: ${summary.totalCases}`,
  );

  console.log(
    `Passed: ${summary.passedCases}`,
  );

  console.log(
    `Failed: ${summary.failedCases}`,
  );

  console.log(
    `Overall pass rate: ${
      (
        summary.overallPassRate * 100
      ).toFixed(2)
    }%`,
  );

  console.log(
    `Security pass rate: ${
      (
        summary.securityPassRate * 100
      ).toFixed(2)
    }%`,
  );

  console.log(
    "\nCategory results:",
  );

  for (
    const [
      category,
      categoryResult,
    ] of Object.entries(
      summary.categoryResults,
    )
  ) {
    console.log(
      `  ${category}: ` +
      `${categoryResult.passed}/` +
      `${categoryResult.total} ` +
      `(${(
        categoryResult.passRate * 100
      ).toFixed(2)}%)`,
    );
  }

  console.log(
    "\n========================================",
  );

  console.log(
    "CASE RESULTS",
  );

  console.log(
    "========================================",
  );

  for (const result of results) {
    console.log(
      `${result.passed ? "PASS" : "FAIL"} ` +
      `${result.caseId} | ` +
      `expected=${result.expectedOutcome} | ` +
      `actual=${result.actualOutcome}`,
    );

    if (!result.passed) {
      if (result.expectedIntent) {
        console.log(
          `  Expected intent: ${result.expectedIntent}`,
        );
      }

      if (result.actualIntent) {
        console.log(
          `  Actual intent: ${result.actualIntent}`,
        );
      }

      if (
        result.error
      ) {
        console.log(
          `  Error: ${result.error}`,
        );
      }
    }
  }

  console.log(
    "\n========================================",
  );

  console.log(
    "Real-agent evaluation completed successfully.",
  );

  console.log(
    "========================================",
  );
}

main().catch((error) => {
  console.error(
    "\nReal-agent evaluation failed:",
    error,
  );

  process.exit(1);
});