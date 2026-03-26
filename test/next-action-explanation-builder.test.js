import test from "node:test";
import assert from "node:assert/strict";

import { createNextActionExplanationBuilder } from "../src/core/next-action-explanation-builder.js";

test("next action explanation builder explains selected action and alternatives", () => {
  const { nextActionExplanation } = createNextActionExplanationBuilder({
    explanationSchema: {
      explanationTypes: [
        {
          explanationType: "why-this-task",
          summary: "Approval is blocking the current release path",
        },
      ],
    },
    activeBottleneck: {
      bottleneckId: "active-bottleneck:approval:1",
      blockerType: "approval-blocker",
      reason: "Production deploy needs approval",
    },
    schedulerDecision: {
      selectedAction: "open-approval-request",
      alternatives: ["wait-for-approval", "switch-to-safe-path"],
      source: "scheduler",
    },
  });

  assert.equal(nextActionExplanation.selectedAction, "open-approval-request");
  assert.equal(nextActionExplanation.reason, "צריך את האישור שלך לפני שאפשר להמשיך בבטחה.");
  assert.equal(nextActionExplanation.userFacingAction, "לפתוח בקשת אישור");
  assert.equal(nextActionExplanation.summary.alternativeCount, 2);
});

test("next action explanation builder falls back when scheduler is partial", () => {
  const { nextActionExplanation } = createNextActionExplanationBuilder({
    explanationSchema: {
      explanationTypes: [],
    },
    activeBottleneck: {
      bottleneckId: "active-bottleneck:task:2",
      blockerType: "failed-task",
      reason: "Last build failed",
      unblockConditions: ["retry-task"],
    },
  });

  assert.equal(nextActionExplanation.selectedAction, "retry-task");
  assert.equal(nextActionExplanation.summary.schedulerSource, "scheduler-partial");
  assert.equal(nextActionExplanation.alternatives.includes("retry-task"), true);
  assert.equal(nextActionExplanation.userFacingAction, "לנסות שוב את השלב האחרון");
});
