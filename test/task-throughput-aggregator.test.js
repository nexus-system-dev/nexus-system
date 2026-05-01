import test from "node:test";
import assert from "node:assert/strict";

import { createTaskThroughputAggregator } from "../src/core/task-throughput-aggregator.js";

test("task throughput aggregator uses metric entries for grouping and counters only as reference totals", () => {
  const { taskThroughputSummary } = createTaskThroughputAggregator({
    taskExecutionMetric: {
      taskExecutionMetricId: "task-execution-metric:giftwallet",
      entries: [
        {
          projectId: "giftwallet",
          lane: "backend",
          agentId: "dev-agent",
          status: "completed",
          timestamp: "2026-01-01T00:00:00.000Z",
        },
        {
          projectId: "giftwallet",
          lane: "backend",
          agentId: "qa-agent",
          status: "failed",
          timestamp: "2026-01-01T01:00:00.000Z",
        },
        {
          projectId: "royal-casino",
          lane: "release",
          agentId: null,
          status: "blocked",
          timestamp: null,
        },
        {
          projectId: "giftwallet",
          lane: "backend",
          agentId: "dev-agent",
          status: "retried",
          timestamp: "not-a-date",
        },
      ],
    },
    taskExecutionCounters: {
      totalCompleted: 1,
      totalFailed: 1,
      totalRetried: 1,
      totalBlocked: 1,
    },
  });

  assert.deepEqual(taskThroughputSummary, {
    totalCompleted: 1,
    totalFailed: 1,
    totalRetried: 1,
    totalBlocked: 1,
    byProject: {
      giftwallet: 3,
      "royal-casino": 1,
    },
    byLane: {
      backend: 3,
      release: 1,
    },
    byAgent: {
      "dev-agent": 2,
      "qa-agent": 1,
    },
    byDay: {
      "2026-01-01": 2,
    },
  });
});

test("task throughput aggregator returns zeroed totals and empty buckets for missing inputs", () => {
  const { taskThroughputSummary } = createTaskThroughputAggregator();

  assert.deepEqual(taskThroughputSummary, {
    totalCompleted: 0,
    totalFailed: 0,
    totalRetried: 0,
    totalBlocked: 0,
    byProject: {},
    byLane: {},
    byAgent: {},
    byDay: {},
  });
});
