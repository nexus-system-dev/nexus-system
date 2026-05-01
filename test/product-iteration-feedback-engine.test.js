import { test } from "node:test";
import assert from "node:assert/strict";
import { createProductIterationFeedbackEngine } from "../src/core/product-iteration-feedback-engine.js";

test("createProductIterationFeedbackEngine returns valid insights for empty input", () => {
  const { productIterationInsights } = createProductIterationFeedbackEngine({});
  assert.ok(productIterationInsights.engineId);
  assert.equal(Array.isArray(productIterationInsights.recommendations), true);
  assert.equal(productIterationInsights.recommendationCount, 0);
});

test("createProductIterationFeedbackEngine generates recommendations from friction indicators", () => {
  const { productIterationInsights } = createProductIterationFeedbackEngine({
    featureSuccessSummary: {
      frictionIndicators: ["high-override-rate", "low-completion-rate"],
      adoptionLevel: "low",
    },
  });
  const actionTypes = productIterationInsights.recommendations.map((r) => r.actionType);
  assert.ok(actionTypes.includes("adjust-defaults"));
  assert.ok(actionTypes.includes("simplify-flow"));
  assert.ok(actionTypes.includes("improve-discoverability"));
});

test("createProductIterationFeedbackEngine marks requiresImmediateAction for high priority", () => {
  const { productIterationInsights } = createProductIterationFeedbackEngine({
    featureSuccessSummary: {
      frictionIndicators: ["high-override-rate"],
      adoptionLevel: "high",
    },
  });
  assert.equal(productIterationInsights.meta.requiresImmediateAction, true);
  assert.ok(productIterationInsights.highPriorityCount > 0);
});

test("createProductIterationFeedbackEngine includes outcome-quality recommendation for low score", () => {
  const { productIterationInsights } = createProductIterationFeedbackEngine({
    outcomeFeedbackState: { score: 0.3 },
  });
  const actionTypes = productIterationInsights.recommendations.map((r) => r.actionType);
  assert.ok(actionTypes.includes("improve-quality"));
});
