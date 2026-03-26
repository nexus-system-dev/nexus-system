import test from "node:test";
import assert from "node:assert/strict";

import { createActiveBottleneckResolver } from "../src/core/active-bottleneck-resolver.js";

test("active bottleneck resolver prefers approval blockers over graph blockers", () => {
  const { activeBottleneck } = createActiveBottleneckResolver({
    bottleneckState: {
      bottleneckId: "bottleneck:task-2",
      blockerType: "graph-blocker",
      severity: "medium",
      affectedFlow: "execution",
      owner: "system",
      reason: "Task is waiting on task-1",
      unblockConditions: ["complete-upstream-dependencies"],
    },
    approvalStatus: {
      status: "missing",
      reason: "Production deploy requires approval",
      approvalRecordId: null,
    },
    policyDecision: {
      decision: "allowed",
      isBlocked: false,
    },
  });

  assert.equal(activeBottleneck.blockerType, "approval-blocker");
  assert.equal(activeBottleneck.owner, "user");
  assert.equal(activeBottleneck.source, "approval-status");
});

test("active bottleneck resolver returns policy blocker when policy is blocked", () => {
  const { activeBottleneck } = createActiveBottleneckResolver({
    bottleneckState: {
      bottleneckId: "bottleneck:none",
      blockerType: "none",
      severity: "low",
      affectedFlow: "execution",
      owner: "system",
      reason: "No blocker",
      unblockConditions: [],
    },
    approvalStatus: {
      status: "approved",
    },
    policyDecision: {
      decision: "blocked",
      isBlocked: true,
      policyId: "execution-controlled-modes",
      reason: "Policy blocks this execution path",
    },
  });

  assert.equal(activeBottleneck.blockerType, "policy-blocker");
  assert.equal(activeBottleneck.source, "policy-decision");
  assert.equal(activeBottleneck.severity, "high");
});

test("active bottleneck resolver falls back to bottleneck state when no override exists", () => {
  const { activeBottleneck } = createActiveBottleneckResolver({
    bottleneckState: {
      bottleneckId: "bottleneck:task-9",
      blockerType: "failed-task",
      severity: "high",
      affectedFlow: "execution",
      owner: "dev-agent",
      reason: "Build failed",
      unblockConditions: ["retry-or-recover-task"],
    },
    approvalStatus: {
      status: "approved",
    },
    policyDecision: {
      decision: "allowed",
      isBlocked: false,
    },
  });

  assert.equal(activeBottleneck.blockerType, "failed-task");
  assert.equal(activeBottleneck.source, "bottleneck-state");
  assert.equal(activeBottleneck.summary.isBlocking, true);
});
