function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function createOwnerAuditLogViewer({
  auditLogRecord = null,
  projectAuditPayload = null,
} = {}) {
  const payloadEntries = normalizeArray(projectAuditPayload?.entries);
  const systemEntry = auditLogRecord?.auditLogId
    ? {
        entryId: auditLogRecord.auditLogId,
        category: normalizeString(auditLogRecord.category, "system"),
        headline: normalizeString(auditLogRecord.actionType, "System audit event"),
        timestamp: normalizeString(auditLogRecord.timestamp ?? auditLogRecord.recordedAt, null),
      }
    : null;
  const entries = [systemEntry, ...payloadEntries].filter(Boolean);

  return {
    ownerAuditView: {
      ownerAuditViewId: `owner-audit-view:${projectAuditPayload?.projectId ?? auditLogRecord?.projectId ?? "unknown"}`,
      entries,
      viewerModel: {
        totalEntries: entries.length,
        categories: Array.from(new Set(entries.map((entry) => entry.category).filter(Boolean))),
      },
      summary: {
        latestEntryId: entries[0]?.entryId ?? null,
        hasCriticalHistory: entries.some((entry) => entry.category === "security" || entry.category === "policy"),
      },
    },
  };
}
