import test from "node:test";
import assert from "node:assert/strict";

import { createTestRunnerAdapterLayer } from "../src/core/test-runner-adapter-layer.js";

test("test runner adapter layer returns completed results on ready surface", () => {
  const { rawTestResults } = createTestRunnerAdapterLayer({
    testRunPlan: {
      buildTarget: "web-build",
      releaseStage: "pre-deploy",
      riskLevel: "high",
      selectedSuites: [
        { id: "unit", type: "unit" },
        { id: "smoke", type: "smoke" },
      ],
    },
    executionSurface: {
      resolvedSurface: {
        surfaceId: "agent-runtime",
        surfaceType: "agent",
        readiness: "ready",
      },
    },
  });

  assert.equal(rawTestResults.status, "completed");
  assert.equal(rawTestResults.suiteResults.length, 2);
  assert.equal(rawTestResults.suiteResults[0].status, "completed");
  assert.equal(rawTestResults.suiteResults[0].exitCode, 0);
});

test("test runner adapter layer stages results on partial surface", () => {
  const { rawTestResults } = createTestRunnerAdapterLayer({
    testRunPlan: {
      buildTarget: "web-build",
      selectedSuites: [{ id: "integration", type: "integration" }],
    },
    executionSurface: {
      resolvedSurface: {
        surfaceId: "sandbox",
        surfaceType: "execution-surface",
        readiness: "partial",
      },
    },
  });

  assert.equal(rawTestResults.status, "staged");
  assert.equal(rawTestResults.suiteResults[0].status, "staged");
  assert.equal(rawTestResults.suiteResults[0].exitCode, null);
});
