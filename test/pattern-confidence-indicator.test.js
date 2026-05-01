import test from "node:test";
import assert from "node:assert/strict";

import { createPatternConfidenceIndicator } from "../src/core/pattern-confidence-indicator.js";

test("pattern confidence indicator returns user-facing pattern confidence states", () => {
  const { confidenceIndicator } = createPatternConfidenceIndicator({
    learningInsightViewModel: {
      viewModelId: "learning-insight-view:giftwallet",
      patterns: [
        {
          patternId: "pattern:insight-1",
          label: "Approval-first communication",
          confidenceBand: "high",
          confidenceScore: 0.84,
        },
        {
          patternId: "pattern:insight-2",
          label: "Fallback retry order",
          confidenceBand: "low",
          confidenceScore: 0.33,
        },
      ],
      insights: [
        {
          pattern: "Approval-first communication",
          recommendationReasoning: "Past approval flows converged faster with explicit language.",
        },
        {
          pattern: "Fallback retry order",
          recommendationReasoning: "This signal exists, but it still needs more examples.",
        },
      ],
    },
  });

  assert.equal(confidenceIndicator.summary.totalPatterns, 2);
  assert.equal(confidenceIndicator.summary.highConfidencePatterns, 1);
  assert.equal(confidenceIndicator.summary.hasTentativePatterns, true);
  assert.equal(confidenceIndicator.indicators[0].confidenceLabel, "Well established");
  assert.equal(confidenceIndicator.indicators[1].tone, "tentative");
});

test("pattern confidence indicator falls back safely when no learning view model exists", () => {
  const { confidenceIndicator } = createPatternConfidenceIndicator();

  assert.equal(Array.isArray(confidenceIndicator.indicators), true);
  assert.equal(confidenceIndicator.indicators.length, 0);
  assert.equal(confidenceIndicator.summary.totalPatterns, 0);
  assert.equal(confidenceIndicator.summary.hasTentativePatterns, false);
});

test("pattern confidence indicator normalizes malformed identifiers and confidence payloads", () => {
  const { confidenceIndicator } = createPatternConfidenceIndicator({
    learningInsightViewModel: {
      viewModelId: { bad: true },
      patterns: [
        {
          patternId: {},
          label: " Approval-first communication ",
          confidenceBand: "high",
          confidenceScore: 2,
        },
      ],
      insights: [
        {
          pattern: "Approval-first communication",
          recommendationReasoning: " because ",
        },
      ],
    },
  });

  assert.equal(confidenceIndicator.indicatorCollectionId, "pattern-confidence:nexus");
  assert.equal(confidenceIndicator.indicators[0].indicatorId, "confidence-indicator:1");
  assert.equal(confidenceIndicator.indicators[0].label, "Approval-first communication");
  assert.equal(confidenceIndicator.indicators[0].confidenceScore, 1);
  assert.equal(confidenceIndicator.indicators[0].reasoning, "because");
});
