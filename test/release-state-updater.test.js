import test from "node:test";
import assert from "node:assert/strict";

import { createReleaseStateUpdater } from "../src/core/release-state-updater.js";

test("release state updater returns updated state and execution graph for ready validation", () => {
  const { updatedProjectState, updatedExecutionGraph } = createReleaseStateUpdater({
    releaseEvents: [
      { id: "release-build", step: "build", summary: "Build release" },
      { id: "release-submit", step: "submit", summary: "Submit release" },
    ],
    validationReport: {
      isReady: true,
    },
    projectState: {},
  });

  assert.equal(updatedProjectState.release.status, "validated");
  assert.deepEqual(updatedProjectState.release.completedEventIds, ["release-build", "release-submit"]);
  assert.equal(updatedExecutionGraph.nodes.every((node) => node.status === "done"), true);
});

test("release state updater blocks execution graph when validation fails", () => {
  const { updatedProjectState, updatedExecutionGraph } = createReleaseStateUpdater({
    releaseEvents: [
      { id: "release-build", step: "build", summary: "Build release" },
    ],
    validationReport: {
      isReady: false,
    },
    projectState: {},
  });

  assert.equal(updatedProjectState.release.status, "blocked");
  assert.deepEqual(updatedProjectState.release.completedEventIds, []);
  assert.equal(updatedExecutionGraph.nodes[0].status, "blocked");
});
