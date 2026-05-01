import test from "node:test";
import assert from "node:assert/strict";

import { defineTimeSavedEstimationSchema } from "../src/core/time-saved-estimation-schema.js";

test("time saved estimation schema normalizes taskType execution duration and baseline estimate", () => {
  const { timeSavedMetric } = defineTimeSavedEstimationSchema({
    projectId: "giftwallet",
    events: [
      {
        id: "assign-1",
        type: "task.assigned",
        timestamp: "2026-01-01T00:00:00.000Z",
        payload: {
          projectId: "giftwallet",
          agentId: "dev-agent",
          task: {
            id: "task-1",
            taskType: "backend",
          },
        },
      },
    ],
    taskResults: [
      {
        id: "evt-1",
        projectId: "giftwallet",
        taskId: "task-1",
        taskType: "backend",
        agentId: "dev-agent",
        assignmentEventId: "assign-1",
        status: "completed",
        timestamp: "2026-01-01T00:05:00.000Z",
      },
    ],
    baselineEstimates: {
      "task-1": 900000,
    },
  });

  assert.equal(timeSavedMetric.timeSavedMetricId, "time-saved-metric:giftwallet");
  assert.deepEqual(timeSavedMetric.entries, [
    {
      timeSavedMetricEntryId: "time-saved-entry:evt-1",
      projectId: "giftwallet",
      taskId: "task-1",
      taskType: "backend",
      agentId: "dev-agent",
      assignmentEventId: "assign-1",
      status: "completed",
      executionDurationMs: 300000,
      baselineEstimateMs: 900000,
      recordedAt: "2026-01-01T00:05:00.000Z",
    },
  ]);
});

test("time saved estimation schema keeps entries when timestamps or baseline estimates are missing", () => {
  const { timeSavedMetric } = defineTimeSavedEstimationSchema({
    projectId: "giftwallet",
    events: [
      {
        id: "assign-2",
        type: "task.assigned",
        timestamp: "not-a-date",
        payload: {
          projectId: "giftwallet",
          task: {
            id: "task-2",
            taskType: "frontend",
          },
        },
      },
    ],
    taskResults: [
      {
        id: "evt-2",
        projectId: "giftwallet",
        taskId: "task-2",
        taskType: null,
        agentId: "ui-agent",
        assignmentEventId: "assign-2",
        status: "failed",
        timestamp: null,
      },
    ],
  });

  assert.deepEqual(timeSavedMetric.entries, [
    {
      timeSavedMetricEntryId: "time-saved-entry:evt-2",
      projectId: "giftwallet",
      taskId: "task-2",
      taskType: "frontend",
      agentId: "ui-agent",
      assignmentEventId: "assign-2",
      status: "failed",
      executionDurationMs: null,
      baselineEstimateMs: null,
      recordedAt: null,
    },
  ]);
});
