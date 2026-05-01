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

function normalizeArtifactEntry(artifact) {
  if (typeof artifact === "string") {
    return {
      artifactId: normalizeString(artifact, null),
      name: normalizeString(artifact, null),
      path: null,
      status: "produced",
    };
  }

  if (artifact && typeof artifact === "object") {
    return {
      artifactId: normalizeString(artifact.artifactId ?? artifact.id ?? artifact.name ?? artifact.path, null),
      name: normalizeString(artifact.name ?? artifact.artifactId ?? artifact.id, null),
      path: normalizeString(artifact.path, null),
      status: normalizeString(artifact.status, "produced"),
    };
  }

  return null;
}

function buildProviderSideEffects(executionResult) {
  const metadata = normalizeObject(executionResult.metadata);
  const surfaces = normalizeArray(metadata.surfaces)
    .map((surface) => normalizeString(surface, null))
    .filter(Boolean);

  return surfaces.map((surface, index) => ({
    effectId: `provider-side-effect:${index + 1}`,
    provider: surface,
    status: executionResult.status ?? "unknown",
    effectType: "execution-surface",
  }));
}

export function createActorActionTraceAssembler({
  projectAuditRecord = null,
  executionResult = null,
} = {}) {
  const auditRecord = normalizeObject(projectAuditRecord);
  const normalizedExecutionResult = normalizeObject(executionResult);
  const affectedArtifacts = normalizeArray(normalizedExecutionResult.artifacts)
    .map(normalizeArtifactEntry)
    .filter(Boolean);
  const providerSideEffects = buildProviderSideEffects(normalizedExecutionResult);

  return {
    actorActionTrace: {
      actorActionTraceId: `actor-action-trace:${normalizeString(auditRecord.projectAuditRecordId, "unknown-record")}`,
      projectAuditRecordId: normalizeString(auditRecord.projectAuditRecordId, null),
      projectId: normalizeString(auditRecord.projectId, null),
      actor: normalizeObject(auditRecord.actor),
      action: {
        actionType: normalizeString(auditRecord.actionType, "project.observed"),
        category: normalizeString(auditRecord.category, "project"),
        summary: normalizeString(auditRecord.summary, "project audit trace"),
      },
      outcome: {
        status: normalizeString(normalizedExecutionResult.status ?? auditRecord.status, "recorded"),
        reason: normalizeString(normalizedExecutionResult.reason ?? auditRecord.reason, null),
        totalRuns: normalizedExecutionResult.metadata?.totalRuns ?? 0,
        totalCommands: normalizedExecutionResult.metadata?.totalCommands ?? 0,
      },
      providerSideEffects,
      affectedArtifacts,
      traceLinks: {
        traceId: normalizeString(auditRecord.traceId ?? normalizedExecutionResult.traceId, null),
        resource: normalizeObject(auditRecord.resource),
      },
      summary: {
        hasExecutionOutcome: Boolean(normalizedExecutionResult.status),
        providerEffectCount: providerSideEffects.length,
        artifactCount: affectedArtifacts.length,
      },
    },
  };
}
