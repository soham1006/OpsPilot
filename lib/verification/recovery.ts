export type RecoveryAction =
  | "COMPLETE"
  | "RETRY"
  | "ESCALATE";

export interface RecoveryDecision {
  action: RecoveryAction;
  reason: string;
}

export function decideRecovery(
  input: {
    operationSucceeded: boolean;
    verificationSucceeded: boolean;
    retryCount: number;
  },
): RecoveryDecision {
  if (
    input.operationSucceeded &&
    input.verificationSucceeded
  ) {
    return {
      action: "COMPLETE",
      reason:
        "Operation completed and the resulting state was verified.",
    };
  }

  if (input.retryCount < 1) {
    return {
      action: "RETRY",
      reason:
        "Operation or verification failed; one controlled retry is permitted.",
    };
  }

  return {
    action: "ESCALATE",
    reason:
      "Operation could not be reliably completed after the allowed retry.",
  };
}