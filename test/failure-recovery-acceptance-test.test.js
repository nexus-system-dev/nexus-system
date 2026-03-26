import test from "node:test";
import assert from "node:assert/strict";

import { createFailureRecoveryAcceptanceTest } from "../src/core/failure-recovery-acceptance-test.js";

test("failure-recovery acceptance test passes when recovery path and user options exist", () => {
  const { acceptanceResult } = createFailureRecoveryAcceptanceTest({
    acceptanceScenario: {
      scenarios: [
        {
          scenarioKey: "failure-recovery",
          expectedOutcome: "Failure leads to recovery options",
          requiredOutputs: ["recoveryOptionsPayload", "failureExplanation"],
        },
      ],
    },
    recoveryDecision: {
      recoveryDecisionId: "recovery-123",
      decisionType: "fallback",
    },
    recoveryOptionsPayload: {
      headline: "We switched to a safer recovery path",
    },
    failureExplanation: {
      likelyCause: "Primary surface became unavailable",
    },
  });

  assert.equal(acceptanceResult.scenarioKey, "failure-recovery");
  assert.equal(acceptanceResult.status, "passed");
  assert.equal(acceptanceResult.checks.scenarioResolved, true);
  assert.equal(acceptanceResult.checks.hasRecoveryPath, true);
  assert.equal(acceptanceResult.checks.hasUserOptions, true);
  assert.equal(acceptanceResult.checks.hasFailureReason, true);
});

test("failure-recovery acceptance test fails safely when recovery evidence is missing", () => {
  const { acceptanceResult } = createFailureRecoveryAcceptanceTest({
    acceptanceScenario: { scenarios: [] },
    recoveryDecision: {},
    recoveryOptionsPayload: {},
    failureExplanation: {},
  });

  assert.equal(acceptanceResult.status, "failed");
  assert.equal(acceptanceResult.checks.scenarioResolved, false);
  assert.equal(acceptanceResult.checks.hasRecoveryPath, false);
  assert.equal(acceptanceResult.checks.hasUserOptions, false);
  assert.equal(acceptanceResult.checks.hasFailureReason, false);
});
