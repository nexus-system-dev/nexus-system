function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeMaxSnapshots(retentionPolicy = {}, snapshotSchedule = {}) {
  const policyMax = Number(retentionPolicy.maxSnapshots);
  if (Number.isFinite(policyMax) && policyMax >= 1) {
    return Math.floor(policyMax);
  }

  const scheduleMax = Number(snapshotSchedule.retention?.maxSnapshots);
  if (Number.isFinite(scheduleMax) && scheduleMax >= 1) {
    return Math.floor(scheduleMax);
  }

  return 20;
}

function resolveRetentionEnabled(retentionPolicy = {}) {
  if (typeof retentionPolicy.enabled === "boolean") {
    return retentionPolicy.enabled;
  }

  return true;
}

function sortByStoredAt(records = []) {
  return [...records].sort((left, right) => {
    const leftTime = Date.parse(left?.storageMetadata?.storedAt ?? 0) || 0;
    const rightTime = Date.parse(right?.storageMetadata?.storedAt ?? 0) || 0;
    return leftTime - rightTime;
  });
}

export function createSnapshotRetentionGuard({
  snapshotRecord = null,
  snapshotSchedule = null,
  snapshotRecords = null,
  retentionPolicy = null,
  triggerType = "manual-cleanup",
  now = new Date(),
} = {}) {
  const normalizedSnapshotRecord = normalizeObject(snapshotRecord);
  const normalizedSnapshotSchedule = normalizeObject(snapshotSchedule);
  const normalizedRetentionPolicy = normalizeObject(retentionPolicy);
  const records = sortByStoredAt(normalizeArray(snapshotRecords));
  const maxSnapshots = normalizeMaxSnapshots(normalizedRetentionPolicy, normalizedSnapshotSchedule);
  const retentionEnabled = resolveRetentionEnabled(normalizedRetentionPolicy);
  const totalSnapshots = records.length;
  const excessCount = retentionEnabled ? Math.max(0, totalSnapshots - maxSnapshots) : 0;
  const recordsToDelete = excessCount > 0 ? records.slice(0, excessCount) : [];
  const deletedSnapshotRecordIds = recordsToDelete
    .map((record) => normalizeString(record.snapshotRecordId, null))
    .filter(Boolean);
  const nowIso = now instanceof Date ? now.toISOString() : new Date().toISOString();

  return {
    snapshotRetentionDecision: {
      snapshotRetentionDecisionId: `snapshot-retention-decision:${normalizeString(normalizedSnapshotRecord.snapshotRecordId, "snapshot-store")}:${Date.now()}`,
      triggerType: normalizeString(triggerType, "manual-cleanup"),
      retentionEnabled,
      maxSnapshots,
      totalSnapshots,
      shouldPrune: retentionEnabled && deletedSnapshotRecordIds.length > 0,
      deletedSnapshotRecordIds,
      retainedSnapshotRecordIds: records
        .slice(Math.max(0, totalSnapshots - maxSnapshots))
        .map((record) => normalizeString(record.snapshotRecordId, null))
        .filter(Boolean),
      summary: {
        pruneCount: deletedSnapshotRecordIds.length,
        totalAfterCleanup: retentionEnabled
          ? Math.min(totalSnapshots, maxSnapshots)
          : totalSnapshots,
        hasCapacity: retentionEnabled ? totalSnapshots <= maxSnapshots : true,
        policyStatus: retentionEnabled ? "active" : "paused",
      },
      evaluatedAt: nowIso,
    },
  };
}
