function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createTodayPrioritiesAndNextActionFeed({
  unifiedHomeDashboard = null,
  ownerPriorityQueue = null,
  ownerActionRecommendations = null,
  nextTaskPresentation = null,
} = {}) {
  const dashboard = normalizeObject(unifiedHomeDashboard);
  const priorityQueue = normalizeObject(ownerPriorityQueue);
  const recommendations = normalizeObject(ownerActionRecommendations);
  const nextTask = normalizeObject(nextTaskPresentation);
  const priorityItems = normalizeArray(priorityQueue.items ?? priorityQueue.priorities);
  const recommendationItems = normalizeArray(recommendations.recommendations ?? recommendations.actions);

  return {
    todayPrioritiesFeed: {
      todayPrioritiesFeedId: `today-priorities:${dashboard.unifiedHomeDashboardId ?? "anonymous"}`,
      status: dashboard.status === "ready" ? "ready" : "blocked",
      priorities: priorityItems.slice(0, 5),
      nextActions: [
        ...recommendationItems.slice(0, 4),
        ...(nextTask.taskId ? [{ actionId: nextTask.taskId, title: nextTask.headline ?? nextTask.summary ?? "Continue task" }] : []),
      ].slice(0, 5),
      summary: {
        priorityCount: priorityItems.length,
        nextActionCount: recommendationItems.length + (nextTask.taskId ? 1 : 0),
      },
    },
  };
}
