import test from "node:test";
import assert from "node:assert/strict";

import { createContextRelevanceFilter } from "../src/core/context-relevance-filter.js";

test("context relevance filter keeps high priority context and summarizes medium signal context", () => {
  const { relevanceFilteredContext } = createContextRelevanceFilter({
    contextRelevanceSchema: {
      schemaId: "context-relevance:project-7",
      contextEntries: [
        {
          source: "project-state",
          relevanceScore: 0.82,
          priorityScore: 0.88,
          freshnessScore: 0.6,
          tokenWeight: 0.62,
          reasons: ["active-bottleneck-present"],
        },
        {
          source: "interaction-context",
          relevanceScore: 0.58,
          priorityScore: 0.55,
          freshnessScore: 0.8,
          tokenWeight: 0.38,
          reasons: ["currently-visible"],
        },
      ],
    },
    projectState: {
      activeBottleneck: { bottleneckId: "approval-blocker", reason: "Approval needed" },
      screenReviewReport: { summary: { blockedScreens: 1 } },
      progressState: { percent: 42 },
      approvals: ["approval-1"],
      events: [{ id: "evt-1" }],
    },
    screenContext: {
      currentSurface: "workspace",
      currentTask: "approve-deploy",
      urgency: "high",
    },
  });

  assert.equal(relevanceFilteredContext.keptContext.length > 0, true);
  assert.equal(relevanceFilteredContext.summarizedContext.length > 0, true);
  assert.equal(relevanceFilteredContext.summary.preservesHighPriorityContext, true);
});

test("context relevance filter falls back safely", () => {
  const { relevanceFilteredContext } = createContextRelevanceFilter();

  assert.equal(typeof relevanceFilteredContext.filterId, "string");
  assert.equal(Array.isArray(relevanceFilteredContext.keptContext), true);
  assert.equal(Array.isArray(relevanceFilteredContext.summarizedContext), true);
  assert.equal(Array.isArray(relevanceFilteredContext.droppedContext), true);
});

test("context relevance filter normalizes malformed schema ids and screen context strings", () => {
  const { relevanceFilteredContext } = createContextRelevanceFilter({
    contextRelevanceSchema: {
      schemaId: {},
      contextEntries: [
        {
          source: " project-state ",
          relevanceScore: "bad",
          priorityScore: 0.8,
          freshnessScore: 0.4,
          tokenWeight: "bad",
          reasons: [" active-bottleneck-present ", null],
        },
        {
          source: " interaction-context ",
          relevanceScore: 0.4,
          priorityScore: 0.5,
          freshnessScore: 0.7,
          tokenWeight: 0.3,
          reasons: [" currently-visible "],
        },
      ],
    },
    projectState: {
      activeBottleneck: { reason: " Approval needed " },
    },
    screenContext: {
      currentSurface: " workspace ",
      currentTask: " review-flow ",
      urgency: " high ",
    },
  });

  assert.equal(relevanceFilteredContext.filterId, "relevance-filter:context");
  assert.equal(relevanceFilteredContext.keptContext[0].summary, "Approval needed");
  assert.equal(relevanceFilteredContext.summarizedContext[0].summary, "workspace");
  assert.equal(relevanceFilteredContext.keptContext[0].reasons[0], "active-bottleneck-present");
});
