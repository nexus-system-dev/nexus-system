function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function bytesToGb(bytes) {
  return bytes / (1024 ** 3);
}

function resolveAttachmentVolumeGb(storageRecord) {
  const attachments = normalizeArray(storageRecord.attachments);
  const totalBytes = attachments.reduce((sum, attachment) => {
    const size = normalizeFiniteNumber(attachment?.size);
    return size !== null && size >= 0 ? sum + size : sum;
  }, 0);
  const sizedAttachmentCount = attachments.filter((attachment) => {
    const size = normalizeFiniteNumber(attachment?.size);
    return size !== null && size >= 0;
  }).length;

  if (sizedAttachmentCount === 0) {
    return null;
  }

  return bytesToGb(totalBytes);
}

function resolveLifecycleWindowDays(retentionWindow) {
  const normalizedWindow = normalizeObject(retentionWindow);
  const candidates = [
    normalizeFiniteNumber(normalizedWindow.deleteAfterDays),
    normalizeFiniteNumber(normalizedWindow.archiveAfterDays),
    normalizeFiniteNumber(normalizedWindow.reviewAfterDays),
  ];

  for (const candidate of candidates) {
    if (candidate !== null && candidate >= 0) {
      return candidate;
    }
  }

  return null;
}

function resolveSource(storageRecord, manualContext) {
  if (storageRecord && Object.keys(normalizeObject(storageRecord)).length > 0) {
    return "file-artifact-storage-module";
  }

  if (manualContext && Object.keys(normalizeObject(manualContext)).length > 0) {
    return "manual";
  }

  return "derived";
}

function buildSummary({
  attachmentVolumeGb,
  lifecycleWindowDays,
}) {
  if (attachmentVolumeGb === null) {
    return "Storage metric could not resolve any billable storage volume from available sources.";
  }

  if (lifecycleWindowDays === null) {
    return "Storage metric calculated from attachment volume only; artifacts, logs, and snapshots lack volume sources.";
  }

  return "Storage metric calculated using attachment volume and retention window.";
}

export function createStorageAndArtifactCostTracker({
  storageRecord = null,
  retentionWindow = null,
  manualContext = null,
} = {}) {
  const normalizedStorageRecord = normalizeObject(storageRecord);
  const attachmentVolumeGb = resolveAttachmentVolumeGb(normalizedStorageRecord);
  const lifecycleWindowDays = resolveLifecycleWindowDays(retentionWindow);
  const quantity =
    attachmentVolumeGb !== null && lifecycleWindowDays !== null
      ? (attachmentVolumeGb * lifecycleWindowDays) / 30
      : null;
  const projectId = normalizeString(normalizedStorageRecord.projectId) ?? null;
  const workspaceId = normalizeString(normalizedStorageRecord.workspaceId) ?? null;
  const storageRecordId = normalizeString(normalizedStorageRecord.storageRecordId) ?? null;
  const retentionPolicy = normalizeString(normalizedStorageRecord.retentionPolicy) ?? null;
  const source = resolveSource(normalizedStorageRecord, manualContext);
  const recordedAt = normalizeString(normalizedStorageRecord.recordedAt) ?? new Date().toISOString();

  return {
    storageCostMetric: {
      storageCostMetricId: `storage-cost-metric:${storageRecordId ?? projectId ?? "global"}:${recordedAt}`,
      usageType: "storage",
      quantity,
      unit: "gb-month",
      projectId,
      workspaceId,
      storageRecordId,
      artifactVolumeGb: null,
      attachmentVolumeGb,
      logVolumeGb: null,
      snapshotVolumeGb: null,
      retentionPolicy,
      lifecycleWindowDays,
      source,
      recordedAt,
      summary: buildSummary({
        attachmentVolumeGb,
        lifecycleWindowDays,
      }),
    },
  };
}
