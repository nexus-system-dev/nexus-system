import test from "node:test";
import assert from "node:assert/strict";

import { defineOutcomeEvaluationSchema } from "../src/core/outcome-evaluation-schema.js";

test("outcome evaluation schema derives successful outcome deterministically from canonical task results", () => {
  const { outcomeEvaluation } = defineOutcomeEvaluationSchema({
    projectId: "giftwallet",
    taskResults: [
      {
        id: "evt-1",
        taskId: "task-1",
        taskType: "backend",
        agentId: "dev-agent",
        assignmentEventId: "assign-1",
        status: "completed",
        timestamp: "2026-01-01T00:01:00.000Z",
      },
    ],
    taskExecutionMetric: {
      entries: [{ metricEntryId: "task-execution-entry:evt-1" }],
    },
    taskThroughputSummary: {
      totalCompleted: 1,
      totalFailed: 0,
      totalRetried: 0,
      totalBlocked: 0,
    },
    productivitySummary: {
      totalTimeSavedMs: 120000,
    },
  });

  assert.equal(outcomeEvaluation.outcomeEvaluationId, "outcome-evaluation:giftwallet");
  assert.equal(outcomeEvaluation.status, "successful");
  assert.equal(outcomeEvaluation.latestOutcome?.taskId, "task-1");
  assert.deepEqual(outcomeEvaluation.summary, {
    totalTaskResults: 1,
    totalEvaluatedEntries: 1,
    totalCompleted: 1,
    totalFailed: 0,
    totalRetried: 0,
    totalBlocked: 0,
    totalTimeSavedMs: 120000,
  });
});

test("outcome evaluation schema derives mixed outcome deterministically from canonical task results", () => {
  const { outcomeEvaluation } = defineOutcomeEvaluationSchema({
    projectId: "giftwallet",
    taskResults: [
      {
        id: "evt-1",
        taskId: "task-1",
        taskType: "backend",
        status: "retried",
        timestamp: "2026-01-01T00:01:00.000Z",
      },
      {
        id: "evt-2",
        taskId: "task-2",
        taskType: "qa",
        status: "completed",
        timestamp: "2026-01-01T00:02:00.000Z",
      },
    ],
    taskThroughputSummary: {
      totalCompleted: 1,
      totalFailed: 0,
      totalRetried: 1,
      totalBlocked: 0,
    },
  });

  assert.equal(outcomeEvaluation.status, "mixed");
  assert.equal(outcomeEvaluation.latestOutcome?.eventId, "evt-2");
  assert.deepEqual(
    outcomeEvaluation.evidence.map((entry) => entry.status),
    ["retried", "completed"],
  );
});

test("outcome evaluation schema derives failed outcome when canonical task results contain failures only", () => {
  const { outcomeEvaluation } = defineOutcomeEvaluationSchema({
    projectId: "giftwallet",
    taskResults: [
      {
        id: "evt-1",
        taskId: "task-3",
        taskType: "release",
        status: "failed",
        timestamp: "2026-01-01T00:03:00.000Z",
      },
    ],
    taskThroughputSummary: {
      totalCompleted: 0,
      totalFailed: 1,
      totalRetried: 0,
      totalBlocked: 0,
    },
  });

  assert.equal(outcomeEvaluation.status, "failed");
  assert.equal(outcomeEvaluation.summary.totalFailed, 1);
  assert.equal(outcomeEvaluation.latestOutcome?.status, "failed");
});
