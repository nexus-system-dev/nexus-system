import test from "node:test";
import assert from "node:assert/strict";

import { createProgressPhaseResolver } from "../src/core/progress-phase-resolver.js";

test("progress phase resolver marks running progress from logs and percent", () => {
  const { progressPhase } = createProgressPhaseResolver({
    normalizedProgressInputs: {
      status: "running",
      progressPercent: 40,
      hasRuntimeLogs: true,
      latestTaskResult: null,
    },
  });

  assert.equal(progressPhase, "running");
});

test("progress phase resolver marks completed when latest task result completed", () => {
  const { progressPhase } = createProgressPhaseResolver({
    normalizedProgressInputs: {
      status: "running",
      progressPercent: 60,
      latestTaskResult: {
        status: "completed",
      },
    },
  });

  assert.equal(progressPhase, "completed");
});
