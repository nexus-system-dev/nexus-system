function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createDashboardHomeSurfaceModel({
  authenticatedAppShell = null,
  navigationRouteSurface = null,
  progressState = null,
  ownerDecisionDashboard = null,
  ownerPriorityQueue = null,
} = {}) {
  const shell = normalizeObject(authenticatedAppShell);
  const navigation = normalizeObject(navigationRouteSurface);
  const progress = normalizeObject(progressState);
  const dashboard = normalizeObject(ownerDecisionDashboard);
  const priorityQueue = normalizeObject(ownerPriorityQueue);
  const priorityItems = normalizeArray(priorityQueue.items ?? priorityQueue.priorities);

  return {
    dashboardHomeSurface: {
      dashboardHomeSurfaceId: `dashboard-home:${shell.workspaceContext?.projectId ?? "anonymous"}`,
      status: shell.status === "ready" ? "ready" : "blocked",
      headline:
        dashboard.summary?.headline
        ?? progress.summary?.headline
        ?? "Welcome back to Nexus",
      activeRoute: navigation.activeRoute?.routeKey ?? null,
      heroMetrics: [
        {
          metricId: "progress",
          label: "Progress",
          value: progress.progressPercent ?? 0,
        },
        {
          metricId: "priority-count",
          label: "Top priorities",
          value: priorityItems.length,
        },
      ],
      summaryCards: [
        {
          cardId: "progress-summary",
          title: "Project progress",
          body: progress.summary?.headline ?? progress.progressStatus ?? "No progress summary yet",
        },
        {
          cardId: "decision-summary",
          title: "Owner view",
          body: dashboard.summary?.headline ?? dashboard.summary?.nextDecision ?? "Owner dashboard is ready",
        },
      ],
      summary: {
        hasHeroMetrics: true,
        hasPrioritySnapshot: priorityItems.length > 0,
      },
    },
  };
}
