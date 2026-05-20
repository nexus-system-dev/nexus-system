import test from "node:test";
import assert from "node:assert/strict";

import { createDeepAdaptiveLearningDecisionImpact } from "../src/core/deep-adaptive-learning-decision-impact.js";

test("deep adaptive learning decision impact steers repair-first decisions from stored signals", () => {
  const { learningDecisionImpact } = createDeepAdaptiveLearningDecisionImpact({
    projectId: "landing-qa",
    productClass: "landing-page",
    outcomeFeedbackState: {
      status: "attention-required",
      trend: "stalled",
    },
    approvalStatus: {
      status: "approved",
    },
    adaptiveExecutionDecision: {
      loopMode: "stabilize",
    },
    releaseEvidenceHandoffModel: {
      nextAction: "collect-more-proof",
    },
    deploymentStateFeedbackContract: {
      policyDecision: "allowed",
      latestProviderStatus: "production-health-unconfirmed",
    },
    postReleaseContinuationLoop: {
      originArtifactTitle: "Landing page",
      nextMoveTitle: "להמשיך את Landing page",
      nextMoveDescription: "הסבב הבא כבר פתוח.",
      continuationMoves: ["לחדד את ההבטחה הראשית"],
    },
    classAwareRuntimeResolver: {
      runtimeFamily: "web-static",
    },
    classAwarePackagingPreviewContract: {
      packageMode: "static-web-build",
    },
  });

  assert.equal(learningDecisionImpact.impactFamily, "deep-adaptive-learning-decision-impact");
  assert.equal(learningDecisionImpact.strategy, "repair-before-expand");
  assert.match(learningDecisionImpact.runtimeDecision.label, /runtime\/package/);
  assert.match(learningDecisionImpact.releaseDecision.currentEffect, /לא מקודם אוטומטית/);
  assert.match(learningDecisionImpact.nextTaskDecision.title, /לייצב/);
  assert.equal(learningDecisionImpact.continuationDecision.moves.length >= 2, true);
});
