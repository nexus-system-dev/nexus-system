function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createGrowthWorkspace({
  contentStrategy = null,
  campaignPlan = null,
  growthAnalytics = null,
} = {}) {
  const normalizedContentStrategy = normalizeObject(contentStrategy);
  const normalizedCampaignPlan = normalizeObject(campaignPlan);
  const normalizedGrowthAnalytics = normalizeObject(growthAnalytics);

  const pillars = normalizeArray(normalizedContentStrategy.pillars);
  const channels = normalizeArray(normalizedCampaignPlan.channels);
  const tasks = normalizeArray(normalizedCampaignPlan.tasks);
  const kpis = normalizeArray(normalizedGrowthAnalytics.kpis);

  return {
    growthWorkspace: {
      workspaceId:
        normalizedCampaignPlan.workspaceId
        ?? normalizedContentStrategy.workspaceId
        ?? "growth-workspace",
      strategy: {
        targetAudience: normalizedContentStrategy.targetAudience ?? null,
        gtmStage: normalizedContentStrategy.gtmStage ?? null,
        pillars,
        contentGoal: normalizedContentStrategy.contentGoal ?? null,
      },
      campaigns: {
        channels,
        tasks,
        activeTaskCount: tasks.length,
        pendingApprovals: normalizeArray(normalizedCampaignPlan.pendingApprovals),
      },
      analytics: {
        kpis,
        runtime: normalizedGrowthAnalytics.runtime ?? null,
        productMetrics: normalizedGrowthAnalytics.productMetrics ?? null,
        hasBaselineCampaign: normalizedGrowthAnalytics.hasBaselineCampaign ?? false,
      },
      summary: {
        totalPillars: pillars.length,
        totalChannels: channels.length,
        totalKpis: kpis.length,
        hasGrowthPlan: tasks.length > 0 || pillars.length > 0,
      },
    },
  };
}
