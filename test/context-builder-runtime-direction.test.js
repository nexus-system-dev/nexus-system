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
});
