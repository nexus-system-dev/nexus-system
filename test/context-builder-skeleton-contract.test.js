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

test("context builder exposes automatic skeleton contract for commerce ops", () => {
  const context = buildProjectContext({
    id: "commerce-project",
    name: "Commerce Project",
    goal: "Build a commerce operations workspace",
    projectIntake: {
      projectName: "Commerce Project",
      visionText: "Commerce workspace with order queue and catalog issues",
      projectType: "commerce-ops",
      requestedDeliverables: ["operations"],
    },
    state: {
      lifecycle: {
        phase: "planning",
      },
    },
    canonicalTaskInventory: MINIMAL_CANONICAL_TASK_INVENTORY,
  });

  assert.equal(context.automaticProductSkeletonContract.productClass, "commerce-ops");
  assert.equal(context.automaticProductSkeletonContract.visibleSurfaceType, "commerce-workspace");
  assert.equal(context.bootstrapPlan.skeletonContract.initialStructure.includes("orders-panel"), true);
  assert.equal(context.classSpecificSkeletonQualityBaseline.productClass, "commerce-ops");
  assert.equal(context.classSpecificSkeletonQualityBaseline.qualityBar, "minimum-believable-commerce-workspace");
  assert.equal(context.splitWorkspaceLiveBuildSurfaceModel.workspaceFamily, "commerce-operations-workspace");
  assert.equal(context.splitWorkspaceLiveBuildSurfaceModel.regions.build.previewFrameFamily, "commerce-workspace-preview");
});
