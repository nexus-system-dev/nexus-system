function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function resolveCriticalDatasets(entities = {}) {
  return Object.values(entities)
    .filter((entity) => entity && typeof entity === "object")
    .map((entity) => ({
      entityName: normalizeString(entity.entityName, "unknown-entity"),
      retentionPolicy: normalizeString(entity.retentionPolicy, "default"),
      storageType: normalizeString(entity.storageType, "document"),
      criticality:
        ["projects", "approvals", "users", "workspaces"].includes(normalizeString(entity.entityName, "unknown-entity"))
          ? "critical"
          : "important",
    }));
}

function buildArtifactTargets(storageRecord = {}) {
  const artifacts = normalizeArray(storageRecord.artifacts).map((artifact) => ({
    storageItemId: normalizeString(artifact.storageItemId, null),
    kind: normalizeString(artifact.kind, "artifact"),
    path: normalizeString(artifact.path, null),
    status: normalizeString(artifact.status, "stored"),
  }));
  const attachments = normalizeArray(storageRecord.attachments).map((attachment) => ({
    storageItemId: normalizeString(attachment.storageItemId, null),
    kind: normalizeString(attachment.kind, "attachment"),
    path: normalizeString(attachment.path, null),
    status: normalizeString(attachment.status, "stored"),
  }));

  return [...artifacts, ...attachments];
}

export function createBackupAndRestoreStrategy({
  nexusPersistenceSchema = null,
  storageRecords = null,
} = {}) {
  const normalizedSchema = normalizeObject(nexusPersistenceSchema);
  const normalizedStorageRecord = normalizeObject(storageRecords);
  const criticalDatasets = resolveCriticalDatasets(normalizedSchema.entities ?? {});
  const artifactTargets = buildArtifactTargets(normalizedStorageRecord);
  const backupStrategy = {
    backupStrategyId: `backup-strategy:${normalizeString(normalizedStorageRecord.projectId, "unknown-project")}`,
    projectId: normalizeString(normalizedStorageRecord.projectId, null),
    backupMode: artifactTargets.length > 0 ? "state-and-artifacts" : "state-only",
    cadence: {
      baseline: "daily",
      preChange: "before-bootstrap-migration-deploy",
    },
    persistenceTargets: criticalDatasets,
    artifactTargets,
    storagePolicy: {
      storageDriver: normalizeString(normalizedStorageRecord.storageDriver, "filesystem"),
      storagePath: normalizeString(normalizedStorageRecord.storagePath, null),
      retentionPolicy: normalizeString(normalizedStorageRecord.retentionPolicy, "project-lifecycle"),
    },
    summary: {
      totalDatasets: criticalDatasets.length,
      totalArtifactTargets: artifactTargets.length,
      protectsArtifacts: artifactTargets.length > 0,
    },
  };

  const restorePlan = {
    restorePlanId: `restore-plan:${normalizeString(normalizedStorageRecord.projectId, "unknown-project")}`,
    projectId: normalizeString(normalizedStorageRecord.projectId, null),
    restoreOrder: [
      "persistence-schema",
      "core-project-records",
      "approval-and-governance-records",
      "artifact-storage",
      "workspace-attachments",
    ],
    restoreTargets: {
      datasets: criticalDatasets.map((dataset) => dataset.entityName),
      artifacts: artifactTargets.map((target) => target.storageItemId).filter(Boolean),
    },
    verificationChecks: [
      "entity-integrity",
      "artifact-availability",
      "workspace-linkage",
    ],
    summary: {
      canRestoreState: criticalDatasets.length > 0,
      canRestoreArtifacts: artifactTargets.length > 0,
      requiresSnapshotAlignment: true,
    },
  };

  return {
    backupStrategy,
    restorePlan,
  };
}
