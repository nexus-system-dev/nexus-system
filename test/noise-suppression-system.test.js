import test from "node:test";
import assert from "node:assert/strict";
import { createNoiseSuppressionSystem } from "../src/core/noise-suppression-system.js";
test("noise suppression system emits owner alert feed", () => {
  const { ownerAlertFeed } = createNoiseSuppressionSystem({
    prioritizedOwnerAlerts: { prioritizedOwnerAlertsId: "alerts-1", status: "ready", alerts: [{ alertId: "a1" }] },
    ownerRoutinePlan: { status: "ready", checklist: ["review-health"] },
  });
  assert.equal(ownerAlertFeed.status, "ready");
  assert.equal(ownerAlertFeed.surfacedAlerts.length, 1);
});
