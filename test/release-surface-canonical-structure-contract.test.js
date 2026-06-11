import test from "node:test";
import assert from "node:assert/strict";

import {
  createReleaseSurfaceCanonicalStructureContract,
} from "../src/core/release-surface-canonical-structure-contract.js";
import { buildReleaseSurfaceViewModel } from "../web/nexus-ui/adapters/release-surface-adapter.js";
import { renderReleaseSurfaceScreen } from "../web/nexus-ui/screens/ReleaseSurfaceScreen.js";

test("SURF-004 defines Release as a human release decision workspace", () => {
  const contract = createReleaseSurfaceCanonicalStructureContract();

  assert.equal(contract.contractId, "SURF-004");
  assert.equal(contract.surfaceId, "release");
  assert.equal(contract.purpose, "human-release-decision-workspace");
  assert.equal(contract.releaseLaw, "preview-plus-gate-plus-deploy-truth");
  assert.equal(contract.requiredRegions.includes("release-preview-surface"), true);
  assert.equal(contract.requiredRegions.includes("release-gate"), true);
  assert.equal(contract.requiredRegions.includes("verification-evidence"), true);
  assert.equal(contract.requiredRegions.includes("deploy-publish-action"), true);
  assert.equal(contract.requiredRegions.includes("failed-release-recovery"), true);
  assert.equal(contract.requiredRegions.includes("rollback-affordance"), true);
  assert.equal(contract.requiredRegions.includes("share-demo-link"), true);
  assert.equal(contract.requiredRegions.includes("version-history-anchor"), true);
  assert.equal(contract.forbiddenShapes.includes("release-as-advanced-side-route"), true);
  assert.equal(contract.forbiddenShapes.includes("release-without-verification-gate"), true);
});

test("Release route renders SURF-004 contract regions without advanced fallback copy", () => {
  const viewModel = buildReleaseSurfaceViewModel({
    project: {
      id: "surf-004-proof",
      name: "Release proof",
      releaseWorkspace: {
        releaseTarget: "web-deployment",
        buildAndDeploy: {
          releaseTag: "v1",
          currentStage: "publish",
          currentStatus: "ready",
        },
        validation: {
          status: "ready",
          isReady: true,
          blockers: [],
          qualityGateDecision: "allow",
        },
        deployment: {
          provider: "vercel",
          target: "production",
          strategy: "manual",
          requiresApproval: true,
        },
        timeline: {
          events: [{ eventId: "release-preview-ready" }],
        },
      },
      releaseableProductStateContract: {
        readinessDecision: "ready",
        previewPath: "workspace-preview",
        packagePath: "saas-package -> web-deployment",
        packageArtifactType: "deployable-web-bundle",
        visibleChecks: [{ label: "Preview checked", status: "passed" }],
        summary: { nextAction: "approve-release" },
      },
    },
  });
  const html = renderReleaseSurfaceScreen(viewModel);

  assert.equal(viewModel.contract.contractId, "SURF-004");
  assert.match(html, /data-release-surface-contract="SURF-004"/);
  assert.match(html, /data-release-framing-task="EXP-004"/);
  assert.match(html, /data-release-framing-boundary="release-framing-not-release-execution"/);
  assert.match(html, /data-release-claim="blocked-before-release-claim"/);
  assert.match(html, /data-release-product-package-status="missing"/);
  assert.match(html, /data-release-standalone-artifact-status="missing"/);
  assert.match(html, /data-release-workspace-shell="canonical-right-rail"/);
  assert.match(html, /data-nexus-workspace-rail="canonical-right-rail"/);
  assert.match(html, /data-nexus-rail-active-route="release"/);
  assert.match(html, /data-nexus-ui-target="loop"/);
  assert.match(html, /data-nexus-ui-target="release"/);
  assert.match(html, /data-nexus-ui-target="home"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /data-surface-id="release"/);
  assert.match(html, /data-surface-purpose="human-release-decision-workspace"/);
  assert.match(html, /data-release-law="preview-plus-gate-plus-deploy-truth"/);
  assert.match(html, /data-release-region="release-preview-surface"/);
  assert.match(html, /data-release-region="release-gate"/);
  assert.match(html, /data-release-region="verification-evidence"/);
  assert.match(html, /data-release-region="deploy-publish-action"/);
  assert.match(html, /data-release-region="failed-release-recovery"/);
  assert.match(html, /data-release-region="rollback-affordance"/);
  assert.match(html, /data-release-region="share-demo-link"/);
  assert.match(html, /data-release-region="version-history-anchor"/);
  assert.match(html, /data-release-region="release-engine-truth"/);
  assert.match(html, /חבילת מוצר עצמאית להרצה מחוץ לנקסוס/);
  assert.match(html, /תוצר עצמאי שאפשר להריץ ולשחרר/);
  assert.match(html, /שחרור נעול עד שהשער מוכן/);
  assert.doesNotMatch(html, /Advanced lane/);
  assert.doesNotMatch(html, /תצוגה זמנית/);
  assert.doesNotMatch(html, /QA זמני/);
  assert.doesNotMatch(html, /Provider:/);
  assert.doesNotMatch(html, /Strategy:/);
  assert.doesNotMatch(html, /nexus-ui-sidebar/);
});

