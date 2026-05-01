function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeTotalProjectsCreated(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

function normalizeProjectCreationEvent(event) {
  const normalized = normalizeObject(event);
  if (!normalized) {
    return null;
  }

  const projectCreationEventId = normalizeString(normalized.projectCreationEventId);
  const userId = normalizeString(normalized.userId);
  const projectId = normalizeString(normalized.projectId);
  const creationSource = normalizeString(normalized.creationSource);
  const timestamp = normalizeString(normalized.timestamp);

  if (!projectCreationEventId || !projectId || !creationSource || !timestamp) {
    return null;
  }

  return {
    projectCreationEventId,
    userId,
    projectId,
    creationSource,
    timestamp,
  };
}

function buildByDay(events) {
  const byDay = {};

  for (const event of events) {
    const parsed = Date.parse(event.timestamp);
    if (!Number.isFinite(parsed)) {
      continue;
    }

    const day = new Date(parsed).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  }

  return byDay;
}

function buildByUser(events) {
  const byUser = {};

  for (const event of events) {
    if (!event.userId) {
      continue;
    }

    byUser[event.userId] = (byUser[event.userId] ?? 0) + 1;
  }

  return byUser;
}

function buildByCreationSource(events) {
  const byCreationSource = {};

  for (const event of events) {
    byCreationSource[event.creationSource] = (byCreationSource[event.creationSource] ?? 0) + 1;
  }

  return byCreationSource;
}

export function createProjectCreationAggregationModule({
  projectCreationEvents = [],
  projectCreationMetric = null,
} = {}) {
  const normalizedEvents = normalizeArray(projectCreationEvents)
    .map((event) => normalizeProjectCreationEvent(event))
    .filter(Boolean);
  const normalizedMetric = normalizeObject(projectCreationMetric);
  const referenceTotal = normalizeTotalProjectsCreated(normalizedMetric?.totalProjectsCreated);

  return {
    projectCreationSummary: {
      totalProjectsCreated: referenceTotal ?? normalizedEvents.length,
      byDay: buildByDay(normalizedEvents),
      byUser: buildByUser(normalizedEvents),
      byCreationSource: buildByCreationSource(normalizedEvents),
    },
  };
}
