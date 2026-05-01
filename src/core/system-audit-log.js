function normalizeSystemAction(systemAction) {
  return systemAction && typeof systemAction === "object" ? systemAction : {};
}

function normalizeActorContext(actorContext) {
  return actorContext && typeof actorContext === "object" ? actorContext : {};
}

function normalizeMetadata(metadata) {
  return metadata && typeof metadata === "object" ? metadata : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
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
  const actionType = normalizeString(normalizedAction.actionType, "system.observed");
  const category = resolveCategory(actionType);
  const auditLogRecord = {
    auditLogId: `audit-log-${Date.now()}`,
    actionType,
    category,
    status: normalizeString(normalizedAction.status, "recorded"),
    projectId: normalizeString(normalizedAction.projectId, normalizeString(normalizedActor.projectId, null)),
    workspaceId: normalizeString(normalizedActor.workspaceId, null),
    actorId: normalizeString(normalizedActor.actorId, normalizeString(normalizedAction.actorId, "system")),
    actorType: normalizeString(normalizedActor.actorType, "system"),
    actorRole: normalizeString(normalizedActor.actorRole, null),
    targetId: normalizeString(normalizedAction.targetId, null),
    targetType: normalizeString(normalizedAction.targetType, null),
    summary: normalizeString(normalizedAction.summary, actionType),
    reason: normalizeString(normalizedAction.reason, null),
    riskLevel: normalizeString(normalizedAction.riskLevel, "low"),
    source: normalizeString(normalizedAction.source, normalizeString(normalizedActor.source, "nexus-runtime")),
    traceId: normalizeString(normalizedAction.traceId, normalizeString(normalizedActor.traceId, null)),
    timestamp: normalizeString(normalizedAction.timestamp, new Date().toISOString()),
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
