import test from "node:test";
import assert from "node:assert/strict";

import { createCrossProjectPatternDisclosurePanel } from "../src/core/cross-project-pattern-disclosure-panel.js";

test("cross-project pattern disclosure panel returns anonymized patterns and hints", () => {
  const { crossProjectPatternPanel } = createCrossProjectPatternDisclosurePanel({
    crossProjectMemory: {
      registryId: "registry-1",
      patterns: [
        {
          patternId: "pattern-1",
          label: "Approval-first rollout copy",
          summary: "Projects converge faster when approval language is explicit.",
          confidenceBand: "high",
          evidenceCount: 4,
        },
      ],
    },
    recommendationHints: [
      {
        hintId: "hint-1",
        label: "Use explicit approval language",
        explanation: "This matches the strongest anonymized pattern in similar release flows.",
      },
    ],
  });

  assert.equal(crossProjectPatternPanel.panelId, "cross-project-pattern-panel:registry-1");
  assert.equal(crossProjectPatternPanel.patterns.length, 1);
  assert.equal(crossProjectPatternPanel.recommendationHints.length, 1);
  assert.equal(crossProjectPatternPanel.disclosure.containsUserData, false);
  assert.equal(crossProjectPatternPanel.summary.safeToDisplay, true);
});

test("cross-project pattern disclosure panel falls back safely when memory is missing", () => {
  const { crossProjectPatternPanel } = createCrossProjectPatternDisclosurePanel();

  assert.equal(Array.isArray(crossProjectPatternPanel.patterns), true);
  assert.equal(Array.isArray(crossProjectPatternPanel.recommendationHints), true);
  assert.equal(crossProjectPatternPanel.summary.totalPatterns, 0);
  assert.equal(crossProjectPatternPanel.disclosure.containsProjectIdentifiers, false);
});

test("cross-project pattern disclosure panel normalizes malformed identifiers and payloads", () => {
  const { crossProjectPatternPanel } = createCrossProjectPatternDisclosurePanel({
    crossProjectMemory: {
      registryId: {},
      patterns: [
        {
          patternId: {},
          label: " Explicit approval ",
          reason: " safer ",
          confidenceBand: "high",
          evidenceCount: -3,
        },
      ],
    },
    recommendationHints: [
      {
        hintId: {},
        title: " Use explicit approval language ",
        reason: " strongest pattern ",
      },
    ],
  });

  assert.equal(crossProjectPatternPanel.panelId, "cross-project-pattern-panel:nexus");
  assert.equal(crossProjectPatternPanel.patterns[0].patternId, "cross-project-pattern-1");
  assert.equal(crossProjectPatternPanel.patterns[0].label, "Explicit approval");
  assert.equal(crossProjectPatternPanel.patterns[0].summary, "safer");
  assert.equal(crossProjectPatternPanel.patterns[0].evidenceCount, 0);
  assert.equal(crossProjectPatternPanel.recommendationHints[0].hintId, "cross-project-hint-1");
  assert.equal(crossProjectPatternPanel.recommendationHints[0].label, "Use explicit approval language");
});
