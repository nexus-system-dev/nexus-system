function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createSystemWideActivityTracker({
  platformTrace = null,
  projectAuditRecord = null,
} = {}) {
  const traceEvents = normalizeArray(platformTrace?.runtimeEvents?.executionEvents).map((event, index) => ({
    activityId: `${platformTrace?.traceId ?? "trace"}:runtime:${index}`,
    source: "runtime",
    category: event?.type ?? "runtime.event",
    timestamp: event?.timestamp ?? null,
  }));
  const auditEvents = normalizeArray(projectAuditRecord?.auditTrail).map((entry, index) => ({
    activityId: `${projectAuditRecord?.projectAuditRecordId ?? "audit"}:${index}`,
    source: "audit",
    category: entry?.category ?? entry?.actionType ?? "project.audit",
    timestamp: entry?.timestamp ?? entry?.capturedAt ?? null,
  }));
  const entries = [...traceEvents, ...auditEvents];

  return {
    systemActivityFeed: {
      systemActivityFeedId: `system-activity:${platformTrace?.traceId ?? projectAuditRecord?.projectAuditRecordId ?? "unknown"}`,
      entries,
      summary: {
        totalEntries: entries.length,
        runtimeEntryCount: traceEvents.length,
        auditEntryCount: auditEvents.length,
      },
    },
  };
}
