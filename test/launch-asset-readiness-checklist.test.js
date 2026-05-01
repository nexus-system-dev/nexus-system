import test from "node:test";
import assert from "node:assert/strict";
import { createLaunchAssetReadinessChecklist } from "../src/core/launch-asset-readiness-checklist.js";
test("launch asset readiness checklist combines rollout and proof readiness", () => {
  const { launchReadinessChecklist } = createLaunchAssetReadinessChecklist({ launchRolloutPlan: { launchRolloutPlanId: "rollout-1", status: "ready", channels: [{}] }, productProofPlan: { status: "ready", assets: [{}] } });
  assert.equal(launchReadinessChecklist.status, "ready");
  assert.equal(launchReadinessChecklist.items.length, 2);
});
