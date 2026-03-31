function normalizeObject(value) {
  return value && typeof value === "object" ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseTimestamp(value) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }

  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveRuntimeDurationMs(platformTrace) {
  const normalizedTrace = normalizeObject(platformTrace);
  const directDuration = normalizeFiniteNumber(normalizedTrace.durationMs);
  if (directDuration !== null && directDuration >= 0) {
    return directDuration;
  }

  const startedAt = parseTimestamp(normalizedTrace.startedAt);
  const completedAt = parseTimestamp(normalizedTrace.completedAt);
  if (startedAt !== null && completedAt !== null) {
    const computedDuration = completedAt - startedAt;
    return computedDuration >= 0 ? computedDuration : null;
  }

  return null;
}

function resolveRecordedAt(platformTrace, cloudWorkspaceModel) {
  const normalizedTrace = normalizeObject(platformTrace);
  const normalizedWorkspace = normalizeObject(cloudWorkspaceModel);

  return normalizeString(normalizedTrace.completedAt)
    ?? normalizeString(normalizedTrace.startedAt)
    ?? normalizeString(normalizedWorkspace.commandRuntime?.executedAt)
    ?? new Date().toISOString();
}

function resolveSource(platformTrace, cloudWorkspaceModel) {
  const normalizedWorkspace = normalizeObject(cloudWorkspaceModel);
  const runtimeDurationMs = resolveRuntimeDurationMs(platformTrace);

  if (runtimeDurationMs !== null) {
    return "platform-observability";
  }

  if (normalizedWorkspace.workspaceId ?? normalizedWorkspace.projectId ?? normalizedWorkspace.commandRuntime?.executedAt) {
    return "cloud-workspace-model";
  }

  return "derived";
}

export function createWorkspaceComputeUsageTracker({
  cloudWorkspaceModel = null,
  platformTrace = null,
} = {}) {
  const normalizedWorkspace = normalizeObject(cloudWorkspaceModel);
  const runtimeDurationMs = resolveRuntimeDurationMs(platformTrace);
  const quantity = runtimeDurationMs !== null ? runtimeDurationMs / 60000 : null;
  const workspaceId = normalizeString(normalizedWorkspace.workspaceId) ?? null;
  const projectId = normalizeString(normalizedWorkspace.projectId) ?? null;
  const source = resolveSource(platformTrace, normalizedWorkspace);
  const recordedAt = resolveRecordedAt(platformTrace, normalizedWorkspace);

  return {
    workspaceComputeMetric: {
      workspaceComputeMetricId: `workspace-compute-metric:${workspaceId ?? "global"}:${recordedAt}`,
      usageType: "workspace",
      quantity,
      unit: "workspace-minute",
      workspaceId,
      projectId,
      cpuUsage: null,
      ramUsage: null,
      runtimeDurationMs,
      activeWorkspaceWindows: null,
      source,
      recordedAt,
      summary:
        runtimeDurationMs === null
          ? "Workspace compute metric could not resolve runtime duration from available observability or workspace signals."
          : `Workspace compute metric captured ${(quantity ?? 0).toFixed(2)} workspace minutes.`,
    },
  };
}
