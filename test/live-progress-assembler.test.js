import test from "node:test";
import assert from "node:assert/strict";

import { createLiveProgressAssembler } from "../src/core/live-progress-assembler.js";

test("live progress assembler returns progressState for active run", () => {
  const { progressState, completionEstimate } = createLiveProgressAssembler({
    progressPhase: "running",
    progressPercent: 40,
    completionEstimate: "in-progress",
  });

  assert.equal(progressState.phase, "running");
  assert.equal(progressState.percent, 40);
  assert.equal(progressState.status, "active");
  assert.equal(completionEstimate, "in-progress");
});

test("live progress assembler marks completed progress as done", () => {
  const { progressState } = createLiveProgressAssembler({
    progressPhase: "completed",
    progressPercent: 100,
    completionEstimate: "completed",
  });

  assert.equal(progressState.status, "done");
});
