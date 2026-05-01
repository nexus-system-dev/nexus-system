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

export function createRetentionMetricsAggregator({
  returningUserMetric = null,
  returningUserMetrics = null,
} = {}) {
  const entries = buildReturningUserEntries({
    returningUserMetric,
    returningUserMetrics,
  });

  return {
    retentionSummary: {
      totalReturningUsers: entries.filter((entry) => entry.isReturningUser === true).length,
      totalNonReturningUsers: entries.filter((entry) => entry.isReturningUser !== true).length,
      repeatUsageCount: entries.filter((entry) => isRepeatUsage(entry)).length,
      byDay: buildDayBucket(entries),
    },
  };
}
