import test from "node:test";
import assert from "node:assert/strict";

import { defineTestExecutionSchema } from "../src/core/test-execution-schema.js";

test("test execution schema returns canonical request for web build", () => {
  const { testExecutionRequest } = defineTestExecutionSchema({
    buildTarget: "web-build",
    testConfig: {
      releaseStage: "pre-deploy",
      testTypes: ["unit", "integration", "smoke"],
      coverageThreshold: 0.85,
      retries: 1,
      environment: "staging",
    },
  });

  assert.equal(testExecutionRequest.buildTarget, "web-build");
  assert.equal(testExecutionRequest.releaseStage, "pre-deploy");
  assert.equal(testExecutionRequest.runner, "web-test-runner");
  assert.deepEqual(testExecutionRequest.testTypes, ["unit", "integration", "smoke"]);
  assert.equal(testExecutionRequest.coverageThreshold, 0.85);
  assert.equal(testExecutionRequest.suites.length, 3);
});

test("test execution schema falls back to canonical defaults", () => {
  const { testExecutionRequest } = defineTestExecutionSchema();

  assert.equal(testExecutionRequest.buildTarget, "unknown-build");
  assert.equal(testExecutionRequest.releaseStage, "build-validation");
  assert.equal(testExecutionRequest.runner, "generic-test-runner");
  assert.deepEqual(testExecutionRequest.testTypes, ["unit", "integration", "smoke", "sanity"]);
});
