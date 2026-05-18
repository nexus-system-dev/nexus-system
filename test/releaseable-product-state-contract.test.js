import test from "node:test";
import assert from "node:assert/strict";

import { createReleaseableProductStateContract } from "../src/core/releaseable-product-state-contract.js";

test("releaseable product state contract becomes ready when release readiness is ready", () => {
  const { releaseableProductStateContract } = createReleaseableProductStateContract({
    productClass: "saas",
    projectStage: "release-prep",
    releasePlan: {
      releaseTarget: "web-deployment",
    },
    classAwareRuntimeResolver: {
      runtimeFamily: "web-app-runtime",
    },
    classAwarePackagingPreviewContract: {
      packageArtifactType: "deployable-product-web-bundle",
      packagePath: "saas-package -> web-deployment",
      previewPath: "product-workspace-preview -> product-workspace-preview",
      packagingExpectation: "package must stay aligned to product runtime and release path",
    },
    launchConfirmationState: {
      summary: {
        confirmed: true,
      },
    },
    releaseReadinessEvaluation: {
      status: "ready",
      readinessDecision: "ready-for-release",
      releaseTarget: "web-deployment",
      checks: [
        { checkId: "launch-confirmed", status: "passed", reason: "launch owner approved" },
        { checkId: "build-surface-visible", status: "passed", reason: "surface remains visible" },
      ],
      blockedReasons: [],
      summary: {
        nextAction: "launch-approved",
        readinessScore: 100,
      },
    },
  });

  assert.equal(releaseableProductStateContract.status, "ready");
  assert.equal(releaseableProductStateContract.readinessDecision, "ready-for-release");
  assert.equal(releaseableProductStateContract.releaseTarget, "web-deployment");
  assert.equal(releaseableProductStateContract.packageArtifactType, "deployable-product-web-bundle");
  assert.equal(releaseableProductStateContract.summary.label, "Ready for release");
  assert.equal(releaseableProductStateContract.summary.nextAction, "launch-approved");
  assert.equal(releaseableProductStateContract.summary.readinessScore, 100);
  assert.equal(releaseableProductStateContract.visibleChecks.length, 2);
  assert.equal(releaseableProductStateContract.launchConfirmed, true);
});

test("releaseable product state contract stays preparing when readiness is not yet complete", () => {
  const { releaseableProductStateContract } = createReleaseableProductStateContract({
    productClass: "landing-page",
    projectStage: "build",
    classAwarePackagingPreviewContract: {
      packageArtifactType: "static-web-bundle",
      packagePath: "web-build -> private-deployment",
      previewPath: "live-browser-preview -> live-browser-preview",
    },
    releaseReadinessEvaluation: {
      status: "not-ready",
      readinessDecision: "needs-release-work",
      checks: [
        { checkId: "preview-confirmed", status: "passed", reason: "preview is available" },
        { checkId: "release-handoff", status: "failed", reason: "handoff is missing" },
      ],
      blockedReasons: ["release handoff missing"],
      summary: {
        nextAction: "resolve-release-handoff",
        readinessScore: 50,
      },
    },
  });

  assert.equal(releaseableProductStateContract.status, "preparing");
  assert.equal(releaseableProductStateContract.summary.label, "Preparing releaseable state");
  assert.equal(releaseableProductStateContract.summary.nextAction, "resolve-release-handoff");
  assert.deepEqual(releaseableProductStateContract.blockedReasons, ["release handoff missing"]);
  assert.equal(releaseableProductStateContract.visibleChecks[1].checkId, "release-handoff");
  assert.equal(releaseableProductStateContract.visibleChecks[1].status, "failed");
});
