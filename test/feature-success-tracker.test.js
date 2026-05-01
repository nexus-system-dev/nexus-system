import { test } from "node:test";
import assert from "node:assert/strict";
import { createFeatureSuccessTracker } from "../src/core/feature-success-tracker.js";

test("createFeatureSuccessTracker returns valid summary for empty input", () => {
  const { featureSuccessSummary } = createFeatureSuccessTracker({});
  assert.ok(featureSuccessSummary.trackerId);
  assert.ok(typeof featureSuccessSummary.adoptionLevel === "string");
  assert.ok(typeof featureSuccessSummary.successRate === "number");
  assert.equal(Array.isArray(featureSuccessSummary.frictionIndicators), true);
});

test("createFeatureSuccessTracker classifies high adoption", () => {
  const { featureSuccessSummary } = createFeatureSuccessTracker({
    featureSuccessMetric: { activationRate: 0.8, repeatUsageRate: 0.7, completionRate: 0.9, overrideRate: 0.05, dropOffPoints: [] },
  });
  assert.equal(featureSuccessSummary.adoptionLevel, "high");
  assert.equal(featureSuccessSummary.stickinessLevel, "sticky");
  assert.equal(featureSuccessSummary.meta.isHighAdoption, true);
});

test("createFeatureSuccessTracker detects friction indicators", () => {
  const { featureSuccessSummary } = createFeatureSuccessTracker({
    featureSuccessMetric: {
      activationRate: 0.2,
      repeatUsageRate: 0.1,
      completionRate: 0.3,
      overrideRate: 0.5,
      dropOffPoints: [
        { stepId: "s1" }, { stepId: "s2" }, { stepId: "s3" },
      ],
    },
  });
  assert.ok(featureSuccessSummary.frictionIndicators.includes("high-override-rate"));
  assert.ok(featureSuccessSummary.frictionIndicators.includes("multiple-drop-off-points"));
  assert.ok(featureSuccessSummary.frictionIndicators.includes("low-completion-rate"));
  assert.equal(featureSuccessSummary.meta.hasFriction, true);
});
