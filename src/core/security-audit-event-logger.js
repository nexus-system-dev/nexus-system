import { createSecurityEventSchema } from "./security-event-schema.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function resolveSeverity(eventType, providedSeverity) {
  const normalizedProvidedSeverity = normalizeString(providedSeverity, null);
  if (normalizedProvidedSeverity) {
    return normalizedProvidedSeverity;
  }

  if (eventType === "policy_violation") {
    return "critical";
  }
  if (["privilege_change", "secret_access"].includes(eventType)) {
    return "high";
  }
  if (eventType === "failed_login") {
    return "medium";
  }
  return "low";
}

function resolveThreatLevel(eventType, providedThreatLevel) {
  const normalizedProvidedThreatLevel = normalizeString(providedThreatLevel, null);
  if (normalizedProvidedThreatLevel) {
    return normalizedProvidedThreatLevel;
  }

  if (eventType === "policy_violation") {
    return "critical";
  }
  if (["privilege_change", "secret_access"].includes(eventType)) {
    return "elevated";
  }
  if (eventType === "failed_login") {
    return "guarded";
  }
  return "observed";
}

function shouldAlert(eventType) {
  return eventType === "policy_violation" || eventType === "privilege_change";
}

function resolveObservabilityLevel(severity, requiresAlert) {
  if (requiresAlert || severity === "critical" || severity === "high") {
    return "error";
  }
  if (severity === "medium") {
    return "warn";
  }
  return "info";
}

export function createSecurityAuditEventLogger({
  securityEvent = null,
  actorContext = null,
  securityAuditLogStore = null,
  observabilityTransport = null,
} = {}) {
  const rawSecurityEvent = normalizeObject(securityEvent);
  if (Object.keys(rawSecurityEvent).length === 0) {
    return {
      securityAuditRecord: null,
    };
  }

  const {
    securityEvent: normalizedSecurityEvent,
    actorContext: normalizedActorContext,
  } = createSecurityEventSchema({
    securityEvent: rawSecurityEvent,
    actorContext,
  });
  const severity = resolveSeverity(normalizedSecurityEvent.eventType, normalizedSecurityEvent.severity);
  const threatLevel = resolveThreatLevel(normalizedSecurityEvent.eventType, normalizedSecurityEvent.threatLevel);
  const requiresAlert = shouldAlert(normalizedSecurityEvent.eventType);
  const timestamp = normalizeString(normalizedSecurityEvent.timestamp, new Date().toISOString());
  const securityAuditRecord = {
    securityAuditId: `security-audit-${Date.now()}`,
    eventType: normalizeString(normalizedSecurityEvent.eventType, "unknown-security-event"),
    severity,
    threatLevel,
    requiresAlert,
    projectId: normalizeString(normalizedSecurityEvent.projectId, null),
    workspaceId: normalizeString(normalizedSecurityEvent.workspaceId, null),
    actor: normalizedActorContext,
    affectedResource: normalizedSecurityEvent.affectedResource,
    summary: normalizeString(normalizedSecurityEvent.summary, "Security event recorded"),
    timestamp,
    source: normalizeString(normalizedSecurityEvent.source, "nexus-runtime"),
    traceId: normalizeString(normalizedSecurityEvent.traceId, null) ?? `${normalizeString(normalizedSecurityEvent.eventType, "unknown-security-event")}:${Date.now()}`,
    metadata: normalizedSecurityEvent.metadata,
  };

  const storedSecurityAuditRecord =
    securityAuditLogStore && typeof securityAuditLogStore.append === "function"
      ? securityAuditLogStore.append(securityAuditRecord)
      : securityAuditRecord;

  if (observabilityTransport && typeof observabilityTransport.recordTraceEnvelope === "function") {
    observabilityTransport.recordTraceEnvelope({
      platformTrace: {
        traceId: securityAuditRecord.traceId,
        route: "/runtime/security-audit",
        method: "SYSTEM",
        actorId: securityAuditRecord.actor.actorId,
        workspaceId: securityAuditRecord.workspaceId,
        service: "security-audit-log",
        status: requiresAlert ? "alerted" : "recorded",
        startedAt: timestamp,
        completedAt: timestamp,
        steps: [
          {
            stepId: securityAuditRecord.securityAuditId,
            source: securityAuditRecord.source,
            status: requiresAlert ? "alerted" : "recorded",
            timestamp,
            message: securityAuditRecord.summary,
          },
        ],
      },
      platformLogs: [
        {
          logId: `${securityAuditRecord.securityAuditId}:log`,
          level: resolveObservabilityLevel(severity, requiresAlert),
          source: "security-audit-log",
          message: securityAuditRecord.summary,
          timestamp,
          metadata: {
            eventType: securityAuditRecord.eventType,
            severity: securityAuditRecord.severity,
            threatLevel: securityAuditRecord.threatLevel,
            requiresAlert: securityAuditRecord.requiresAlert,
            actorId: securityAuditRecord.actor.actorId,
            resourceType: securityAuditRecord.affectedResource.resourceType,
          },
        },
      ],
    });
  }

  return {
    securityAuditRecord: storedSecurityAuditRecord,
  };
}
