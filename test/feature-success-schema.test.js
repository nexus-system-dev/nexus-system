import { test } from "node:test";
import assert from "node:assert/strict";
import { defineFeatureSuccessSchema } from "../src/core/feature-success-schema.js";

test("defineFeatureSuccessSchema returns valid metric for empty input", () => {
  const { featureSuccessMetric } = defineFeatureSuccessSchema({});
  assert.ok(featureSuccessMetric.schemaId);
  assert.equal(featureSuccessMetric.eventCount, 0);
  assert.equal(featureSuccessMetric.activationRate, 0);
  assert.equal(featureSuccessMetric.meta.hasUsageEvents, false);
});

test("defineFeatureSuccessSchema computes rates from usage events", () => {
  const { featureSuccessMetric } = defineFeatureSuccessSchema({
    featureId: "feature-x",
    featureUsageEvents: [
      { eventType: "activation" },
      { eventType: "activation" },
      { eventType: "completion" },
      { eventType: "override" },
    ],
  });
  assert.equal(featureSuccessMetric.featureId, "feature-x");
  assert.equal(featureSuccessMetric.activationRate, 0.5);
  assert.equal(featureSuccessMetric.completionRate, 0.25);
  assert.equal(featureSuccessMetric.overrideRate, 0.25);
  assert.equal(featureSuccessMetric.meta.hasUsageEvents, true);
});

test("defineFeatureSuccessSchema captures drop-off points", () => {
  const { featureSuccessMetric } = defineFeatureSuccessSchema({
    featureUsageEvents: [
      { eventType: "drop-off", stepId: "step-1", dropOffRate: 0.6, absoluteCount: 10 },
      { eventType: "drop-off", stepId: "step-2", dropOffRate: 0.2, absoluteCount: 5 },
    ],
  });
  assert.equal(featureSuccessMetric.dropOffPoints.length, 2);
  assert.equal(featureSuccessMetric.dropOffPoints[0].stepId, "step-1");
  assert.equal(featureSuccessMetric.meta.hasDropOffData, true);
});
