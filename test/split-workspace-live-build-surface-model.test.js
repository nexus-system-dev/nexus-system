import test from "node:test";
import assert from "node:assert/strict";

import { createSplitWorkspaceAndLiveBuildSurfaceModel } from "../web/shared/split-workspace-live-build-surface-model.js";

test("split workspace model makes build region dominant for mobile app", () => {
  const model = createSplitWorkspaceAndLiveBuildSurfaceModel({
    productClass: "mobile-app",
    runtimeDirection: {
      previewFamily: "mobile-simulator",
      buildSurfaceFamily: "mobile-app-surface",
      runtimeFamily: "mobile-runtime",
      packagingFamily: "mobile-package",
      releasePathFamily: "app-distribution",
    },
    skeletonContract: {
      visibleMilestones: ["app-shell-visible", "first-screen-visible"],
    },
    skeletonQualityBaseline: {
      requiredSurfaceElements: ["app-frame", "first-screen", "primary-action"],
    },
    projectStage: "bootstrap",
  });

  assert.equal(model.workspaceFamily, "mobile-simulator-workspace");
  assert.equal(model.dominantRegion, "build-region");
  assert.equal(model.regions.build.previewFrameFamily, "mobile-simulator");
  assert.equal(model.regions.build.requiredSurfaceElements.includes("first-screen"), true);
});

test("split workspace model preserves runtime and continuation anchors for internal tool", () => {
  const model = createSplitWorkspaceAndLiveBuildSurfaceModel({
    productClass: "internal-tool",
    runtimeDirection: {
      previewFamily: "workspace-preview",
      buildSurfaceFamily: "workspace-surface",
      runtimeFamily: "web-app-runtime",
      packagingFamily: "workspace-package",
      releasePathFamily: "private-workspace-release",
    },
    skeletonContract: {
      visibleMilestones: ["workspace-visible", "queue-visible", "ownership-visible"],
    },
    skeletonQualityBaseline: {
      requiredSurfaceElements: ["workspace-shell", "queue-panel", "ownership-panel"],
    },
    projectStage: "build",
  });

  assert.equal(model.regions.runtime.continuationAnchor, "internal-tool-continuation-anchor");
  assert.equal(model.regions.runtime.releasePathFamily, "private-workspace-release");
  assert.equal(model.truthRequirements.includes("build-region-must-be-primary"), true);
});
