function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

const KNOWN_EVENT_TYPES = new Set([
  "failed_login",
  "privilege_change",
  "secret_access",
  "policy_violation",
]);

function normalizeEventType(value) {
  const eventType = normalizeString(value, "unknown-security-event");
  return KNOWN_EVENT_TYPES.has(eventType) ? eventType : "unknown-security-event";
}

function normalizeAffectedResource(resource = {}) {
  const normalizedResource = normalizeObject(resource);
  return {
    resourceId: normalizeString(normalizedResource.resourceId, null),
    resourceType: normalizeString(normalizedResource.resourceType, null),
    resourceName: normalizeString(normalizedResource.resourceName, null),
  };
}

function normalizeActor(actorContext = {}) {
  const normalizedActorContext = normalizeObject(actorContext);
  return {
    actorId: normalizeString(normalizedActorContext.actorId ?? normalizedActorContext.userId, "system"),
    actorType: normalizeString(normalizedActorContext.actorType, "system"),
    actorRole: normalizeString(normalizedActorContext.actorRole ?? normalizedActorContext.role, null),
    sessionId: normalizeString(normalizedActorContext.sessionId, null),
    ipAddress: normalizeString(normalizedActorContext.ipAddress, null),
    deviceId: normalizeString(normalizedActorContext.deviceId, null),
  };
}

export function createSecurityEventSchema({
  securityEvent = null,
  actorContext = null,
} = {}) {
  const normalizedSecurityEvent = normalizeObject(securityEvent);
  const eventType = normalizeEventType(normalizedSecurityEvent.eventType);

  return {
    securityEvent: {
      eventType,
      projectId: normalizeString(normalizedSecurityEvent.projectId, null),
      workspaceId: normalizeString(normalizedSecurityEvent.workspaceId, null),
      summary: normalizeString(normalizedSecurityEvent.summary, eventType),
      source: normalizeString(normalizedSecurityEvent.source, "nexus-runtime"),
      traceId: normalizeString(normalizedSecurityEvent.traceId, null),
      threatLevel: normalizeString(normalizedSecurityEvent.threatLevel, null),
      severity: normalizeString(normalizedSecurityEvent.severity, null),
      timestamp: normalizeString(normalizedSecurityEvent.timestamp, new Date().toISOString()),
      affectedResource: normalizeAffectedResource(normalizedSecurityEvent.affectedResource),
      metadata: normalizeObject(normalizedSecurityEvent.metadata),
    },
    actorContext: normalizeActor(actorContext),
  };
}
