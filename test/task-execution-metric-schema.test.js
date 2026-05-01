import test from "node:test";
import assert from "node:assert/strict";

import { defineTaskExecutionMetricSchema } from "../src/core/task-execution-metric-schema.js";

test("task execution metric schema returns canonical entries for completed failed retried and dependency-blocked tasks", () => {
  const { taskExecutionMetric } = defineTaskExecutionMetricSchema({
    projectId: "giftwallet",
    taskResults: [
      {
        id: "evt-1",
        projectId: "giftwallet",
        taskId: "task-1",
        agentId: "dev-agent",
        assignmentEventId: "assign-1",
        status: "completed",
        timestamp: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "evt-2",
        projectId: "giftwallet",
        taskId: "task-2",
        agentId: "qa-agent",
        assignmentEventId: "assign-2",
        status: "failed",
        timestamp: "2026-01-01T00:01:00.000Z",
      },
      {
        id: "evt-3",
        projectId: "giftwallet",
        taskId: "task-2",
        agentId: "qa-agent",
        assignmentEventId: "assign-3",
        status: "retried",
        timestamp: "2026-01-01T00:02:00.000Z",
      },
      {
        id: "evt-4",
        projectId: "giftwallet",
        taskId: "task-3",
        lane: "release",
        agentId: "ops-agent",
        assignmentEventId: "assign-4",
        status: "blocked",
        blockedBy: ["task-1"],
        timestamp: "2026-01-01T00:03:00.000Z",
      },
    ],
    roadmap: [
      { id: "task-1", lane: "backend" },
      { id: "task-2", lane: "qa" },
      { id: "task-3", lane: "release" },
    ],
  });

  assert.equal(taskExecutionMetric.taskExecutionMetricId, "task-execution-metric:giftwallet");
  assert.equal(taskExecutionMetric.entries.length, 4);
  assert.deepEqual(taskExecutionMetric.entries.map((entry) => entry.status), [
    "completed",
    "failed",
    "retried",
    "blocked",
  ]);
  assert.equal(taskExecutionMetric.entries.find((entry) => entry.status === "completed")?.lane, "backend");
  assert.equal(taskExecutionMetric.entries.find((entry) => entry.status === "failed")?.lane, "qa");
  assert.equal(taskExecutionMetric.entries.find((entry) => entry.status === "retried")?.lane, "qa");
  assert.deepEqual(taskExecutionMetric.entries.find((entry) => entry.status === "blocked")?.blockedBy, ["task-1"]);
});

test("task execution metric schema excludes duplicate task result entries", () => {
  const { taskExecutionMetric } = defineTaskExecutionMetricSchema({
    projectId: "giftwallet",
    taskResults: [
      {
        id: "evt-1",
        projectId: "giftwallet",
        taskId: "task-1",
        status: "completed",
      },
      {
        id: "evt-1",
        projectId: "giftwallet",
        taskId: "task-1",
        status: "completed",
      },
    ],
  });

  assert.equal(taskExecutionMetric.entries.length, 1);
});
