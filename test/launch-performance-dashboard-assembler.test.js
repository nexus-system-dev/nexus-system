import test from "node:test";
import assert from "node:assert/strict";
import { createLaunchPerformanceDashboardAssembler } from "../src/core/launch-performance-dashboard-assembler.js";

test("launch performance dashboard assembler returns ready dashboard", () => {
  const { launchPerformanceDashboard } = createLaunchPerformanceDashboardAssembler({
    websiteActivationFunnel: { websiteActivationFunnelId: "funnel-1", status: "ready" },
    launchFeedbackSummary: { status: "ready" },
    revenueSummary: { status: "ready" },
  });
  assert.equal(launchPerformanceDashboard.status, "ready");
  assert.equal(launchPerformanceDashboard.summaryCards.length, 3);
});
