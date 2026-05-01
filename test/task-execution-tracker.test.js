import test from "node:test";
import assert from "node:assert/strict";

import { createTaskExecutionTracker } from "../src/core/task-execution-tracker.js";

test("task execution tracker recomputes exactly four counters from full metric entries", () => {
  const { taskExecutionCounters } = createTaskExecutionTracker({
    taskExecutionMetric: {
      taskExecutionMetricId: "task-execution-metric:giftwallet",
      entries: [
        { status: "completed" },
        { status: "completed" },
        { status: "failed" },
        { status: "retried" },
        { status: "blocked" },
        { status: "blocked" },
      ],
    },
  });

  assert.deepEqual(taskExecutionCounters, {
    totalCompleted: 2,
    totalFailed: 1,
    totalRetried: 1,
    totalBlocked: 2,
  });
  assert.deepEqual(Object.keys(taskExecutionCounters), [
    "totalCompleted",
    "totalFailed",
    "totalRetried",
    "totalBlocked",
  ]);
});

test("task execution tracker returns zeroed counters for missing metric entries", () => {
  const { taskExecutionCounters } = createTaskExecutionTracker();

  assert.deepEqual(taskExecutionCounters, {
    totalCompleted: 0,
    totalFailed: 0,
    totalRetried: 0,
    totalBlocked: 0,
  });
});
