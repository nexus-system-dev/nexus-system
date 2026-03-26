import test from "node:test";
import assert from "node:assert/strict";

import { createReleaseStatusStateModel } from "../src/core/release-status-state-model.js";

test("release status state model returns canonical release status with terminal states", () => {
  const { releaseStatus } = createReleaseStatusStateModel({
    releaseEvents: [
      {
        id: "release-build-1",
        step: "build",
        status: "completed",
      },
      {
        id: "release-publish-2",
        step: "publish",
        status: "published",
      },
    ],
  });

  assert.equal(releaseStatus.status, "published");
  assert.equal(Array.isArray(releaseStatus.stages), true);
  assert.equal(Array.isArray(releaseStatus.terminalStates), true);
  assert.equal(releaseStatus.stages[1].isTerminal, true);
});

test("release status state model marks failed release as terminal", () => {
  const { releaseStatus } = createReleaseStatusStateModel({
    releaseEvents: [
      {
        id: "release-deploy-1",
        step: "deploy",
        status: "failed",
      },
    ],
  });

  assert.equal(releaseStatus.status, "failed");
  assert.equal(releaseStatus.stages[0].isTerminal, true);
});
