import test from "node:test";
import assert from "node:assert/strict";
import { createDecisionAccuracyTracker } from "../src/core/decision-accuracy-tracker.js";
test("decision accuracy tracker emits ready decision summary", () => {
  const { decisionAccuracySummary } = createDecisionAccuracyTracker({
    ownerActionRecommendations: { ownerActionRecommendationsId: "actions-1", status: "ready", recommendations: [{}, {}] },
    outcomeEvaluation: { status: "ready" },
  });
  assert.equal(decisionAccuracySummary.status, "ready");
});
