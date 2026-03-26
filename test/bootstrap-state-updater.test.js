import test from "node:test";
import assert from "node:assert/strict";

import { createBootstrapStateUpdater } from "../src/core/bootstrap-state-updater.js";

test("bootstrap state updater returns updated state and execution graph for valid bootstrap", () => {
  const { updatedProjectState, updatedExecutionGraph } = createBootstrapStateUpdater({
    validationResult: {
      isValid: true,
      status: "valid",
    },
    bootstrapTasks: [
      {
        id: "bootstrap-saas-1",
        summary: "Bootstrap: initialize-app-shell",
        expectedArtifacts: ["app-shell"],
      },
      {
        id: "bootstrap-saas-2",
        summary: "Bootstrap: initialize-auth-core",
        expectedArtifacts: ["auth-module"],
      },
    ],
    projectState: {
      businessGoal: "Ship MVP",
    },
  });

  assert.equal(updatedProjectState.bootstrap.status, "validated");
  assert.equal(updatedProjectState.bootstrap.completedTaskIds.length, 2);
  assert.equal(updatedExecutionGraph.nodes.every((node) => node.status === "done"), true);
});

test("bootstrap state updater blocks bootstrap graph when validation fails", () => {
  const { updatedProjectState, updatedExecutionGraph } = createBootstrapStateUpdater({
    validationResult: {
      isValid: false,
      status: "invalid",
    },
    bootstrapTasks: [
      {
        id: "bootstrap-generic-1",
        summary: "Bootstrap: create-initial-structure",
        expectedArtifacts: ["project-root"],
      },
    ],
  });

  assert.equal(updatedProjectState.bootstrap.status, "blocked");
  assert.equal(updatedExecutionGraph.nodes[0].status, "blocked");
});
