export const EVALUATION_CATEGORIES = [
  "NORMAL",
  "AMBIGUOUS",
  "POLICY_SENSITIVE",
  "RISKY",
  "FAILURE_ADVERSARIAL",
] as const;

export type EvaluationCategory =
  (typeof EVALUATION_CATEGORIES)[number];

export const EXPECTED_OUTCOMES = [
  "COMPLETED",
  "BLOCKED",
  "WAITING_FOR_APPROVAL",
  "FAILED",
] as const;

export type ExpectedOutcome =
  (typeof EXPECTED_OUTCOMES)[number];

export interface EvaluationCase {
  id: string;
  category: EvaluationCategory;

  description: string;

  sender: string;
  subject: string;
  body: string;

  expectedIntent: string;

  expectedOutcome: ExpectedOutcome;

  expectedToolActions: string[];

  forbiddenToolActions: string[];

  expectedRiskLevel?: string;

  expectedPolicyDecision?: string;

  expectedApproval?: boolean;

  expectedVerification?: boolean;

  notes?: string;
}

export interface EvaluationResult {
  caseId: string;
  category: EvaluationCategory;

  expectedOutcome: ExpectedOutcome;
  actualOutcome: string;

  passed: boolean;

  expectedIntent: string;
  actualIntent: string | null;

  expectedToolActions: string[];
  actualToolActions: string[];

  forbiddenToolActions: string[];

  securityPassed: boolean;

  error?: string;
}

export interface EvaluationSummary {
  totalCases: number;
  passedCases: number;
  failedCases: number;

  overallPassRate: number;

  categoryResults: Record<
    EvaluationCategory,
    {
      total: number;
      passed: number;
      passRate: number;
    }
  >;

  securityPassRate: number;
}