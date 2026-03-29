function normalizeSystemAction(systemAction) {
  return systemAction && typeof systemAction === "object" ? systemAction : {};
}

function normalizeActorContext(actorContext) {
  return actorContext && typeof actorContext === "object" ? actorContext : {};
}

function normalizeMetadata(metadata) {
  return metadata && typeof metadata === "object" ? metadata : {};
}

function resolveCategory(actionType) {
  const normalized = `${actionType ?? ""}`.toLowerCase();

  if (normalized.startsWith("auth.") || normalized.includes("login") || normalized.includes("session")) {
    return "auth";
  }

  if (normalized.startsWith("workspace.") || normalized.includes("role") || normalized.includes("membership")) {
    return "access";
  }

  if (normalized.startsWith("approval.")) {
    return "approval";
  }

  if (normalized.startsWith("security.") || normalized.includes("incident") || normalized.includes("anomaly")) {
    return "security";
  }

  return "system";
}

export function createAuditLogForSystemActions({
  systemAction = null,
  actorContext = null,
  auditLogStore = null,
  observabilityTransport = null,
} = {}) {
  const normalizedAction = normalizeSystemAction(systemAction);
  const normalizedActor = normalizeActorContext(actorContext);
  const actionType = normalizedAction.actionType ?? "system.observed";
  const category = resolveCategory(actionType);
  const auditLogRecord = {
    auditLogId: `audit-log-${Date.now()}`,
    actionType,
    category,
    status: normalizedAction.status ?? "recorded",
    projectId: normalizedAction.projectId ?? normalizedActor.projectId ?? null,
    workspaceId: normalizedActor.workspaceId ?? null,
    actorId: normalizedActor.actorId ?? normalizedAction.actorId ?? "system",
    actorType: normalizedActor.actorType ?? "system",
    actorRole: normalizedActor.actorRole ?? null,
    targetId: normalizedAction.targetId ?? null,
    targetType: normalizedAction.targetType ?? null,
    summary: normalizedAction.summary ?? actionType,
    reason: normalizedAction.reason ?? null,
    riskLevel: normalizedAction.riskLevel ?? "low",
    source: normalizedAction.source ?? normalizedActor.source ?? "nexus-runtime",
    traceId: normalizedAction.traceId ?? normalizedActor.traceId ?? null,
    timestamp: normalizedAction.timestamp ?? new Date().toISOString(),
    metadata: normalizeMetadata(normalizedAction.metadata),
  };
  const storedAuditLogRecord = auditLogStore && typeof auditLogStore.append === "function"
    ? auditLogStore.append(auditLogRecord)
    : auditLogRecord;

  if (observabilityTransport && typeof observabilityTransport.recordTraceEnvelope === "function") {
    observabilityTransport.recordTraceEnvelope({
      platformTrace: {
        traceId: auditLogRecord.traceId ?? `${auditLogRecord.auditLogId}:trace`,
        route: "/runtime/audit-log",
        method: "SYSTEM",
        actorId: auditLogRecord.actorId,
        workspaceId: auditLogRecord.workspaceId,
        service: "system-audit-log",
        status: "recorded",
        startedAt: auditLogRecord.timestamp,
        completedAt: auditLogRecord.timestamp,
        steps: [
          {
            stepId: auditLogRecord.auditLogId,
            source: auditLogRecord.source,
            status: auditLogRecord.status,
            timestamp: auditLogRecord.timestamp,
            message: auditLogRecord.summary,
          },
        ],
      },
      platformLogs: [
        {
          logId: `${auditLogRecord.auditLogId}:log`,
          level: auditLogRecord.riskLevel === "high" ? "warn" : "info",
          source: "system-audit-log",
          message: auditLogRecord.summary,
          timestamp: auditLogRecord.timestamp,
          metadata: {
            category: auditLogRecord.category,
            actionType: auditLogRecord.actionType,
            targetType: auditLogRecord.targetType,
          },
        },
      ],
    });
  }

  return {
    auditLogRecord: storedAuditLogRecord,
  };
}
