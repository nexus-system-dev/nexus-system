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

function buildTimeSavedEntries(timeSaved) {
  const normalizedTimeSaved = normalizeObject(timeSaved);
  return normalizeArray(normalizedTimeSaved.entries).map((entry) => normalizeObject(entry));
}

function buildHumanUserBucket(humanUserProductivity = null) {
  const normalized = normalizeObject(humanUserProductivity);
  const byHumanUser = normalizeObject(normalized.byHumanUser);
  return Object.fromEntries(
    Object.entries(byHumanUser).filter(([, value]) => normalizeFiniteNumber(value) !== null),
  );
}

function sumTimeSaved(entries) {
  return entries.reduce((sum, entry) => {
    const timeSavedMs = normalizeFiniteNumber(entry?.timeSavedMs);
    return timeSavedMs === null ? sum : sum + timeSavedMs;
  }, 0);
}

function buildTimeSavedBucket(entries, keyResolver) {
  const bucket = {};

  for (const entry of entries) {
    const key = keyResolver(entry);
    const timeSavedMs = normalizeFiniteNumber(entry?.timeSavedMs);
    if (!key || timeSavedMs === null) {
      continue;
    }

    bucket[key] = (bucket[key] ?? 0) + timeSavedMs;
  }

  return bucket;
}

function resolveDayKey(entry) {
  const recordedAt = normalizeString(entry?.recordedAt);
  if (!recordedAt) {
    return null;
  }

  const parsed = Date.parse(recordedAt);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return new Date(parsed).toISOString().slice(0, 10);
}

export function createProductivitySummaryAggregator({
  timeSaved = null,
  humanUserProductivity = null,
} = {}) {
  const entries = buildTimeSavedEntries(timeSaved);
  const humanUserBucket = buildHumanUserBucket(humanUserProductivity);
  const useHumanUserAggregation =
    normalizeString(humanUserProductivity?.status) === "ready"
    && Object.keys(humanUserBucket).length > 0;

  return {
    productivitySummary: {
      totalTimeSavedMs: sumTimeSaved(entries),
      byProject: buildTimeSavedBucket(entries, (entry) => normalizeString(entry?.projectId)),
      byUser: useHumanUserAggregation
        ? humanUserBucket
        : buildTimeSavedBucket(entries, (entry) => normalizeString(entry?.agentId)),
      byDay: buildTimeSavedBucket(entries, resolveDayKey),
    },
  };
}
