function normalizeApprovalRecords(approvalRecords) {
  if (!Array.isArray(approvalRecords)) {
    return [];
  }

  return approvalRecords.filter((record) => record && typeof record === "object");
}

function createAuditEntries(record) {
  const trail = Array.isArray(record.auditTrail) ? record.auditTrail : [];

  return trail.map((entry, index) => ({
    auditEntryId: `${record.approvalRecordId ?? "approval-record"}:${index + 1}`,
    approvalRecordId: record.approvalRecordId ?? null,
    approvalRequestId: record.approvalRequestId ?? null,
    actionType: record.actionType ?? "unspecified-action",
    status: entry.status ?? record.status ?? "unknown",
    eventType: entry.eventType ?? "approval.event",
    actorId: entry.actorId ?? record.actorType ?? "system",
    reason: entry.reason ?? record.reason ?? null,
  }));
}

export function createApprovalAuditFormatter({
  approvalRecords,
} = {}) {
  const records = normalizeApprovalRecords(approvalRecords);
  const entries = records.flatMap((record) => createAuditEntries(record));

  return {
    approvalAuditTrail: {
      entries,
      totalRecords: records.length,
      totalEntries: entries.length,
      latestStatus: records[0]?.status ?? null,
    },
  };
}
