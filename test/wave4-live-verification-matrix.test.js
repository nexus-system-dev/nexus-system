import test from "node:test";
import assert from "node:assert/strict";

import { createWave4LiveVerificationMatrix } from "../src/core/wave4-live-verification-matrix.js";

test("wave 4 live verification matrix defines deterministic verification lanes", () => {
  const { wave4LiveVerificationMatrix } = createWave4LiveVerificationMatrix({
    productClass: "landing-page",
    projectStage: "bootstrap",
    buildProgressionStateMachine: {
      currentStateId: "skeleton-visible",
      summary: {
        currentLabel: "השלב הפעיל עוד לא ננעל",
      },
    },
    classAwareGenerationContract: {
      generationIntent: {
        proofArtifactType: "generated-marketing-surface",
      },
      surfaceMutationModel: "section-sequence",
    },
    classSpecificSurfaceEvolutionRules: {
      frontendSurfaceType: "marketing-page",
      sceneType: "section-sequence",
    },
    localWorkspaceContract: {
      workspaceMode: "browser-backed-local-workspace",
      continuity: {
        resumeWorkspace: "workspace",
      },
    },
    classAwareRuntimeResolver: {
      runtimeFamily: "web-static",
      summary: {
        projectFacingPath: "web-static -> web-deployment",
      },
    },
    classAwarePackagingPreviewContract: {
      previewMode: "live-browser-preview",
      packageMode: "static-web-build",
    },
    releaseableProductStateContract: {
      summary: {
        label: "Not releaseable yet",
      },
      releaseTarget: "private-deployment",
      packageArtifactType: "deployable-web-bundle",
    },
    releaseEvidenceHandoffModel: {
      explainableReleasePath: "preview -> package -> deployment",
      nextAction: "resolve-release-readiness-gaps",
    },
    postReleaseContinuationLoop: {
      nextMoveTitle: "לקדם את Landing page",
    },
    growthOpportunitySurfacingBoundary: {
      statusLabel: "הצעות ההמשך נשארות bounded",
    },
    classAwareDeploymentReleasePath: {
      pathFamily: "web-deployment-path",
      primaryTarget: "private-deployment",
    },
    deploymentStateFeedbackContract: {
      statusLabel: "מצב ה־deploy גלוי ומתקדם",
      latestProviderStatus: "published",
      policyDecision: "allowed",
    },
    crossSurfaceContinuityContract: {
      statusLabel: "הרצף בין המסכים נשאר מחובר",
      continuityChecks: [
        "route-restore-survives-refresh",
      ],
    },
  });

  assert.equal(wave4LiveVerificationMatrix.matrixFamily, "wave4-live-verification-matrix");
  assert.equal(wave4LiveVerificationMatrix.status, "ready");
  assert.equal(wave4LiveVerificationMatrix.verificationLanes.length, 10);
  assert.equal(wave4LiveVerificationMatrix.verificationLanes[0].routeKey, "understanding");
  assert.match(wave4LiveVerificationMatrix.verificationLanes[3].passCriteria[0], /class-specific artifact intent|releaseability/i);
  assert.equal(wave4LiveVerificationMatrix.summary.totalLanes, 10);
  assert.equal(wave4LiveVerificationMatrix.summary.executionRoutes >= 1, true);
});
