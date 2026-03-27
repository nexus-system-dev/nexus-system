import test from "node:test";
import assert from "node:assert/strict";

import { createCompanionMessagePriorityResolver } from "../src/core/companion-message-priority-resolver.js";

test("companion message priority resolver marks failures as critical", () => {
  const { companionMessagePriority } = createCompanionMessagePriorityResolver({
    learningInsights: {
      items: [{ id: "insight-1", title: "Safer rollout wording performs better" }],
    },
    gatingDecision: {
      isBlocked: true,
    },
    notificationPayload: {
      type: "failure",
      message: "Execution failed and needs immediate attention.",
      taskId: "task-1",
      requiresApproval: true,
    },
  });

  assert.equal(companionMessagePriority.priority, "critical");
  assert.equal(companionMessagePriority.summary.notificationType, "failure");
});

test("companion message priority resolver returns recommendation when learning signals exist without blockers", () => {
  const { companionMessagePriority } = createCompanionMessagePriorityResolver({
    learningInsights: {
      summary: "A reliable pattern is available.",
      items: [{ id: "insight-1", title: "Approval-first copy converts better" }],
    },
    gatingDecision: {
      isBlocked: false,
    },
    notificationPayload: {
      type: "success",
      taskId: "task-2",
      requiresApproval: false,
    },
  });

  assert.equal(companionMessagePriority.priority, "recommendation");
  assert.equal(companionMessagePriority.summary.insightCount, 1);
});
