import test from "node:test";
import assert from "node:assert/strict";

import { createGrowthWorkspace } from "../src/core/growth-workspace.js";

test("growth workspace returns canonical strategy campaign and analytics state", () => {
  const { growthWorkspace } = createGrowthWorkspace({
    contentStrategy: {
      workspaceId: "growth-workspace:nexus",
      targetAudience: "product teams",
      gtmStage: "build",
      pillars: ["activation", "retention"],
      contentGoal: "Launch Nexus",
    },
    campaignPlan: {
      workspaceId: "growth-workspace:nexus",
      channels: [{ channel: "acquisition", status: "needs-definition" }],
      tasks: [{ id: "growth-acquisition-funnel", summary: "Define funnel" }],
      pendingApprovals: [{ approvalId: "approval-1" }],
    },
    growthAnalytics: {
      kpis: ["activation-rate", "retention-rate"],
      runtime: { activeUsers: 120 },
      productMetrics: { activationRate: 0.31 },
      hasBaselineCampaign: false,
    },
  });

  assert.equal(growthWorkspace.workspaceId, "growth-workspace:nexus");
  assert.equal(growthWorkspace.strategy.targetAudience, "product teams");
  assert.equal(growthWorkspace.campaigns.activeTaskCount, 1);
  assert.equal(growthWorkspace.analytics.hasBaselineCampaign, false);
  assert.equal(growthWorkspace.summary.totalKpis, 2);
});

test("growth workspace falls back to canonical empty state", () => {
  const { growthWorkspace } = createGrowthWorkspace();

  assert.equal(growthWorkspace.workspaceId, "growth-workspace");
  assert.equal(Array.isArray(growthWorkspace.strategy.pillars), true);
  assert.equal(Array.isArray(growthWorkspace.campaigns.tasks), true);
  assert.equal(Array.isArray(growthWorkspace.analytics.kpis), true);
  assert.equal(growthWorkspace.summary.hasGrowthPlan, false);
});
