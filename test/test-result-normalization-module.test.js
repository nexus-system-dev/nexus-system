import test from "node:test";
import assert from "node:assert/strict";

import { createTestResultNormalizationModule } from "../src/core/test-result-normalization-module.js";

test("test result normalization module summarizes passed and pending suites", () => {
  const { normalizedTestResults } = createTestResultNormalizationModule({
    rawTestResults: {
      buildTarget: "web-build",
      releaseStage: "pre-deploy",
      suiteResults: [
        { suiteId: "unit", type: "unit", status: "completed", exitCode: 0, coverage: 0.9 },
        { suiteId: "e2e", type: "e2e", status: "staged", exitCode: null, coverage: 0.76 },
      ],
    },
  });

  assert.equal(normalizedTestResults.status, "pending");
  assert.equal(normalizedTestResults.summary.totalSuites, 2);
  assert.equal(normalizedTestResults.summary.passedSuites, 1);
  assert.equal(normalizedTestResults.summary.pendingSuites, 1);
  assert.equal(normalizedTestResults.summary.flakySuites, 1);
  assert.equal(typeof normalizedTestResults.summary.averageCoverage, "number");
});

test("test result normalization module marks failures when suite did not complete", () => {
  const { normalizedTestResults } = createTestResultNormalizationModule({
    rawTestResults: {
      suiteResults: [
        { suiteId: "integration", type: "integration", status: "failed", exitCode: 1, coverage: 0.5 },
      ],
    },
  });

  assert.equal(normalizedTestResults.status, "failed");
  assert.equal(normalizedTestResults.failures.length, 1);
  assert.equal(normalizedTestResults.failures[0].failureReason, "suite-not-completed");
});
