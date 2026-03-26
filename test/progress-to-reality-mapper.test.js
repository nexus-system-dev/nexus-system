import test from "node:test";
import assert from "node:assert/strict";

import { createProgressToRealityMapper } from "../src/core/progress-to-reality-mapper.js";

test("progress to reality mapper adds user-facing milestones for visible value", () => {
  const { realityProgress } = createProgressToRealityMapper({
    progressState: {
      status: "active",
    },
    executionResult: {
      status: "completed",
      taskId: "bootstrap-1",
    },
    artifacts: ["app-shell", "auth-module"],
    releaseStateUpdate: {
      release: {
        status: "blocked",
      },
    },
  });

  assert.deepEqual(realityProgress.signals, [
    "first-file-generated",
    "repo-created",
    "deploy-blocked",
    "project-advanced",
  ]);
  assert.equal(realityProgress.summary.hasVisibleResult, true);
  assert.equal(realityProgress.summary.valueMoment, "repo");
  assert.deepEqual(realityProgress.userFacingMilestones, [
    "A real project repo now exists",
    "The first visible project files were generated",
    "The project moved from planning into execution",
  ]);
});
