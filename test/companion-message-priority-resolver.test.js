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

test("companion message priority resolver returns warning when execution is blocked", () => {
  const { companionMessagePriority } = createCompanionMessagePriorityResolver({
    learningInsights: {
      summary: "A reliable pattern is available.",
      items: [{ id: "insight-1", title: "Approval-first copy converts better" }],
    },
    gatingDecision: {
      isBlocked: true,
    },
    notificationPayload: {
      type: "success",
      taskId: "task-3",
      requiresApproval: false,
    },
  });

  assert.equal(companionMessagePriority.priority, "warning");
  assert.equal(companionMessagePriority.summary.blocked, true);
});

test("companion message priority resolver returns advisory when no blockers or learning signals exist", () => {
  const { companionMessagePriority } = createCompanionMessagePriorityResolver({
    learningInsights: {
      summary: "Baseline learning insights are waiting for more task outcomes and approval signals.",
      items: [],
    },
    gatingDecision: {
      isBlocked: false,
    },
    notificationPayload: {
      type: "success",
      taskId: "task-4",
      requiresApproval: false,
    },
  });

  assert.equal(companionMessagePriority.priority, "advisory");
  assert.equal(companionMessagePriority.summary.insightCount, 0);
  assert.equal(companionMessagePriority.summary.requiresApproval, false);
});

test("companion message priority resolver normalizes malformed identifiers and reasoning strings", () => {
  const { companionMessagePriority } = createCompanionMessagePriorityResolver({
    learningInsights: {
      summary: "   Useful pattern detected   ",
      items: [{ id: "insight-1" }],
    },
    gatingDecision: {
      isBlocked: false,
    },
    notificationPayload: {
      type: "  FAILURE ",
      message: "   Immediate attention needed   ",
      taskId: "   ",
      requiresApproval: false,
    },
  });

  assert.equal(companionMessagePriority.priorityId, "companion-message-priority:project");
  assert.equal(companionMessagePriority.priority, "critical");
  assert.equal(companionMessagePriority.reasons[0], "Immediate attention needed");
  assert.equal(companionMessagePriority.summary.notificationType, "failure");
});
