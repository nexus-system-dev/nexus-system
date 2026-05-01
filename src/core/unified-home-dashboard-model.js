function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createUnifiedHomeDashboardModel({
  dashboardHomeSurface = null,
  navigationRouteSurface = null,
  ownerPriorityQueue = null,
  ownerActionRecommendations = null,
  ownerDecisionDashboard = null,
} = {}) {
  const home = normalizeObject(dashboardHomeSurface);
  const navigation = normalizeObject(navigationRouteSurface);
  const priorityQueue = normalizeObject(ownerPriorityQueue);
  const recommendations = normalizeObject(ownerActionRecommendations);
  const decisionDashboard = normalizeObject(ownerDecisionDashboard);
  const priorityItems = normalizeArray(priorityQueue.items ?? priorityQueue.priorities);
  const recommendationItems = normalizeArray(recommendations.recommendations ?? recommendations.actions);

  return {
    unifiedHomeDashboard: {
      unifiedHomeDashboardId: `unified-home-dashboard:${navigation.handoffContext?.projectId ?? "anonymous"}`,
      status: home.status === "ready" ? "ready" : "blocked",
      headline: home.headline ?? "Nexus home",
      routeContext: {
        activeRouteKey: navigation.activeRoute?.routeKey ?? null,
        workspaceTabs: normalizeArray(navigation.workspaceTabs),
      },
      sections: {
        summaryCards: normalizeArray(home.summaryCards),
        priorityList: priorityItems.slice(0, 5),
        recommendations: recommendationItems.slice(0, 5),
        ownerDecisionSummary: decisionDashboard.summary ?? null,
      },
      wowSignals: {
        hasUnifiedProgressView: normalizeArray(home.heroMetrics).length > 0,
        hasPrioritiesToday: priorityItems.length > 0,
        hasNextActions: recommendationItems.length > 0,
      },
      summary: {
        canLandUserAfterLogin: home.status === "ready",
        hasUnifiedOwnerView: Boolean(decisionDashboard.summary),
      },
    },
  };
}
