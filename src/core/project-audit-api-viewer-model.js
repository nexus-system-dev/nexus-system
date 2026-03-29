function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeSensitivity(riskLevel) {
  if (riskLevel === "high") {
    return "high";
  }

  if (riskLevel === "medium") {
    return "medium";
  }

  return "low";
}

function matchesFilters(actorActionTrace, filters) {
  if (filters.actorId && actorActionTrace.actor?.actorId !== filters.actorId) {
    return false;
  }

  if (filters.actionType && actorActionTrace.action?.actionType !== filters.actionType) {
    return false;
  }

  if (filters.sensitivity && normalizeSensitivity(actorActionTrace.action?.riskLevel ?? actorActionTrace.riskLevel) !== filters.sensitivity) {
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
    entryId: actorActionTrace.actorActionTraceId ?? "actor-action-trace:unknown",
    actorId: actor.actorId ?? null,
    actorLabel: actor.actorId ?? actor.actorType ?? "system",
    actorType: actor.actorType ?? "system",
    actionType: action.actionType ?? "project.observed",
    category: action.category ?? "project",
    headline: action.summary ?? action.actionType ?? "Project action observed",
    outcomeStatus: outcome.status ?? "recorded",
    timestamp: actorActionTrace.timestamp ?? actorActionTrace.capturedAt ?? null,
    sensitivity,
    traceId: traceLinks.traceId ?? null,
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
      projectAuditPayloadId: `project-audit-payload:${normalizedTrace.projectId ?? "unknown-project"}`,
      projectId: normalizedTrace.projectId ?? null,
      filters: {
        actorId: normalizedFilters.actorId ?? null,
        actionType: normalizedFilters.actionType ?? null,
        sensitivity: normalizedFilters.sensitivity ?? null,
      },
      entries,
      viewerModel: {
        tableColumns: ["actor", "action", "status", "sensitivity", "timestamp"],
        emptyState: entries.length > 0 ? null : "No matching audit activity found",
        supportsFiltering: true,
      },
      summary: {
        totalEntries: entries.length,
        filtered: Boolean(normalizedFilters.actorId || normalizedFilters.actionType || normalizedFilters.sensitivity),
        latestEntryId: entries[0]?.entryId ?? null,
      },
    },
  };
}
