import test from "node:test";
import assert from "node:assert/strict";

import { createBaselineEffortEstimator } from "../src/core/baseline-effort-estimator.js";

test("baseline effort estimator falls back to fixed defaults when no prior execution history exists", () => {
  const { baselineEstimate } = createBaselineEffortEstimator({
    projectId: "giftwallet",
    domain: "saas",
    context: {
      summary: "ignored",
    },
    taskResults: [
      {
        id: "evt-1",
        taskId: "task-1",
        taskType: "backend",
        assignmentEventId: "assign-1",
        timestamp: "2026-01-01T00:30:00.000Z",
      },
      {
        id: "evt-2",
        taskId: "task-2",
        taskType: "frontend",
        assignmentEventId: "assign-2",
        timestamp: "2026-01-01T01:25:00.000Z",
      },
      {
        id: "evt-3",
        taskId: "task-3",
        taskType: "ops",
        assignmentEventId: "assign-3",
        timestamp: "2026-01-01T02:15:00.000Z",
      },
    ],
    events: [
      { id: "assign-1", type: "task.assigned", timestamp: "2026-01-01T00:00:00.000Z" },
      { id: "assign-2", type: "task.assigned", timestamp: "2026-01-01T01:00:00.000Z" },
      { id: "assign-3", type: "task.assigned", timestamp: "2026-01-01T02:00:00.000Z" },
    ],
  });

  assert.equal(baselineEstimate.baselineEstimateId, "baseline-estimate:giftwallet");
  assert.equal(baselineEstimate.domain, "saas");
  assert.equal(baselineEstimate.contextUsed, false);
  assert.deepEqual(baselineEstimate.learnedTaskTypes, {
    backend: {
      sampleSize: 1,
      learnedBaselineMs: 1800000,
    },
    frontend: {
      sampleSize: 1,
      learnedBaselineMs: 1500000,
    },
    ops: {
      sampleSize: 1,
      learnedBaselineMs: 900000,
    },
  });
  assert.deepEqual(baselineEstimate.defaults, {
    backend: 1800000,
    frontend: 1500000,
    growth: 1200000,
    mobile: 2100000,
    ops: 900000,
    release: 900000,
  });
  assert.deepEqual(baselineEstimate.entries, [
    {
      baselineEstimateEntryId: "baseline-estimate-entry:evt-1",
      taskId: "task-1",
      taskType: "backend",
      assignmentEventId: "assign-1",
      baselineEstimateMs: 1800000,
      estimationSource: "task-type-default",
      evidenceCount: 0,
    },
    {
      baselineEstimateEntryId: "baseline-estimate-entry:evt-2",
      taskId: "task-2",
      taskType: "frontend",
      assignmentEventId: "assign-2",
      baselineEstimateMs: 1500000,
      estimationSource: "task-type-default",
      evidenceCount: 0,
    },
    {
      baselineEstimateEntryId: "baseline-estimate-entry:evt-3",
      taskId: "task-3",
      taskType: "ops",
      assignmentEventId: "assign-3",
      baselineEstimateMs: 900000,
      estimationSource: "task-type-default",
      evidenceCount: 0,
    },
  ]);
});

test("baseline effort estimator learns future baseline values from prior execution history", () => {
  const { baselineEstimate } = createBaselineEffortEstimator({
    projectId: "giftwallet",
    taskResults: [
      {
        id: "evt-1",
        taskId: "task-1",
        taskType: "backend",
        assignmentEventId: "assign-1",
        status: "completed",
        timestamp: "2026-01-01T00:10:00.000Z",
      },
      {
        id: "evt-2",
        taskId: "task-2",
        taskType: "backend",
        assignmentEventId: "assign-2",
        status: "completed",
        timestamp: "2026-01-01T00:40:00.000Z",
      },
      {
        id: "evt-3",
        taskId: "task-3",
        taskType: "backend",
        assignmentEventId: "assign-3",
        status: "completed",
        timestamp: "2026-01-01T01:20:00.000Z",
      },
    ],
    events: [
      { id: "assign-1", type: "task.assigned", timestamp: "2026-01-01T00:00:00.000Z" },
      { id: "assign-2", type: "task.assigned", timestamp: "2026-01-01T00:20:00.000Z" },
      { id: "assign-3", type: "task.assigned", timestamp: "2026-01-01T01:00:00.000Z" },
    ],
  });

  assert.deepEqual(baselineEstimate.entries, [
    {
      baselineEstimateEntryId: "baseline-estimate-entry:evt-1",
      taskId: "task-1",
      taskType: "backend",
      assignmentEventId: "assign-1",
      baselineEstimateMs: 1800000,
      estimationSource: "task-type-default",
      evidenceCount: 0,
    },
    {
      baselineEstimateEntryId: "baseline-estimate-entry:evt-2",
      taskId: "task-2",
      taskType: "backend",
      assignmentEventId: "assign-2",
      baselineEstimateMs: 600000,
      estimationSource: "execution-history",
      evidenceCount: 1,
    },
    {
      baselineEstimateEntryId: "baseline-estimate-entry:evt-3",
      taskId: "task-3",
      taskType: "backend",
      assignmentEventId: "assign-3",
      baselineEstimateMs: 900000,
      estimationSource: "execution-history",
      evidenceCount: 2,
    },
  ]);
  assert.equal(baselineEstimate.contextUsed, true);
  assert.deepEqual(baselineEstimate.learnedTaskTypes, {
    backend: {
      sampleSize: 3,
      learnedBaselineMs: 1000000,
    },
  });
});

test("baseline effort estimator leaves unsupported task types unresolved without history", () => {
  const { baselineEstimate } = createBaselineEffortEstimator({
    projectId: "giftwallet",
    taskResults: [
      {
        id: "evt-1",
        taskId: "task-1",
        taskType: "qa",
        assignmentEventId: "assign-1",
      },
    ],
  });

  assert.deepEqual(baselineEstimate.entries, [
    {
      baselineEstimateEntryId: "baseline-estimate-entry:evt-1",
      taskId: "task-1",
      taskType: "qa",
      assignmentEventId: "assign-1",
      baselineEstimateMs: null,
      estimationSource: "unresolved",
      evidenceCount: 0,
    },
  ]);
});
