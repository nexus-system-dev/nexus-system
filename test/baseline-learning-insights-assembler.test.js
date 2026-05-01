import test from "node:test";
import assert from "node:assert/strict";

import { createBaselineLearningInsightsAssembler } from "../src/core/baseline-learning-insights-assembler.js";

test("baseline learning insights assembler derives deterministic insights from task and approval signals", () => {
  const { learningInsights } = createBaselineLearningInsightsAssembler({
    taskResults: [
      {
        taskId: "task-1",
        taskType: "build",
        status: "failed",
        type: "task.failed",
        timestamp: "2026-04-15T10:00:00.000Z",
      },
      {
        taskId: "task-2",
        taskType: "qa",
        status: "completed",
        type: "task.completed",
        timestamp: "2026-04-15T10:05:00.000Z",
      },
    ],
    approvalRecords: [
      {
        approvalRecordId: "approval-record:1",
        approvalRequestId: "approval:1",
        status: "rejected",
      },
    ],
    approvalStatus: {
      status: "rejected",
      reason: "Owner rejected the current path",
    },
    workspaceModel: {
      workspaceId: "workspace-demo-user",
    },
  });

  assert.equal(learningInsights.insightSetId, "baseline-learning-insights:workspace-demo-user");
  assert.equal(learningInsights.source, "wave2-baseline-assembler");
  assert.equal(learningInsights.sourceWorkspaceId, "workspace-demo-user");
  assert.equal(learningInsights.items.length, 2);
  assert.equal(learningInsights.items[0].pattern, "failure-pattern");
  assert.equal(learningInsights.items[1].pattern, "approval-friction");
  assert.equal(learningInsights.summaryCounts.totalInsights, 2);
  assert.equal(learningInsights.summaryCounts.taskResults, 2);
  assert.equal(learningInsights.summaryCounts.approvalRecords, 1);
});

test("baseline learning insights assembler falls back to an empty-but-canonical payload", () => {
  const { learningInsights } = createBaselineLearningInsightsAssembler({
    taskResults: [],
    approvalRecords: [],
    approvalStatus: null,
    workspaceModel: {
      workspaceId: "workspace-empty",
    },
  });

  assert.equal(learningInsights.insightSetId, "baseline-learning-insights:workspace-empty");
  assert.equal(Array.isArray(learningInsights.items), true);
  assert.equal(learningInsights.items.length, 0);
  assert.equal(learningInsights.summaryCounts.totalInsights, 0);
  assert.match(learningInsights.summary, /waiting for more task outcomes/i);
});
