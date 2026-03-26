import test from "node:test";
import assert from "node:assert/strict";

import { defineExecutionProgressSchema } from "../src/core/execution-progress-schema.js";

test("execution progress schema returns canonical progress payload", () => {
  const progressSchema = defineExecutionProgressSchema({
    taskExecutionState: {
      taskId: "bootstrap-saas-1",
      runId: "bootstrap-request-1",
      stageId: "bootstrap",
      status: "running",
      progressPercent: 40,
      startedAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:05:00.000Z",
      completionEstimate: "2026-01-01T00:15:00.000Z",
    },
    runtimeLogs: [
      {
        level: "info",
        message: "Bootstrap command started",
        timestamp: "2026-01-01T00:01:00.000Z",
      },
    ],
  });

  assert.equal(progressSchema.taskId, "bootstrap-saas-1");
  assert.equal(progressSchema.runId, "bootstrap-request-1");
  assert.equal(progressSchema.stageId, "bootstrap");
  assert.equal(progressSchema.progressPercent, 40);
  assert.equal(progressSchema.logCount, 1);
  assert.equal(progressSchema.logSchema.entries[0].message, "Bootstrap command started");
});
