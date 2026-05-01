function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeCount(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0;
}

function resolveStatus(activityType, previousStatus) {
  const normalizedActivityType = normalizeString(activityType);
  if (normalizedActivityType === "session-active") {
    return "active";
  }

  if (normalizedActivityType === "session-idle") {
    return "idle";
  }

  return normalizeString(previousStatus) ?? "idle";
}

function resolveTotalSessions(event, previousMetric) {
  const previousUserId = normalizeString(previousMetric?.userId);
  const previousSessionId = normalizeString(previousMetric?.sessionId);
  const currentUserId = normalizeString(event?.userId);
  const currentSessionId = normalizeString(event?.sessionId);
  const previousTotal = normalizeCount(previousMetric?.totalSessions);

  const hasTrackableSession = Boolean(currentUserId && currentSessionId);
  if (!hasTrackableSession) {
    return previousTotal;
  }

  if (!previousUserId || previousUserId !== currentUserId) {
    return 1;
  }

  if (!previousSessionId || previousSessionId !== currentSessionId) {
    return previousTotal + 1;
  }

  return previousTotal === 0 ? 1 : previousTotal;
}

function resolveIsReturningUser(event, previousMetric) {
  const previousUserId = normalizeString(previousMetric?.userId);
  const previousSessionId = normalizeString(previousMetric?.sessionId);
  const currentUserId = normalizeString(event?.userId);
  const currentSessionId = normalizeString(event?.sessionId);

  return Boolean(
    previousUserId
    && currentUserId
    && previousUserId === currentUserId
    && previousSessionId
    && currentSessionId
    && previousSessionId !== currentSessionId
  );
}

function resolveActiveUsers(event, previousMetric) {
  const previousActiveUsers = normalizeArray(previousMetric?.activeUsers).map((item) => normalizeObject(item));
  if (previousActiveUsers.length > 0) {
    return previousActiveUsers;
  }

  const userId = normalizeString(event?.userId);
  const sessionId = normalizeString(event?.sessionId);
  const status = resolveStatus(event?.activityType, null);

  if (!userId && !sessionId) {
    return [];
  }

  return [{
    userId,
    sessionId,
    status,
    workspaceArea: normalizeString(event?.workspaceArea),
    currentSurface: normalizeString(event?.currentSurface),
    currentTask: normalizeString(event?.currentTask),
    lastSeenAt: normalizeString(event?.timestamp),
  }];
}

function resolveActiveSessionCount(activeUsers, status) {
  if (activeUsers.length > 0) {
    return activeUsers.filter((item) => normalizeString(item?.status) === "active").length;
  }

  return status === "active" ? 1 : 0;
}

export function createSessionActivityTracker({
  userActivityEvent = null,
  previousUserSessionMetric = null,
} = {}) {
  const normalizedEvent = normalizeObject(userActivityEvent);
  const previousMetric = normalizeObject(previousUserSessionMetric);
  const activeUsers = resolveActiveUsers(normalizedEvent, previousMetric);
  const status = resolveStatus(normalizedEvent.activityType, previousMetric.status);

  return {
    userSessionMetric: {
      userId: normalizeString(normalizedEvent.userId) ?? normalizeString(previousMetric.userId),
      sessionId: normalizeString(normalizedEvent.sessionId) ?? normalizeString(previousMetric.sessionId),
      status,
      workspaceId: normalizeString(normalizedEvent.workspaceId) ?? normalizeString(previousMetric.workspaceId),
      projectId: normalizeString(normalizedEvent.projectId) ?? normalizeString(previousMetric.projectId),
      workspaceArea: normalizeString(normalizedEvent.workspaceArea) ?? normalizeString(previousMetric.workspaceArea),
      currentSurface: normalizeString(normalizedEvent.currentSurface) ?? normalizeString(previousMetric.currentSurface),
      currentTask: normalizeString(normalizedEvent.currentTask) ?? normalizeString(previousMetric.currentTask),
      lastSeenAt: normalizeString(normalizedEvent.timestamp) ?? normalizeString(previousMetric.lastSeenAt),
      totalSessions: resolveTotalSessions(normalizedEvent, previousMetric),
      isReturningUser: resolveIsReturningUser(normalizedEvent, previousMetric),
      activeSessionCount: resolveActiveSessionCount(activeUsers, status),
      activeUsers,
    },
  };
}
