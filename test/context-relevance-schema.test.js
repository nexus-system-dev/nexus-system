import test from "node:test";
import assert from "node:assert/strict";

import { defineContextRelevanceSchema } from "../src/core/context-relevance-schema.js";

test("context relevance schema scores project and interaction context for AI review and execution", () => {
  const { contextRelevanceSchema } = defineContextRelevanceSchema({
    projectState: {
      id: "project-7",
      screenReviewReport: {
        summary: {
          blockedScreens: 2,
        },
      },
      activeBottleneck: {
        bottleneckId: "bottleneck-1",
      },
      progressState: {
        status: "blocked",
        percent: 42,
      },
      approvals: ["review release guard"],
      events: [{ type: "state.updated" }],
    },
    interactionContext: {
      projectId: "project-7",
      currentSurface: "workspace",
      currentTask: "fix critical blocker",
      urgency: "high",
      visible: true,
    },
  });

  assert.equal(contextRelevanceSchema.schemaId, "context-relevance:project-7");
  assert.deepEqual(contextRelevanceSchema.dimensions, ["relevance", "priority", "freshness", "tokenWeight"]);
  assert.equal(contextRelevanceSchema.contextEntries.length, 2);
  assert.equal(typeof contextRelevanceSchema.contextEntries[0].relevanceScore, "number");
  assert.equal(typeof contextRelevanceSchema.contextEntries[0].tokenWeight, "number");
  assert.equal(contextRelevanceSchema.ordering[0].rank, 1);
  assert.equal(typeof contextRelevanceSchema.tokenBudgetGuidance.ai.targetShare, "number");
  assert.equal(contextRelevanceSchema.summary.prefersAggressiveSlimming, true);
  assert.equal(contextRelevanceSchema.summary.isReadyForAiReviewExecution, true);
});

test("context relevance schema falls back safely without explicit inputs", () => {
  const { contextRelevanceSchema } = defineContextRelevanceSchema();

  assert.equal(contextRelevanceSchema.schemaId, "context-relevance:project");
  assert.equal(Array.isArray(contextRelevanceSchema.contextEntries), true);
  assert.equal(contextRelevanceSchema.contextEntries.length, 2);
  assert.equal(typeof contextRelevanceSchema.summary.totalEntries, "number");
  assert.equal(typeof contextRelevanceSchema.summary.highestPriorityScore, "number");
});
