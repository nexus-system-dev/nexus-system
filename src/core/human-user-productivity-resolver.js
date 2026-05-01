function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function buildDayKey(value) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }

  const parsed = Date.parse(normalized);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return new Date(parsed).toISOString().slice(0, 10);
}

function addBucketValue(bucket, key, value) {
  if (!key || value === null) {
    return;
  }

  bucket[key] = (bucket[key] ?? 0) + value;
}

export function createHumanUserProductivityResolver({
  projectId = null,
  timeSaved = null,
  userAgentMapping = null,
} = {}) {
  const mappingByAgent = normalizeObject(userAgentMapping?.byAgent);
  const entries = normalizeArray(normalizeObject(timeSaved).entries);
  const byHumanUser = {};
  const byProject = {};
  const byDay = {};
  const agentBreakdown = {};
  let totalTimeSavedMs = 0;
  let resolvedEntries = 0;
  let unresolvedEntries = 0;

  for (const entry of entries) {
    const timeSavedMs = normalizeFiniteNumber(entry?.timeSavedMs);
    if (timeSavedMs === null) {
      continue;
    }

    totalTimeSavedMs += timeSavedMs;
    addBucketValue(byProject, normalizeString(entry?.projectId), timeSavedMs);
    addBucketValue(byDay, buildDayKey(entry?.recordedAt), timeSavedMs);

    const agentId = normalizeString(entry?.agentId);
    const agentMapping = agentId ? normalizeObject(mappingByAgent[agentId]) : {};
    const humanUserId = normalizeString(agentMapping.humanUserId);
    if (!humanUserId) {
      unresolvedEntries += 1;
      continue;
    }

    resolvedEntries += 1;
    addBucketValue(byHumanUser, humanUserId, timeSavedMs);
    agentBreakdown[humanUserId] = agentBreakdown[humanUserId] ?? {};
    addBucketValue(agentBreakdown[humanUserId], agentId, timeSavedMs);
  }

  return {
    humanUserProductivity: {
      humanUserProductivityId: `human-user-productivity:${normalizeString(projectId) ?? "unknown-project"}`,
      status: normalizeString(userAgentMapping?.status) === "ready" ? "ready" : "missing-inputs",
      totalTimeSavedMs,
      byHumanUser,
      byProject,
      byDay,
      agentBreakdown,
      summary: {
        totalResolvedEntries: resolvedEntries,
        totalUnresolvedEntries: unresolvedEntries,
        totalMappedUsers: Object.keys(byHumanUser).length,
      },
    },
  };
}
