import test from "node:test";
import assert from "node:assert/strict";

import { createTimeSavedCalculator } from "../src/core/time-saved-calculator.js";

test("time saved calculator computes entry-based time saved and clamps negative results to zero", () => {
  const { timeSaved } = createTimeSavedCalculator({
    projectId: "giftwallet",
    timeSavedMetric: {
      entries: [
        {
          timeSavedMetricEntryId: "entry-1",
          projectId: "giftwallet",
          taskId: "task-1",
          taskType: "backend",
          agentId: "dev-agent",
          assignmentEventId: "assign-1",
          status: "completed",
          executionDurationMs: 300000,
          baselineEstimateMs: 1800000,
          recordedAt: "2026-01-01T00:05:00.000Z",
        },
        {
          timeSavedMetricEntryId: "entry-2",
          projectId: "giftwallet",
          taskId: "task-2",
          taskType: "frontend",
          agentId: "ui-agent",
          assignmentEventId: "assign-2",
          status: "completed",
          executionDurationMs: 2000000,
          baselineEstimateMs: 1500000,
          recordedAt: "2026-01-01T00:10:00.000Z",
        },
      ],
    },
  });

  assert.equal(timeSaved.timeSavedId, "time-saved:giftwallet");
  assert.deepEqual(timeSaved.entries, [
    {
      timeSavedEntryId: "time-saved-result:entry-1",
      projectId: "giftwallet",
      taskId: "task-1",
      taskType: "backend",
      agentId: "dev-agent",
      assignmentEventId: "assign-1",
      status: "completed",
      executionDurationMs: 300000,
      baselineEstimateMs: 1800000,
      timeSavedMs: 1500000,
      recordedAt: "2026-01-01T00:05:00.000Z",
    },
    {
      timeSavedEntryId: "time-saved-result:entry-2",
      projectId: "giftwallet",
      taskId: "task-2",
      taskType: "frontend",
      agentId: "ui-agent",
      assignmentEventId: "assign-2",
      status: "completed",
      executionDurationMs: 2000000,
      baselineEstimateMs: 1500000,
      timeSavedMs: 0,
      recordedAt: "2026-01-01T00:10:00.000Z",
    },
  ]);
});

test("time saved calculator keeps entry-based output and returns null when inputs are missing", () => {
  const { timeSaved } = createTimeSavedCalculator({
    projectId: "giftwallet",
    timeSavedMetric: {
      entries: [
        {
          timeSavedMetricEntryId: "entry-1",
          projectId: "giftwallet",
          taskId: "task-1",
          taskType: "growth",
          agentId: "growth-agent",
          assignmentEventId: "assign-1",
          status: "retried",
          executionDurationMs: null,
          baselineEstimateMs: 1200000,
          recordedAt: "2026-01-01T00:05:00.000Z",
        },
      ],
    },
  });

  assert.equal(Array.isArray(timeSaved.entries), true);
  assert.equal(Object.hasOwn(timeSaved, "totalTimeSavedMs"), false);
  assert.deepEqual(timeSaved.entries, [
    {
      timeSavedEntryId: "time-saved-result:entry-1",
      projectId: "giftwallet",
      taskId: "task-1",
      taskType: "growth",
      agentId: "growth-agent",
      assignmentEventId: "assign-1",
      status: "retried",
      executionDurationMs: null,
      baselineEstimateMs: 1200000,
      timeSavedMs: null,
      recordedAt: "2026-01-01T00:05:00.000Z",
    },
  ]);
});
