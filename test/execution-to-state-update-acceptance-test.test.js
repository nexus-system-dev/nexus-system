import test from "node:test";
import assert from "node:assert/strict";

import { createExecutionToStateUpdateAcceptanceTest } from "../src/core/execution-to-state-update-acceptance-test.js";

test("execution-to-state-update acceptance test passes when execution updates state artifacts and explanation", () => {
  const { acceptanceResult } = createExecutionToStateUpdateAcceptanceTest({
    acceptanceScenario: {
      scenarios: [
        {
          scenarioKey: "execution-state-update",
          expectedOutcome: "Execution updates state and explanation payload",
          requiredOutputs: ["projectExplanation", "changeExplanation"],
        },
      ],
    },
    executionResult: {
      executionResultId: "exec-123",
      status: "completed",
    },
    storageRecord: {
      artifacts: ["dist/index.html"],
    },
    projectExplanation: {
      change: {
        summary: "Execution generated artifacts and advanced project state",
      },
    },
  });

  assert.equal(acceptanceResult.scenarioKey, "execution-state-update");
  assert.equal(acceptanceResult.status, "passed");
  assert.equal(acceptanceResult.checks.scenarioResolved, true);
  assert.equal(acceptanceResult.checks.executionCompleted, true);
  assert.equal(acceptanceResult.checks.hasArtifacts, true);
  assert.equal(acceptanceResult.checks.hasChangeExplanation, true);
});

test("execution-to-state-update acceptance test fails safely when execution evidence is missing", () => {
  const { acceptanceResult } = createExecutionToStateUpdateAcceptanceTest({
    acceptanceScenario: {
      scenarios: [],
    },
    executionResult: {
      executionResultId: "exec-unknown",
      status: "failed",
    },
    storageRecord: {},
    projectExplanation: {},
  });

  assert.equal(acceptanceResult.status, "failed");
  assert.equal(acceptanceResult.checks.scenarioResolved, false);
  assert.equal(acceptanceResult.checks.executionCompleted, false);
  assert.equal(acceptanceResult.checks.hasArtifacts, false);
  assert.equal(acceptanceResult.checks.hasChangeExplanation, false);
});
