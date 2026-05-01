function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function buildOrderedDayEntries(byDay = {}) {
  return Object.entries(normalizeObject(byDay))
    .map(([day, metrics]) => {
      const normalizedMetrics = normalizeObject(metrics);
      const returning = normalizeFiniteNumber(normalizedMetrics.totalReturningUsers);
      const nonReturning = normalizeFiniteNumber(normalizedMetrics.totalNonReturningUsers);
      const totalSessions = returning + nonReturning;
      return {
        day,
        totalSessions,
        returningUsers: returning,
        nonReturningUsers: nonReturning,
        repeatUsageCount: normalizeFiniteNumber(normalizedMetrics.repeatUsageCount),
        retentionRate: totalSessions > 0 ? Math.round((returning / totalSessions) * 100) : 0,
      };
    })
    .sort((left, right) => left.day.localeCompare(right.day));
}

function buildTrend(dayEntries = []) {
  if (dayEntries.length < 2) {
    return "stable";
  }

  const firstRate = normalizeFiniteNumber(dayEntries[0]?.retentionRate);
  const lastRate = normalizeFiniteNumber(dayEntries[dayEntries.length - 1]?.retentionRate);
  if (lastRate > firstRate) {
    return "improving";
  }
  if (lastRate < firstRate) {
    return "declining";
  }
  return "stable";
}

function buildUserCurves(byUser = {}) {
  return Object.entries(normalizeObject(byUser))
    .map(([userId, metrics]) => {
      const normalizedMetrics = normalizeObject(metrics);
      const totalSessions = normalizeFiniteNumber(normalizedMetrics.totalSessions);
      const returningSessions = normalizeFiniteNumber(normalizedMetrics.returningSessions);
      return {
        userId,
        totalSessions,
        returningSessions,
        nonReturningSessions: normalizeFiniteNumber(normalizedMetrics.nonReturningSessions),
        repeatUsageCount: normalizeFiniteNumber(normalizedMetrics.repeatUsageCount),
        retentionRate: totalSessions > 0 ? Math.round((returningSessions / totalSessions) * 100) : 0,
        latestTimestamp: normalizeString(normalizedMetrics.latestTimestamp),
      };
    })
    .sort((left, right) => right.retentionRate - left.retentionRate || right.totalSessions - left.totalSessions);
}

export function createRetentionCurveAnalyzer({
  projectId = null,
  retentionSummary = null,
} = {}) {
  const summary = normalizeObject(retentionSummary);
  const dayEntries = buildOrderedDayEntries(summary.byDay);
  const userCurves = buildUserCurves(summary.byUser);
  const bestDay = dayEntries.reduce((best, entry) => (!best || entry.retentionRate > best.retentionRate ? entry : best), null);
  const worstDay = dayEntries.reduce((worst, entry) => (!worst || entry.retentionRate < worst.retentionRate ? entry : worst), null);

  return {
    retentionCurveAnalysis: {
      retentionCurveAnalysisId: `retention-curve:${normalizeString(projectId) ?? "unknown-project"}`,
      status: normalizeString(summary.status) === "ready" ? "ready" : "missing-inputs",
      dayCurve: dayEntries,
      userCurves,
      trend: buildTrend(dayEntries),
      summary: {
        totalCurvePoints: dayEntries.length,
        totalUsersTracked: userCurves.length,
        bestDay: bestDay?.day ?? null,
        worstDay: worstDay?.day ?? null,
      },
    },
  };
}
