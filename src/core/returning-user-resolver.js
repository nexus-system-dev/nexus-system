const RETURNING_USER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function parseTimestamp(value) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }

  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveReturningUser(currentMetric, previousMetric) {
  const currentUserId = normalizeString(currentMetric.userId);
  const previousUserId = normalizeString(previousMetric.userId);
  const currentSessionId = normalizeString(currentMetric.sessionId);
  const previousSessionId = normalizeString(previousMetric.sessionId);
  const currentLastSeenAt = parseTimestamp(currentMetric.lastSeenAt);
  const previousLastSeenAt = parseTimestamp(previousMetric.lastSeenAt);

  if (!currentUserId || !previousUserId || currentUserId !== previousUserId) {
    return false;
  }

  if (!currentSessionId || !previousSessionId || currentSessionId === previousSessionId) {
    return false;
  }

  if (currentLastSeenAt === null || previousLastSeenAt === null) {
    return false;
  }

  return currentLastSeenAt - previousLastSeenAt >= RETURNING_USER_WINDOW_MS;
}

export function createReturningUserResolver({
  userSessionMetric = null,
  previousUserSessionMetric = null,
} = {}) {
  const currentMetric = normalizeObject(userSessionMetric);
  const previousMetric = normalizeObject(previousUserSessionMetric);
  const currentUserId = normalizeString(currentMetric.userId);
  const currentSessionId = normalizeString(currentMetric.sessionId);
  const currentLastSeenAt = normalizeString(currentMetric.lastSeenAt);

  return {
    returningUserMetric: {
      returningUserMetricId: `returning-user:${currentUserId ?? "anonymous"}:${currentSessionId ?? "no-session"}:${currentLastSeenAt ?? "no-last-seen"}`,
      userId: currentUserId,
      sessionId: currentSessionId,
      previousSessionId: normalizeString(previousMetric.sessionId),
      currentLastSeenAt,
      previousLastSeenAt: normalizeString(previousMetric.lastSeenAt),
      isReturningUser: resolveReturningUser(currentMetric, previousMetric),
    },
  };
}
