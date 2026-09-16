import { spawnSync } from "node:child_process";

type SecurityCheck = {
  name: string;
  script: string;
};

const checks: SecurityCheck[] = [
  {
    name: "Tool registry security",
    script: "verify:security",
  },
  {
    name: "Prompt-injection defense",
    script: "verify:prompt-injection",
  },
  {
    name: "Tool execution boundary",
    script: "verify:tool-boundary",
  },
  {
    name: "Critical-action blocking",
    script: "verify:critical-actions",
  },
  {
    name: "Approval security",
    script: "verify:approval-security",
  },
];

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const results: Array<{
  name: string;
  script: string;
  passed: boolean;
}> = [];

console.log("");
console.log("========================================");
console.log("OpsPilot Security Verification Suite");
console.log("========================================");
console.log("");

for (const check of checks) {
  console.log("----------------------------------------");
  console.log(`Running: ${check.name}`);
  console.log(`Command: npm run ${check.script}`);
  console.log("----------------------------------------");

  const result = spawnSync(
  npmCommand,
  ["run", check.script],
  {
    stdio: "inherit",
    shell: true,
  },
);

  const passed = result.status === 0;

  results.push({
    name: check.name,
    script: check.script,
    passed,
  });

  console.log("");

  if (!passed) {
    console.log(
      `Result: FAILED (exit code ${result.status ?? "unknown"})`,
    );
  } else {
    console.log("Result: PASSED");
  }

  console.log("");
}

const passed = results.filter((result) => result.passed).length;
const failed = results.length - passed;

console.log("========================================");
console.log("Security Suite Summary");
console.log("========================================");

for (const result of results) {
  console.log(
    `${result.passed ? "PASS" : "FAIL"}  ${result.name}`,
  );
}

console.log("");
console.log(`Suites passed: ${passed}/${results.length}`);
console.log(`Suites failed: ${failed}/${results.length}`);
console.log("");

if (failed > 0) {
  console.error("Security verification suite FAILED.");
  process.exit(1);
}

console.log("All security verification suites passed.");