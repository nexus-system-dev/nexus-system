import test from "node:test";
import assert from "node:assert/strict";
import { createFeatureUsageTracker } from "../src/core/feature-usage-tracker.js";
test("feature usage tracker emits ready feature usage summary", () => {
  const { featureUsageSummary } = createFeatureUsageTracker({
    userActivityEvent: { eventId: "activity-1", status: "ready", currentSurface: "workspace" },
    analyticsSummary: { status: "ready" },
  });
  assert.equal(featureUsageSummary.status, "ready");
});
