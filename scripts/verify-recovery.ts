import {
  decideRecovery,
} from "@/lib/verification/recovery";

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }

  console.log(`PASS: ${message}`);
}

function main() {
  console.log(
    "Starting recovery verification...",
  );

  // Successful execution + successful verification
  const completed =
    decideRecovery({
      operationSucceeded: true,
      verificationSucceeded: true,
      retryCount: 0,
    });

  assert(
    completed.action === "COMPLETE",
    "Verified operation completes successfully",
  );

  // Failed operation → one retry allowed
  const retry =
    decideRecovery({
      operationSucceeded: false,
      verificationSucceeded: false,
      retryCount: 0,
    });

  assert(
    retry.action === "RETRY",
    "First failure triggers one controlled retry",
  );

  // Failed after retry → escalate
  const escalate =
    decideRecovery({
      operationSucceeded: false,
      verificationSucceeded: false,
      retryCount: 1,
    });

  assert(
    escalate.action === "ESCALATE",
    "Repeated failure triggers escalation",
  );

  // Successful operation but failed verification
  const verificationFailure =
    decideRecovery({
      operationSucceeded: true,
      verificationSucceeded: false,
      retryCount: 0,
    });

  assert(
    verificationFailure.action === "RETRY",
    "Verification failure is not reported as success",
  );

  console.log(
    "\nRecovery verification completed successfully.",
  );
}

main();