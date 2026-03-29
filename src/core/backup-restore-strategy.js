function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveCriticalDatasets(entities = {}) {
  return Object.values(entities)
    .filter((entity) => entity && typeof entity === "object")
    .map((entity) => ({
      entityName: entity.entityName ?? "unknown-entity",
      retentionPolicy: entity.retentionPolicy ?? "default",
      storageType: entity.storageType ?? "document",
      criticality:
        ["projects", "approvals", "users", "workspaces"].includes(entity.entityName)
          ? "critical"
          : "important",
    }));
}

function buildArtifactTargets(storageRecord = {}) {
  const artifacts = normalizeArray(storageRecord.artifacts).map((artifact) => ({
    storageItemId: artifact.storageItemId ?? null,
    kind: artifact.kind ?? "artifact",
    path: artifact.path ?? null,
    status: artifact.status ?? "stored",
  }));
  const attachments = normalizeArray(storageRecord.attachments).map((attachment) => ({
    storageItemId: attachment.storageItemId ?? null,
    kind: attachment.kind ?? "attachment",
    path: attachment.path ?? null,
    status: attachment.status ?? "stored",
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
    backupStrategyId: `backup-strategy:${normalizedStorageRecord.projectId ?? "unknown-project"}`,
    projectId: normalizedStorageRecord.projectId ?? null,
    backupMode: artifactTargets.length > 0 ? "state-and-artifacts" : "state-only",
    cadence: {
      baseline: "daily",
      preChange: "before-bootstrap-migration-deploy",
    },
    persistenceTargets: criticalDatasets,
    artifactTargets,
    storagePolicy: {
      storageDriver: normalizedStorageRecord.storageDriver ?? "filesystem",
      storagePath: normalizedStorageRecord.storagePath ?? null,
      retentionPolicy: normalizedStorageRecord.retentionPolicy ?? "project-lifecycle",
    },
    summary: {
      totalDatasets: criticalDatasets.length,
      totalArtifactTargets: artifactTargets.length,
      protectsArtifacts: artifactTargets.length > 0,
    },
  };

  const restorePlan = {
    restorePlanId: `restore-plan:${normalizedStorageRecord.projectId ?? "unknown-project"}`,
    projectId: normalizedStorageRecord.projectId ?? null,
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
