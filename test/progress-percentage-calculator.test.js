import test from "node:test";
import assert from "node:assert/strict";

import { createProgressPercentageCalculator } from "../src/core/progress-percentage-calculator.js";

test("progress percentage calculator keeps running progress above baseline when logs exist", () => {
  const { progressPercent } = createProgressPercentageCalculator({
    normalizedProgressInputs: {
      progressPercent: 10,
      hasRuntimeLogs: true,
      taskResults: [],
    },
    progressPhase: "running",
  });

  assert.equal(progressPercent, 25);
});

test("progress percentage calculator returns 100 for completed phase", () => {
  const { progressPercent } = createProgressPercentageCalculator({
    normalizedProgressInputs: {
      progressPercent: 60,
    },
    progressPhase: "completed",
  });

  assert.equal(progressPercent, 100);
});
