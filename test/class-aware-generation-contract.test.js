import test from "node:test";
import assert from "node:assert/strict";

import { createClassAwareGenerationContract } from "../src/core/class-aware-generation-contract.js";
import { createLearningAwareGenerationDecision } from "../src/core/learning-aware-generation-decision.js";

test("class-aware generation contract differentiates landing-page generation truth", () => {
  const contract = createClassAwareGenerationContract({
    productClass: "landing-page",
    artifactExpectation: {
      title: "Coach launch page",
      projectType: "landing-page",
      proofFocus: ["headline promise", "trust proof"],
    },
    runtimeDirection: {
      buildSurfaceFamily: "web-marketing-surface",
      previewFamily: "web-preview",
      runtimeFamily: "web-static",
      packagingFamily: "web-build",
      releasePathFamily: "web-deployment",
    },
    qualityBaseline: {
      visibleProofPoints: ["single-cta"],
      requiredSurfaceElements: ["headline", "cta"],
    },
  });

  assert.equal(contract.generationMode, "conversion-surface");
  assert.equal(contract.surfaceMutationModel, "section-sequence");
  assert.equal(contract.generationIntent.primaryAction.actionIntent, "convert");
  assert.equal(contract.visibleMutationTargets.includes("single-cta"), true);
  assert.equal(contract.forbiddenGenericPatterns.includes("generic-dashboard-layout"), true);
});

test("class-aware generation contract differentiates internal-tool generation truth", () => {
  const contract = createClassAwareGenerationContract({
    productClass: "internal-tool",
    artifactExpectation: {
      title: "Ops queue workspace",
      projectType: "internal-tool",
      proofFocus: ["queue ownership", "service-level state"],
    },
    runtimeDirection: {
      buildSurfaceFamily: "workspace-surface",
      previewFamily: "workspace-preview",
      runtimeFamily: "web-app-runtime",
      packagingFamily: "workspace-package",
      releasePathFamily: "private-workspace-release",
    },
    qualityBaseline: {
      visibleProofPoints: ["next-action-view"],
      requiredSurfaceElements: ["queue-panel", "ownership-panel"],
    },
  });

  assert.equal(contract.generationMode, "workspace-operations");
  assert.equal(contract.surfaceMutationModel, "queue-workspace");
  assert.equal(contract.generationIntent.primaryAction.actionIntent, "operate");
  assert.equal(contract.visibleMutationTargets.includes("queue-panel"), true);
  assert.equal(contract.forbiddenGenericPatterns.includes("generic-marketing-shell"), true);
});

test("learning-aware generation decision upgrades the generation contract with stored signals", () => {
  const baseContract = createClassAwareGenerationContract({
    productClass: "landing-page",
    artifactExpectation: {
      title: "Coach launch page",
      projectType: "landing-page",
      proofFocus: ["headline promise", "trust proof"],
    },
  });

  const { classAwareGenerationContract } = createLearningAwareGenerationDecision({
    productClass: "landing-page",
    classAwareGenerationContract: baseContract,
    outcomeFeedbackState: {
      status: "attention-required",
      trend: "stalled",
      feedbackItems: [{ label: "failure pattern" }],
    },
    learningInsights: {
      items: [{ pattern: "retry-pattern" }],
    },
    approvalStatus: {
      status: "approved",
    },
    crossProjectPatternPanel: {
      recommendationHints: [{ label: "Keep the primary CTA singular" }],
    },
    productIterationInsights: {
      summary: {
        recommendedDirection: "stabilize-core-proof",
      },
    },
  });

  assert.equal(classAwareGenerationContract.generationIntent.learningAware, true);
  assert.equal(classAwareGenerationContract.generationIntent.source, "learning-aware-generation-contract");
  assert.equal(classAwareGenerationContract.generationIntent.learningStrategy, "repair-before-expand");
  assert.match(classAwareGenerationContract.generationIntent.generationGoal, /Stabilize value proof/i);
  assert.equal(classAwareGenerationContract.generationIntent.learnedFocusAreas.length >= 2, true);
  assert.match(classAwareGenerationContract.generationIntent.primaryAction.label, /Stabilize value proof/i);
});
