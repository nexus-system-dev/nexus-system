import test from "node:test";
import assert from "node:assert/strict";

import { createCompletionEstimateCalculator } from "../src/core/completion-estimate-calculator.js";

test("completion estimate calculator returns completed when progress is done", () => {
  const { completionEstimate } = createCompletionEstimateCalculator({
    normalizedProgressInputs: {
      status: "validated",
    },
    progressPercent: 100,
  });

  assert.equal(completionEstimate, "completed");
});

test("completion estimate calculator returns in-progress estimate for partial progress", () => {
  const { completionEstimate } = createCompletionEstimateCalculator({
    normalizedProgressInputs: {
      status: "running",
    },
    progressPercent: 40,
  });

  assert.equal(completionEstimate, "in-progress");
});
