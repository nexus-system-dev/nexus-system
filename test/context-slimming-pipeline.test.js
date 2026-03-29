import test from "node:test";
import assert from "node:assert/strict";

import { createContextSlimmingPipeline } from "../src/core/context-slimming-pipeline.js";

test("context slimming pipeline builds minimal ordered context with summaries and dropped report", () => {
  const { slimmedContextPayload, droppedContextSummary } = createContextSlimmingPipeline({
    relevanceFilteredContext: {
      filterId: "relevance-filter:project-7",
      keptContext: [
        {
          itemId: "project-active-bottleneck",
          section: "activeBottleneck",
          source: "project-state",
          summary: "Approval needed",
          payload: { bottleneckId: "approval-blocker" },
          tokenWeight: 0.4,
          priorityScore: 0.9,
          relevanceScore: 0.8,
          freshnessScore: 0.6,
        },
        {
          itemId: "screen-current-task",
          section: "currentTask",
          source: "interaction-context",
          summary: "approve-deploy",
          payload: "approve-deploy",
          tokenWeight: 0.3,
          priorityScore: 0.7,
          relevanceScore: 0.7,
          freshnessScore: 0.8,
        },
      ],
      summarizedContext: [
        { itemId: "project-events", section: "events", source: "project-state", summary: "Events: 6" },
      ],
      droppedContext: [
        { itemId: "screen-urgency", section: "urgency", source: "interaction-context" },
      ],
    },
    tokenBudget: {
      rawBudget: 1200,
      maxItems: 2,
      maxSummaryItems: 1,
    },
  });

  assert.equal(slimmedContextPayload.orderedContext.length, 2);
  assert.equal(slimmedContextPayload.orderedContext[0].itemId, "project-active-bottleneck");
  assert.equal(slimmedContextPayload.summary.isMinimalExecutionContext, true);
  assert.equal(droppedContextSummary.totalDropped, 1);
});

test("context slimming pipeline falls back safely", () => {
  const { slimmedContextPayload, droppedContextSummary } = createContextSlimmingPipeline();

  assert.equal(typeof slimmedContextPayload.payloadId, "string");
  assert.equal(Array.isArray(slimmedContextPayload.orderedContext), true);
  assert.equal(Array.isArray(slimmedContextPayload.summaries), true);
  assert.equal(typeof droppedContextSummary.summaryId, "string");
});
