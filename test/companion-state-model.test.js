import test from "node:test";
import assert from "node:assert/strict";

import { createCompanionStateModel } from "../src/core/companion-state-model.js";

test("companion state model enters warning mode when approval or failure needs attention", () => {
  const { companionState } = createCompanionStateModel({
    learningInsights: {
      items: [{ id: "insight-1", title: "Safer rollout wording performs better" }],
    },
    decisionIntelligence: {
      summary: {
        requiresApproval: true,
        hasUncertainty: false,
        canAutoExecute: false,
      },
    },
    notificationPayload: {
      type: "failure",
      message: "Approval is still required before continuing",
      taskId: "task-1",
    },
  });

  assert.equal(companionState.state, "warning");
  assert.equal(companionState.summary.requiresAttention, true);
  assert.equal(companionState.sourceSignals.requiresApproval, true);
});

test("companion state model recommends when learning signals are available without blockers", () => {
  const { companionState } = createCompanionStateModel({
    learningInsights: {
      summary: "The system found a reliable pattern worth surfacing.",
      items: [{ id: "insight-1", title: "Users respond faster to explicit approvals" }],
    },
    decisionIntelligence: {
      summary: {
        requiresApproval: false,
        hasUncertainty: false,
        canAutoExecute: true,
      },
    },
    notificationPayload: {
      type: "success",
      taskId: "task-2",
    },
  });

  assert.equal(companionState.state, "recommending");
  assert.equal(companionState.summary.hasRecommendations, true);
  assert.equal(Array.isArray(companionState.reasons), true);
});
