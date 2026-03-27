import test from "node:test";
import assert from "node:assert/strict";

import { createRecommendationReasoningPanelContract } from "../src/core/recommendation-reasoning-panel-contract.js";

test("recommendation reasoning panel contract returns impact learning and policy reasoning", () => {
  const { reasoningPanel } = createRecommendationReasoningPanelContract({
    impactSummary: {
      totalChanges: 4,
      codeImpact: "present",
      infraImpact: "present",
      migrationImpact: "none",
      affectedCodePaths: ["src/auth.ts"],
      affectedInfraAreas: ["deployment"],
      requiresApproval: true,
      hasUncertainty: false,
    },
    learningTrace: {
      recommendationReasoning: "The system keeps preferring explicit rollout steps because they reduce retries.",
      traceSteps: [
        {
          stepId: "learning-1",
          title: "Pattern matched",
          reasoning: "Two similar release flows converged faster with explicit rollout order.",
          source: "release-memory",
        },
      ],
    },
    policyTrace: {
      actionType: "deploy",
      finalDecision: "blocked",
      requiresApproval: true,
      blockingSources: ["deploy"],
      traceSteps: [
        {
          step: "policy-decision",
          decision: "requires-approval",
          reason: "Production deploy needs approval",
        },
      ],
    },
  });

  assert.equal(reasoningPanel.panelId, "reasoning-panel:deploy");
  assert.equal(reasoningPanel.policy.requiresApproval, true);
  assert.equal(reasoningPanel.impact.signals.includes("code-impact"), true);
  assert.equal(reasoningPanel.learning.reasons[0].source, "release-memory");
  assert.equal(reasoningPanel.summary.hasPolicyReasons, true);
});

test("recommendation reasoning panel contract falls back safely with partial inputs", () => {
  const { reasoningPanel } = createRecommendationReasoningPanelContract();

  assert.equal(typeof reasoningPanel.headline, "string");
  assert.equal(Array.isArray(reasoningPanel.impact.signals), true);
  assert.equal(Array.isArray(reasoningPanel.learning.reasons), true);
  assert.equal(Array.isArray(reasoningPanel.policy.reasons), true);
  assert.equal(reasoningPanel.summary.hasImpactSignals, false);
});
