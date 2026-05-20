import test from "node:test";
import assert from "node:assert/strict";

import { buildProjectContext } from "../src/core/context-builder.js";

const MINIMAL_CANONICAL_TASK_INVENTORY = [
  {
    execution_order: "001",
    taskName: "Canonical Task 001",
    lane: "Test Lane",
    state: "trueGreen",
    blocker: null,
    bridgeCondition: null,
  },
];

test("context builder exposes canonical product class, stage, and runtime direction", () => {
  const context = buildProjectContext({
    id: "landing-project",
    name: "Landing Project",
    goal: "Build a landing page for lead capture",
    projectIntake: {
      projectName: "Landing Project",
      visionText: "A landing page with CTA, trust sections, and booking flow",
      projectType: "landing-page",
      requestedDeliverables: ["growth"],
    },
    state: {
      lifecycle: {
        phase: "planning",
      },
    },
    canonicalTaskInventory: MINIMAL_CANONICAL_TASK_INVENTORY,
  });

  assert.equal(context.productClass, "landing-page");
  assert.equal(context.projectStage, "bootstrap");
  assert.equal(context.runtimeDirection.runtimeFamily, "web-static");
  assert.equal(context.bootstrapPlan.runtimeDirection.previewFamily, "web-preview");
  assert.equal(context.releasePlan.runtimeDirection.releasePathFamily, "web-deployment");
  assert.equal(context.buildProgressionStateMachine.currentStateId, "skeleton-visible");
  assert.equal(context.progressState.buildProgressionRouteKey, "execution");
  assert.equal(context.classSpecificSurfaceEvolutionRules.evolutionFamily, "section-evolution");
  assert.equal(context.classSpecificSurfaceEvolutionRules.frontendSurfaceType, "marketing-page");
  assert.equal(context.classSpecificSurfaceEvolutionRules.sceneType, "section-sequence");
  assert.equal(context.localWorkspaceContract.workspaceMode, "browser-backed-local-workspace");
  assert.equal(context.localWorkspaceContract.desktopShellStatus, "deferred-to-w4-mbn-010");
  assert.equal(context.localWorkspaceContract.identity.projectId, "landing-project");
  assert.equal(context.desktopShellScopeContract.shellFamily, "browser-backed-shell");
  assert.equal(context.desktopShellScopeContract.shellStatus, "scope-defined-not-implemented");
  assert.equal(context.classAwareRuntimeResolver.runtimeFamily, "web-static");
  assert.equal(context.classAwareRuntimeResolver.releasePathFamily, "web-deployment");
  assert.equal(context.classAwareRuntimeResolver.summary.projectFacingPath, "web-static -> web-deployment");
  assert.equal(context.classAwarePackagingPreviewContract.previewMode, "live-browser-preview");
  assert.equal(context.classAwarePackagingPreviewContract.packageMode, "static-web-build");
  assert.equal(context.classAwarePackagingPreviewContract.summary.packagePath, "web-build -> private-deployment");
  assert.equal(context.releaseableProductStateContract.stateFamily, "releaseable-product-state");
  assert.equal(context.releaseableProductStateContract.status, "not-ready");
  assert.equal(context.releaseableProductStateContract.releaseTarget, "private-deployment");
  assert.equal(context.releaseableProductStateContract.packageArtifactType, "deployable-web-bundle");
  assert.equal(context.releaseableProductStateContract.summary.label, "Not releaseable yet");
  assert.equal(context.releaseEvidenceHandoffModel.evidenceFamily, "release-evidence-handoff");
  assert.equal(context.releaseEvidenceHandoffModel.releaseTarget, "private-deployment");
  assert.equal(context.releaseEvidenceHandoffModel.handoffSteps.length >= 1, true);
  assert.equal(context.postReleaseContinuationLoop.loopFamily, "post-release-continuation");
  assert.equal(context.postReleaseContinuationLoop.originReleaseTarget, "private-deployment");
  assert.equal(context.postReleaseContinuationLoop.continuationMoves.length >= 1, true);
  assert.equal(context.growthOpportunitySurfacingBoundary.boundaryFamily, "wave4-growth-opportunity-boundary");
  assert.equal(context.growthOpportunitySurfacingBoundary.status, "not-ready");
  assert.equal(context.growthOpportunitySurfacingBoundary.disallowedMoves.length >= 1, true);
  assert.equal(context.classAwareDeploymentReleasePath.pathFamily, "web-deployment-path");
  assert.equal(context.classAwareDeploymentReleasePath.primaryTarget, "private-deployment");
  assert.equal(context.classAwareDeploymentReleasePath.boundedTargets.length >= 1, true);
  assert.equal(context.deploymentStateFeedbackContract.feedbackFamily, "deployment-state-feedback");
  assert.equal(context.deploymentStateFeedbackContract.providerType, "vercel");
  assert.equal(context.deploymentStateFeedbackContract.feedbackItems.length >= 1, true);
  assert.equal(context.crossSurfaceContinuityContract.continuityFamily, "cross-surface-continuity");
  assert.equal(context.crossSurfaceContinuityContract.status, "connected");
  assert.equal(context.crossSurfaceContinuityContract.continuitySteps.length >= 5, true);
  assert.equal(context.wave4LiveVerificationMatrix.matrixFamily, "wave4-live-verification-matrix");
  assert.equal(context.wave4LiveVerificationMatrix.status, "ready");
  assert.equal(context.wave4LiveVerificationMatrix.verificationLanes.length, 10);
  assert.equal(context.wave4LiveVerificationMatrix.verificationLanes[0].routeKey, "understanding");
  assert.equal(context.canonicalLearningSystemContract.contractFamily, "canonical-learning-system");
  assert.equal(context.canonicalLearningSystemContract.memoryLayers.length, 3);
  assert.equal(context.canonicalLearningSystemContract.decisionImpacts.length, 8);
  assert.equal(context.classAwareGenerationContract.generationIntent.learningAware, true);
  assert.equal(context.generationIntent.learningAware, true);
  assert.equal(context.canonicalLearningSystemContract.decisionImpacts[0].impactId, "generation-quality");
  assert.equal(context.learningDecisionImpact.impactFamily, "deep-adaptive-learning-decision-impact");
  assert.equal(context.canonicalLearningSystemContract.learningDecisionImpact.impactFamily, "deep-adaptive-learning-decision-impact");
});
