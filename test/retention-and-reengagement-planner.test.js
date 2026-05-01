import { test } from "node:test";
import assert from "node:assert/strict";
import { createRetentionAndReengagementPlanner } from "../src/core/retention-and-reengagement-planner.js";

test("createRetentionAndReengagementPlanner returns valid plan for empty input", () => {
  const { retentionLifecyclePlan } = createRetentionAndReengagementPlanner({});
  assert.ok(retentionLifecyclePlan.planId);
  assert.ok(typeof retentionLifecyclePlan.planStatus === "string");
  assert.ok(retentionLifecyclePlan.cohortSegment);
  assert.equal(Array.isArray(retentionLifecyclePlan.reactivationTactics), true);
});

test("createRetentionAndReengagementPlanner computes retention rate from summary", () => {
  const { retentionLifecyclePlan } = createRetentionAndReengagementPlanner({
    retentionSummary: { totalReturningUsers: 60, totalNonReturningUsers: 40 },
  });
  assert.equal(retentionLifecyclePlan.cohortSegment.retentionRate, 60);
  assert.equal(retentionLifecyclePlan.planStatus, "healthy");
});

test("createRetentionAndReengagementPlanner sets needs-intervention when retention is low", () => {
  const { retentionLifecyclePlan } = createRetentionAndReengagementPlanner({
    retentionSummary: { totalReturningUsers: 10, totalNonReturningUsers: 90 },
  });
  assert.equal(retentionLifecyclePlan.planStatus, "needs-intervention");
});

test("createRetentionAndReengagementPlanner builds high-priority tactics for high drop-off", () => {
  const { retentionLifecyclePlan } = createRetentionAndReengagementPlanner({
    activationDropOffs: [
      { milestone: "onboarding-step-1", dropRate: 0.7 },
      { milestone: "first-project", dropRate: 0.1 },
    ],
  });
  assert.equal(retentionLifecyclePlan.reactivationTactics.length, 2);
  assert.equal(retentionLifecyclePlan.reactivationTactics[0].priority, "high");
  assert.equal(retentionLifecyclePlan.meta.highPriorityTacticCount, 1);
});
