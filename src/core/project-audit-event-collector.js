function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildAuditTrail(event) {
  return [
    {
      eventType: "project-audit.captured",
      status: event.status ?? "recorded",
      actorId: event.actor?.actorId ?? "system",
      summary: event.summary ?? event.actionType ?? "project audit captured",
      timestamp: event.timestamp ?? new Date().toISOString(),
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
      projectAuditRecordId: `project-audit-record:${event.projectAuditEventId ?? "unknown-event"}`,
      projectAuditEventId: event.projectAuditEventId ?? null,
      projectId: event.projectId ?? null,
      workspaceId: event.workspaceId ?? null,
      actionType: event.actionType ?? "project.observed",
      category: event.category ?? "project",
      status: event.status ?? "recorded",
      actor: normalizeObject(event.actor),
      resource: normalizeObject(event.resource),
      summary: event.summary ?? event.actionType ?? "project audit record",
      reason: event.reason ?? null,
      traceId: event.traceId ?? null,
      source: event.source ?? "nexus-runtime",
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
