function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function resolveActivityType(activityType, sessionMetric, sessionState) {
  const normalizedActivityType = normalizeString(activityType);
  if (normalizedActivityType) {
    return normalizedActivityType;
  }

  const status = normalizeString(sessionMetric?.status) ?? normalizeString(sessionState?.status);
  if (status === "active") {
    return "session-active";
  }

  return "session-idle";
}

function resolveTimestamp(timestamp, sessionMetric, sessionState) {
  return (
    normalizeString(timestamp)
    ?? normalizeString(sessionMetric?.lastSeenAt)
    ?? normalizeString(sessionState?.issuedAt)
    ?? new Date().toISOString()
  );
}

export function defineUserActivityEventSchema({
  userId = null,
  sessionId = null,
  activityType = null,
  projectId = null,
  workspaceId = null,
  workspaceArea = null,
  currentSurface = null,
  currentTask = null,
  timestamp = null,
  sessionMetric = null,
  sessionState = null,
} = {}) {
  const normalizedSessionMetric = normalizeObject(sessionMetric);
  const normalizedSessionState = normalizeObject(sessionState);
  const normalizedUserId =
    normalizeString(userId)
    ?? normalizeString(normalizedSessionMetric.userId)
    ?? normalizeString(normalizedSessionState.userId);
  const normalizedSessionId =
    normalizeString(sessionId)
    ?? normalizeString(normalizedSessionMetric.sessionId)
    ?? normalizeString(normalizedSessionState.sessionId);
  const normalizedTimestamp = resolveTimestamp(timestamp, normalizedSessionMetric, normalizedSessionState);
  const resolvedActivityType = resolveActivityType(activityType, normalizedSessionMetric, normalizedSessionState);

  return {
    userActivityEvent: {
      userActivityEventId: `user-activity:${normalizedUserId ?? "anonymous"}:${normalizedSessionId ?? "no-session"}:${normalizedTimestamp}`,
      userId: normalizedUserId,
      sessionId: normalizedSessionId,
      activityType: resolvedActivityType,
      projectId: normalizeString(projectId) ?? normalizeString(normalizedSessionMetric.projectId),
      workspaceId: normalizeString(workspaceId) ?? normalizeString(normalizedSessionMetric.workspaceId),
      workspaceArea: normalizeString(workspaceArea) ?? normalizeString(normalizedSessionMetric.workspaceArea),
      currentSurface: normalizeString(currentSurface) ?? normalizeString(normalizedSessionMetric.currentSurface),
      currentTask: normalizeString(currentTask) ?? normalizeString(normalizedSessionMetric.currentTask),
      timestamp: normalizedTimestamp,
    },
  };
}
