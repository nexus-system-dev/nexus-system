function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function buildReturningUserEntries({ returningUserMetric = null, returningUserMetrics = null } = {}) {
  const listEntries = normalizeArray(returningUserMetrics).map((entry) => normalizeObject(entry));
  if (listEntries.length > 0) {
    return listEntries;
  }

  const singleEntry = normalizeObject(returningUserMetric);
  return Object.keys(singleEntry).length > 0 ? [singleEntry] : [];
}

function resolveDayKey(entry) {
  const timestamp = normalizeString(entry?.currentLastSeenAt) ?? normalizeString(entry?.previousLastSeenAt);
  if (!timestamp) {
    return null;
  }

  const parsed = Date.parse(timestamp);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return new Date(parsed).toISOString().slice(0, 10);
}

function isRepeatUsage(entry) {
  const currentSessionId = normalizeString(entry?.sessionId);
  const previousSessionId = normalizeString(entry?.previousSessionId);
  return Boolean(currentSessionId && previousSessionId && currentSessionId !== previousSessionId);
}

function buildSessionHistoryEntries(userSessionHistory = null) {
  return normalizeArray(normalizeObject(userSessionHistory).entries).map((entry) => normalizeObject(entry));
}

function buildDayBucket(entries) {
  const bucket = {};

  for (const entry of entries) {
    const dayKey = resolveDayKey(entry);
    if (!dayKey) {
      continue;
    }

    const current = bucket[dayKey] ?? {
      totalReturningUsers: 0,
      totalNonReturningUsers: 0,
      repeatUsageCount: 0,
    };

    if (entry.isReturningUser === true) {
      current.totalReturningUsers += 1;
    } else {
      current.totalNonReturningUsers += 1;
    }

    if (isRepeatUsage(entry)) {
      current.repeatUsageCount += 1;
    }

    bucket[dayKey] = current;
  }

  return bucket;
}

function buildUserBucket(entries) {
  const bucket = {};

  for (const entry of entries) {
    const userKey = normalizeString(entry?.userId, "anonymous");
    bucket[userKey] = bucket[userKey] ?? {
      totalSessions: 0,
      returningSessions: 0,
      nonReturningSessions: 0,
      repeatUsageCount: 0,
      latestTimestamp: null,
    };

    bucket[userKey].totalSessions += 1;
    if (entry.isReturningUser === true) {
      bucket[userKey].returningSessions += 1;
    } else {
      bucket[userKey].nonReturningSessions += 1;
    }
    if (isRepeatUsage(entry)) {
      bucket[userKey].repeatUsageCount += 1;
    }

    const timestamp = normalizeString(entry?.currentLastSeenAt)
      ?? normalizeString(entry?.lastSeenAt)
      ?? normalizeString(entry?.previousLastSeenAt);
    if (timestamp) {
      bucket[userKey].latestTimestamp = timestamp;
    }
  }

  return bucket;
}

export function createRetentionMetricsAggregator({
  projectId = null,
  userSessionHistory = null,
  returningUserMetric = null,
  returningUserMetrics = null,
} = {}) {
  const historyEntries = buildSessionHistoryEntries(userSessionHistory);
  const fallbackEntries = buildReturningUserEntries({
    returningUserMetric,
    returningUserMetrics,
  });
  const entries = historyEntries.length > 0 ? historyEntries : fallbackEntries;
  const totalReturningUsers = entries.filter((entry) => entry.isReturningUser === true).length;
  const totalNonReturningUsers = entries.filter((entry) => entry.isReturningUser !== true).length;
  const totalSessions = entries.length;
  const repeatUsageCount = entries.filter((entry) => isRepeatUsage(entry)).length;
  const retentionRate = totalSessions > 0 ? Math.round((totalReturningUsers / totalSessions) * 100) : 0;
  const normalizedHistory = normalizeObject(userSessionHistory);

  return {
    retentionSummary: {
      retentionMetricsId: `retention-metrics:${normalizeString(projectId) ?? "unknown-project"}`,
      status: entries.length > 0 ? "ready" : "missing-inputs",
      totalSessions,
      totalReturningUsers,
      totalNonReturningUsers,
      repeatUsageCount,
      retentionRate,
      byDay: buildDayBucket(entries),
      byUser: buildUserBucket(entries),
      source:
        historyEntries.length > 0
          ? normalizeString(normalizedHistory.userSessionHistoryId) ?? "user-session-history"
          : "returning-user-metrics",
    },
  };
}
