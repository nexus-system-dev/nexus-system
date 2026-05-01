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

function buildAuditTrail(event) {
  return [
    {
      eventType: "project-audit.captured",
      status: normalizeString(event.status, "recorded"),
      actorId: normalizeString(event.actor?.actorId, "system"),
      summary: normalizeString(event.summary ?? event.actionType, "project audit captured"),
      timestamp: normalizeString(event.timestamp, new Date().toISOString()),
    },
  ];
}

export function createProjectAuditEventCollector({
  projectAuditEvent = null,
} = {}) {
  const event = normalizeObject(projectAuditEvent);
  const impactedAreas = normalizeArray(event.impactedAreas);
  const attachments = normalizeArray(event.attachments);

  return {
    projectAuditRecord: {
      projectAuditRecordId: `project-audit-record:${normalizeString(event.projectAuditEventId, "unknown-event")}`,
      projectAuditEventId: normalizeString(event.projectAuditEventId, null),
      projectId: normalizeString(event.projectId, null),
      workspaceId: normalizeString(event.workspaceId, null),
      actionType: normalizeString(event.actionType, "project.observed"),
      category: normalizeString(event.category, "project"),
      status: normalizeString(event.status, "recorded"),
      actor: normalizeObject(event.actor),
      resource: normalizeObject(event.resource),
      summary: normalizeString(event.summary ?? event.actionType, "project audit record"),
      reason: normalizeString(event.reason, null),
      traceId: normalizeString(event.traceId, null),
      source: normalizeString(event.source, "nexus-runtime"),
      capturedAt: new Date().toISOString(),
      impactedAreas,
      attachments,
      metadata: normalizeObject(event.metadata),
      auditTrail: buildAuditTrail(event),
      summaryFlags: {
        isStored: true,
        hasAttachments: attachments.length > 0,
        hasImpact: impactedAreas.length > 0,
      },
    },
  };
}
