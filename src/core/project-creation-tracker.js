function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeTotalProjectsCreated(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0;
}

export function createProjectCreationTracker({
  projectCreationEvent = null,
  previousProjectCreationMetric = null,
} = {}) {
  const normalizedEvent = normalizeObject(projectCreationEvent);
  const previousMetric = normalizeObject(previousProjectCreationMetric);
  const previousTotal = normalizeTotalProjectsCreated(previousMetric?.totalProjectsCreated);
  const hasTrackableEvent =
    normalizeString(normalizedEvent?.projectCreationEventId)
    && normalizeString(normalizedEvent?.projectId)
    && normalizeString(normalizedEvent?.creationSource)
    && normalizeString(normalizedEvent?.timestamp);

  return {
    projectCreationMetric: {
      totalProjectsCreated: hasTrackableEvent ? previousTotal + 1 : previousTotal,
    },
  };
}
