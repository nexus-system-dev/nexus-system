import test from "node:test";
import assert from "node:assert/strict";
import { createWebsiteToActivationFunnelAnalyzer } from "../src/core/website-to-activation-funnel-analyzer.js";
test("website to activation funnel analyzer combines acquisition and milestone data", () => {
  const { websiteActivationFunnel } = createWebsiteToActivationFunnelAnalyzer({ acquisitionSourceMetrics: { acquisitionSourceMetricsId: "source-1", status: "ready", entries: [{}] }, activationMilestones: { status: "ready", milestones: [{ milestone: "first-project" }] } });
  assert.equal(websiteActivationFunnel.status, "ready");
  assert.equal(websiteActivationFunnel.stages.length, 3);
});