test("EXP-004 does not claim release when engine readiness lacks product package and standalone artifact", () => {
  const viewModel = buildReleaseSurfaceViewModel({
    project: {
      id: "exp-004-release-framing",
      name: "מסלול שחרור אמת",
      productOwnedBackendSkeleton: {
        productOwnedBackendSkeletonId: "product-owned-backend:exp-004:internal-tool",
        productionBackend: false,
      },
      releaseWorkspace: {
        releaseTarget: "private-deployment",
        buildAndDeploy: {
          currentStage: "release-gate",
          currentStatus: "ready",
        },
        validation: {
          status: "ready",
          isReady: true,
          blockers: [],
          qualityGateDecision: "allow",
        },
        deployment: {
          provider: "railway",
          target: "private-deployment",
          strategy: "manual",
          requiresApproval: true,
        },
        timeline: {
          events: [{ label: "נוצרה בדיקת שחרור" }],
        },
      },
      releaseableProductStateContract: {
        contractId: "releaseable-product-state:internal-tool",
        stateFamily: "releaseable-product-state",
        readinessDecision: "ready",
        previewPath: "תצוגת מוצר פנימית",
        packagePath: "חבילת מוצר חסרה",
        packageArtifactType: "מסלול מוצר",
        visibleChecks: [{ label: "בדיקת תצוגה", status: "passed" }],
        summary: { nextAction: "approve-release" },
      },
      classAwareDeploymentReleasePath: {
        modelId: "deployment-release-path:internal-tool",
        pathFamily: "private-workspace-release-path",
        providerType: "railway",
        primaryTarget: "private-deployment",
        previewPath: "תצוגת מוצר פנימית",
        packagePath: "חבילת מוצר חסרה",
        operationalPath: "preview -> package -> release",
        nextGate: "verify-authenticated-workspace-and-promote",
      },
      deploymentStateFeedbackContract: {
        contractId: "deployment-feedback:deployment-release-path:internal-tool",
        feedbackFamily: "deployment-state-feedback",
        latestProviderStatus: "ready",
      },
    },
  });
  const html = renderReleaseSurfaceScreen(viewModel);

  assert.equal(viewModel.release.framing.taskId, "EXP-004");
  assert.equal(viewModel.release.isReady, false);
  assert.equal(viewModel.release.framing.backendBoundary, "local-mock-backend");
  assert.equal(viewModel.release.framing.productPackageStatus, "missing");
  assert.equal(viewModel.release.framing.standaloneArtifactStatus, "missing");
  assert.equal(viewModel.release.framing.engineAnchors.releaseWorkspace, true);
  assert.equal(viewModel.release.framing.engineAnchors.releaseableProductStateContract, true);
  assert.equal(viewModel.release.framing.engineAnchors.classAwareDeploymentReleasePath, true);
  assert.equal(viewModel.release.framing.engineAnchors.deploymentStateFeedbackContract, true);
  assert.match(html, /data-release-engine-release-workspace="connected"/);
  assert.match(html, /data-release-backend-boundary="local-mock-backend"/);
  assert.match(html, /המוצר עדיין נשען על שמירה מקומית\/מדומה/);
  assert.match(html, /עדיין אין חבילת מוצר עצמאית להרצה מחוץ לנקסוס/);
  assert.match(html, /עדיין אין תוצר עצמאי שאפשר להריץ ולשחרר/);
  assert.match(html, /שחרור דורש אישור משתמש מפורש/);
  assert.match(html, /שחרור נעול עד שהשער מוכן/);
  assert.doesNotMatch(html, /אשר שחרור/);
});
