function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeSensitivity(riskLevel) {
  if (normalizeString(riskLevel, "low") === "high") {
    return "high";
  }

  if (normalizeString(riskLevel, "low") === "medium") {
    return "medium";
  }

  return "low";
}

function matchesFilters(actorActionTrace, filters) {
  if (normalizeString(filters.actorId, null) && normalizeString(actorActionTrace.actor?.actorId, null) !== normalizeString(filters.actorId, null)) {
    return false;
  }

  if (normalizeString(filters.actionType, null) && normalizeString(actorActionTrace.action?.actionType, null) !== normalizeString(filters.actionType, null)) {
    return false;
  }

  if (normalizeString(filters.sensitivity, null) && normalizeSensitivity(actorActionTrace.action?.riskLevel ?? actorActionTrace.riskLevel) !== normalizeString(filters.sensitivity, null)) {
    return false;
  }

  return true;
}

function buildViewerEntry(actorActionTrace = {}) {
  const action = normalizeObject(actorActionTrace.action);
  const actor = normalizeObject(actorActionTrace.actor);
  const outcome = normalizeObject(actorActionTrace.outcome);
  const traceLinks = normalizeObject(actorActionTrace.traceLinks);
  const providerSideEffects = normalizeArray(actorActionTrace.providerSideEffects);
  const affectedArtifacts = normalizeArray(actorActionTrace.affectedArtifacts);
  const sensitivity = normalizeSensitivity(action.riskLevel ?? actorActionTrace.riskLevel);

  return {
    entryId: normalizeString(actorActionTrace.actorActionTraceId, "actor-action-trace:unknown"),
    actorId: normalizeString(actor.actorId, null),
    actorLabel: normalizeString(actor.actorId ?? actor.actorType, "system"),
    actorType: normalizeString(actor.actorType, "system"),
    actionType: normalizeString(action.actionType, "project.observed"),
    category: normalizeString(action.category, "project"),
    headline: normalizeString(action.summary ?? action.actionType, "Project action observed"),
    outcomeStatus: normalizeString(outcome.status, "recorded"),
    timestamp: normalizeString(actorActionTrace.timestamp ?? actorActionTrace.capturedAt, null),
    sensitivity,
    traceId: normalizeString(traceLinks.traceId, null),
    resource: normalizeObject(traceLinks.resource),
    providerSideEffects,
    affectedArtifacts,
    summary: {
      providerEffectCount: providerSideEffects.length,
      artifactCount: affectedArtifacts.length,
      hasExecutionOutcome: Boolean(outcome.status),
    },
  };
}

export function createProjectAuditApiAndViewerModel({
  actorActionTrace = null,
  filters = null,
} = {}) {
  const normalizedTrace = normalizeObject(actorActionTrace);
  const normalizedFilters = normalizeObject(filters);
  const entries = normalizedTrace.actorActionTraceId && matchesFilters(normalizedTrace, normalizedFilters)
    ? [buildViewerEntry(normalizedTrace)]
    : [];

  return {
    projectAuditPayload: {
      projectAuditPayloadId: `project-audit-payload:${normalizeString(normalizedTrace.projectId, "unknown-project")}`,
      projectId: normalizeString(normalizedTrace.projectId, null),
      filters: {
        actorId: normalizeString(normalizedFilters.actorId, null),
        actionType: normalizeString(normalizedFilters.actionType, null),
        sensitivity: normalizeString(normalizedFilters.sensitivity, null),
      },
      entries,
      viewerModel: {
        tableColumns: ["actor", "action", "status", "sensitivity", "timestamp"],
        emptyState: entries.length > 0 ? null : "No matching audit activity found",
        supportsFiltering: true,
      },
      summary: {
        totalEntries: entries.length,
        filtered: Boolean(
          normalizeString(normalizedFilters.actorId, null)
          || normalizeString(normalizedFilters.actionType, null)
          || normalizeString(normalizedFilters.sensitivity, null)
        ),
        latestEntryId: entries[0]?.entryId ?? null,
      },
    },
  };
}
