import test from "node:test";
import assert from "node:assert/strict";

import { defineLearningInsightUiSchema } from "../src/core/learning-insight-ui-schema.js";

test("learning insight UI schema returns canonical insights, patterns and reasoning", () => {
  const { learningInsightViewModel } = defineLearningInsightUiSchema({
    learningInsights: {
      insightSetId: "giftwallet",
      summary: "Users approve safer release steps faster when the recommendation is explicit.",
      items: [
        {
          id: "insight-1",
          title: "Approval-first rollout copy works better",
          pattern: "Approval-first communication",
          confidenceScore: 0.84,
          recommendationReasoning: "The same pattern reduced hesitation in the last two release flows.",
          evidence: ["approval-flow-1", "approval-flow-2"],
        },
      ],
    },
    learningTrace: {
      recommendationReasoning: "The system keeps preferring explicit safety language because it converts better.",
      traceSteps: [
        {
          stepId: "trace-1",
          title: "Pattern matched",
          reasoning: "Past approval flows converged faster with explicit language.",
          source: "approval-memory",
        },
      ],
    },
  });

  assert.equal(learningInsightViewModel.viewModelId, "learning-insight-view:giftwallet");
  assert.equal(learningInsightViewModel.summary.totalInsights, 1);
  assert.equal(learningInsightViewModel.patterns[0].label, "Approval-first communication");
  assert.equal(learningInsightViewModel.confidence.band, "high");
  assert.equal(learningInsightViewModel.recommendationReasoning.traceSteps[0].source, "approval-memory");
});

test("learning insight UI schema falls back to safe defaults when learning data is missing", () => {
  const { learningInsightViewModel } = defineLearningInsightUiSchema();

  assert.equal(learningInsightViewModel.summary.totalInsights, 0);
  assert.equal(Array.isArray(learningInsightViewModel.insights), true);
  assert.equal(Array.isArray(learningInsightViewModel.patterns), true);
  assert.equal(learningInsightViewModel.confidence.band, "low");
  assert.equal(typeof learningInsightViewModel.recommendationReasoning.summary, "string");
});
