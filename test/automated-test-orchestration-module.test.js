import test from "node:test";
import assert from "node:assert/strict";

import { createAutomatedTestOrchestrationModule } from "../src/core/automated-test-orchestration-module.js";

test("automated test orchestration selects high-risk suites for migration changes", () => {
  const { testRunPlan } = createAutomatedTestOrchestrationModule({
    testExecutionRequest: {
      buildTarget: "web-build",
      releaseStage: "pre-deploy",
      runner: "web-test-runner",
      environment: "staging",
      suites: [
        { id: "unit", type: "unit", required: true },
        { id: "integration", type: "integration", required: true },
        { id: "e2e", type: "e2e", required: false },
        { id: "smoke", type: "smoke", required: true },
      ],
    },
    changeSet: [{ id: "change-1", kind: "migration" }],
  });

  assert.equal(testRunPlan.riskLevel, "high");
  assert.equal(testRunPlan.totalSuites, 4);
  assert.deepEqual(
    testRunPlan.selectedSuites.map((suite) => suite.type),
    ["unit", "integration", "e2e", "smoke"],
  );
});

test("automated test orchestration keeps baseline suites for low-risk changes", () => {
  const { testRunPlan } = createAutomatedTestOrchestrationModule({
    testExecutionRequest: {
      buildTarget: "web-build",
      releaseStage: "build-validation",
      runner: "web-test-runner",
      environment: "ci",
      suites: [
        { id: "unit", type: "unit", required: true },
        { id: "integration", type: "integration", required: true },
        { id: "e2e", type: "e2e", required: false },
        { id: "smoke", type: "smoke", required: true },
        { id: "sanity", type: "sanity", required: true },
      ],
    },
    changeSet: [{ id: "change-1", kind: "code" }],
  });

  assert.equal(testRunPlan.riskLevel, "low");
  assert.deepEqual(
    testRunPlan.selectedSuites.map((suite) => suite.type),
    ["unit", "smoke", "sanity"],
  );
});
