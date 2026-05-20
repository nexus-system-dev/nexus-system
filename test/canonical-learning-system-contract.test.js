import test from "node:test";
import assert from "node:assert/strict";

import { createCanonicalLearningSystemContract } from "../src/core/canonical-learning-system-contract.js";

test("canonical learning system contract separates learning layers and decision impacts truthfully", () => {
  const { canonicalLearningSystemContract } = createCanonicalLearningSystemContract({
    learningInsights: {
      items: [{ pattern: "failure-pattern" }],
    },
    outcomeFeedbackState: {
      feedbackItems: [{ label: "Execution outcome" }],
    },
    userPreferenceSignals: {
      signals: [{ label: "Explicit approvals" }],
    },
    crossProjectPatternPanel: {
      patterns: [{ label: "Approval wording" }],
      recommendationHints: [{ label: "Keep approvals explicit" }],
    },
    approvalStatus: {
      status: "approved",
    },
    adaptiveExecutionDecision: {
      decisionId: "adaptive-loop-1",
      loopMode: "rerun-with-repair",
    },
    canonicalBacklogRegeneration: {
      regenerationId: "regen-1",
    },
    classAwareGenerationContract: {
      surfaceMutationModel: "section-sequence",
      generationIntent: {
        proofArtifactType: "landing-page",
      },
    },
    classAwareRuntimeResolver: {
      runtimeFamily: "web-static",
    },
    classAwarePackagingPreviewContract: {
      packageMode: "static-web-build",
    },
    releaseEvidenceHandoffModel: {
      releaseTarget: "private-deployment",
      nextAction: "resolve-release-readiness-gaps",
    },
    deploymentStateFeedbackContract: {
      latestProviderStatus: "published",
      policyDecision: "allowed",
    },
    postReleaseContinuationLoop: {
      nextMoveTitle: "Refine the landing page value proof",
    },
  });

  assert.equal(canonicalLearningSystemContract.contractFamily, "canonical-learning-system");
  assert.equal(canonicalLearningSystemContract.memoryLayers.length, 3);
  assert.equal(canonicalLearningSystemContract.memoryLayers[0].title, "Project memory");
  assert.equal(canonicalLearningSystemContract.memoryLayers[1].title, "User preference memory");
  assert.equal(canonicalLearningSystemContract.memoryLayers[2].title, "System learning");
  assert.equal(canonicalLearningSystemContract.learningInputs.length, 13);
  assert.equal(canonicalLearningSystemContract.decisionImpacts.length, 8);
  assert.equal(canonicalLearningSystemContract.summary.liveInputs >= 3, true);
  assert.equal(canonicalLearningSystemContract.summary.crossProjectPatterns, 1);
  assert.match(canonicalLearningSystemContract.explicitProhibitions[0], /hidden ai intuition/i);
});
