function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeArtifactEntry(artifact) {
  if (typeof artifact === "string") {
    return {
      artifactId: artifact,
      name: artifact,
      path: null,
      status: "produced",
    };
  }

  if (artifact && typeof artifact === "object") {
    return {
      artifactId: artifact.artifactId ?? artifact.id ?? artifact.name ?? artifact.path ?? null,
      name: artifact.name ?? artifact.artifactId ?? artifact.id ?? null,
      path: artifact.path ?? null,
      status: artifact.status ?? "produced",
    };
  }

  return null;
}

function buildProviderSideEffects(executionResult) {
  const metadata = normalizeObject(executionResult.metadata);
  const surfaces = normalizeArray(metadata.surfaces);

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
      actorActionTraceId: `actor-action-trace:${auditRecord.projectAuditRecordId ?? "unknown-record"}`,
      projectAuditRecordId: auditRecord.projectAuditRecordId ?? null,
      projectId: auditRecord.projectId ?? null,
      actor: normalizeObject(auditRecord.actor),
      action: {
        actionType: auditRecord.actionType ?? "project.observed",
        category: auditRecord.category ?? "project",
        summary: auditRecord.summary ?? "project audit trace",
      },
      outcome: {
        status: normalizedExecutionResult.status ?? auditRecord.status ?? "recorded",
        reason: normalizedExecutionResult.reason ?? auditRecord.reason ?? null,
        totalRuns: normalizedExecutionResult.metadata?.totalRuns ?? 0,
        totalCommands: normalizedExecutionResult.metadata?.totalCommands ?? 0,
      },
      providerSideEffects,
      affectedArtifacts,
      traceLinks: {
        traceId: auditRecord.traceId ?? normalizedExecutionResult.traceId ?? null,
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
