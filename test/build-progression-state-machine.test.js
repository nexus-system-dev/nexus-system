import test from "node:test";
import assert from "node:assert/strict";

import { createBuildProgressionStateMachine } from "../src/core/build-progression-state-machine.js";

test("build progression state machine maps bootstrap to execution-bound skeleton-visible state", () => {
  const machine = createBuildProgressionStateMachine({
    productClass: "landing-page",
    projectStage: "bootstrap",
    progressState: {
      status: "active",
      phase: "running",
    },
    splitWorkspaceLiveBuildSurfaceModel: {
      workspaceFamily: "marketing-build-workspace",
      regions: {
        build: {
          visibleMilestones: ["hero-visible", "cta-visible"],
          requiredSurfaceElements: ["headline", "cta"],
        },
        runtime: {
          releasePathFamily: "web-deployment",
        },
      },
    },
  });

  assert.equal(machine.currentStateId, "skeleton-visible");
  assert.equal(machine.summary.currentRouteKey, "execution");
  assert.equal(machine.states.find((state) => state.stateId === "skeleton-visible").status, "active");
});

test("build progression state machine maps release-prep to artifact-bound release visibility", () => {
  const machine = createBuildProgressionStateMachine({
    productClass: "mobile-app",
    projectStage: "release-prep",
    progressState: {
      status: "done",
      phase: "completed",
    },
    splitWorkspaceLiveBuildSurfaceModel: {
      regions: {
        build: {
          visibleMilestones: ["app-shell-visible", "first-screen-visible"],
          requiredSurfaceElements: ["app-frame", "first-screen"],
        },
        runtime: {
          releasePathFamily: "app-distribution",
        },
      },
    },
  });

  assert.equal(machine.currentStateId, "release-path-visible");
  assert.equal(machine.summary.currentRouteKey, "artifact");
  assert.equal(machine.releasePathFamily, "app-distribution");
});
