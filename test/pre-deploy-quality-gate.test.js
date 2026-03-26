import test from "node:test";
import assert from "node:assert/strict";

import { createPreDeployQualityGate } from "../src/core/pre-deploy-quality-gate.js";

test("pre-deploy quality gate allows deploy when tests and validation pass", () => {
  const { qualityGateDecision } = createPreDeployQualityGate({
    normalizedTestResults: {
      status: "passed",
      summary: {
        averageCoverage: 0.86,
      },
      suites: [
        { type: "smoke", outcome: "passed" },
        { type: "unit", outcome: "passed" },
      ],
    },
    validationReport: {
      status: "ready",
      isReady: true,
    },
  });

  assert.equal(qualityGateDecision.decision, "allow");
  assert.equal(qualityGateDecision.isAllowed, true);
  assert.deepEqual(qualityGateDecision.blockers, []);
});

test("pre-deploy quality gate blocks deploy when tests are pending or coverage is low", () => {
  const { qualityGateDecision } = createPreDeployQualityGate({
    normalizedTestResults: {
      status: "pending",
      summary: {
        averageCoverage: 0.72,
      },
      suites: [
        { type: "smoke", outcome: "pending" },
      ],
    },
    validationReport: {
      status: "blocked",
      isReady: false,
    },
  });

  assert.equal(qualityGateDecision.decision, "block");
  assert.equal(qualityGateDecision.isAllowed, false);
  assert.equal(qualityGateDecision.blockers.includes("pending-test-suites"), true);
  assert.equal(qualityGateDecision.blockers.includes("coverage-below-threshold"), true);
  assert.equal(qualityGateDecision.blockers.includes("release-validation-not-ready"), true);
});
