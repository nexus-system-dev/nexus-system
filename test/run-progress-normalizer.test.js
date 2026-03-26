import test from "node:test";
import assert from "node:assert/strict";

import { createRunProgressNormalizer } from "../src/core/run-progress-normalizer.js";

test("run progress normalizer combines progress schema with task results", () => {
  const { normalizedProgressInputs } = createRunProgressNormalizer({
    taskExecutionState: {
      taskId: "bootstrap-saas-1",
      runId: "bootstrap-request-1",
      stageId: "bootstrap",
      status: "running",
      progressPercent: 40,
    },
    runtimeLogs: [{ level: "info", message: "Running bootstrap" }],
    taskResults: [
      {
        taskId: "bootstrap-saas-1",
        status: "completed",
        timestamp: "2026-01-01T00:10:00.000Z",
      },
    ],
  });

  assert.equal(normalizedProgressInputs.taskId, "bootstrap-saas-1");
  assert.equal(normalizedProgressInputs.hasRuntimeLogs, true);
  assert.equal(normalizedProgressInputs.taskResults.length, 1);
  assert.equal(normalizedProgressInputs.latestTaskResult.status, "completed");
});
