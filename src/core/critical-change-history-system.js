function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createCriticalChangeHistorySystem({
  systemActivityFeed = null,
  auditLogRecord = null,
} = {}) {
  const activityEntries = normalizeArray(systemActivityFeed?.entries).filter((entry) => {
    const category = typeof entry?.category === "string" ? entry.category : "";
    return category.includes("policy") || category.includes("security") || category.includes("billing") || category.includes("permission");
  });
  const directAuditEntry = auditLogRecord?.auditLogId
    ? [{
        changeId: auditLogRecord.auditLogId,
        category: auditLogRecord.category ?? "system",
        headline: auditLogRecord.actionType ?? "Critical system action",
        timestamp: auditLogRecord.timestamp ?? auditLogRecord.recordedAt ?? null,
      }]
    : [];
  const historyEntries = [
    ...directAuditEntry,
    ...activityEntries.map((entry) => ({
      changeId: entry.activityId,
      category: entry.category,
      headline: entry.category,
      timestamp: entry.timestamp ?? null,
    })),
  ];

  return {
    criticalChangeHistory: {
      criticalChangeHistoryId: `critical-change-history:${systemActivityFeed?.systemActivityFeedId ?? auditLogRecord?.auditLogId ?? "unknown"}`,
      entries: historyEntries,
      summary: {
        totalEntries: historyEntries.length,
        latestChangeId: historyEntries[0]?.changeId ?? null,
      },
    },
  };
}
