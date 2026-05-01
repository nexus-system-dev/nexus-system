import test from "node:test";
import assert from "node:assert/strict";

import { createBaselineEffortEstimator } from "../src/core/baseline-effort-estimator.js";

test("baseline effort estimator uses fixed Wave 2 taskType defaults only", () => {
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
      },
      {
        id: "evt-2",
        taskId: "task-2",
        taskType: "frontend",
        assignmentEventId: "assign-2",
      },
      {
        id: "evt-3",
        taskId: "task-3",
        taskType: "ops",
        assignmentEventId: "assign-3",
      },
    ],
  });

  assert.equal(baselineEstimate.baselineEstimateId, "baseline-estimate:giftwallet");
  assert.equal(baselineEstimate.domain, "saas");
  assert.equal(baselineEstimate.contextUsed, false);
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
    },
    {
      baselineEstimateEntryId: "baseline-estimate-entry:evt-2",
      taskId: "task-2",
      taskType: "frontend",
      assignmentEventId: "assign-2",
      baselineEstimateMs: 1500000,
    },
    {
      baselineEstimateEntryId: "baseline-estimate-entry:evt-3",
      taskId: "task-3",
      taskType: "ops",
      assignmentEventId: "assign-3",
      baselineEstimateMs: 900000,
    },
  ]);
});

test("baseline effort estimator returns null for unsupported taskType without inference", () => {
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
    },
  ]);
});
