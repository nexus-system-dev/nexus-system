import test from "node:test";
import assert from "node:assert/strict";

import { createCrossSurfaceContinuityContract } from "../src/core/cross-surface-continuity-contract.js";

test("cross-surface continuity contract connects build proof release deployment continuation and timeline", () => {
  const { crossSurfaceContinuityContract } = createCrossSurfaceContinuityContract({
    buildProgressionStateMachine: {
      summary: {
        currentRouteKey: "execution",
        currentLabel: "surface-evolving",
      },
      overlayStatus: "active",
    },
    proofArtifact: {
      artifactId: "artifact-1",
      title: "Landing page",
      status: "ready",
    },
    releaseEvidenceHandoffModel: {
      status: "active",
      explainableReleasePath: "product-preview -> web-build -> web-deployment",
      persistenceRule: "release evidence survives proof revisit",
    },
    deploymentStateFeedbackContract: {
      status: "active",
      statusLabel: "מצב ה־deploy גלוי ומתקדם",
      continuityRule: "deployment feedback survives restore",
    },
    postReleaseContinuationLoop: {
      status: "active",
      nextMoveTitle: "לחדד את ההבטחה הראשית מעל הקפל",
      continuityRule: "continuation survives revisit",
    },
  });

  assert.equal(crossSurfaceContinuityContract.continuityFamily, "cross-surface-continuity");
  assert.equal(crossSurfaceContinuityContract.status, "connected");
  assert.equal(crossSurfaceContinuityContract.continuitySteps[0].routeKey, "execution");
  assert.equal(crossSurfaceContinuityContract.continuitySteps[1].visibleAnchor, "Landing page");
  assert.match(crossSurfaceContinuityContract.explainablePath, /execution:build/);
  assert.equal(crossSurfaceContinuityContract.continuityChecks.includes("route-restore-survives-refresh"), true);
});
