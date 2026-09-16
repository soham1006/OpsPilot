export type VerificationStatus =
  | "VERIFIED"
  | "FAILED";

export interface VerificationResult {
  status: VerificationStatus;
  entityType: string;
  entityId: string;
  expected: Record<string, unknown>;
  actual: Record<string, unknown>;
  reason: string;
}