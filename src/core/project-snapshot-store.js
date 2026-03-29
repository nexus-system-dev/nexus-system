function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function inferSnapshotReason(snapshot) {
  const lifecyclePhase = snapshot.stateSummary?.lifecyclePhase ?? "unknown";

  if (lifecyclePhase === "execution") {
    return "pre-execution-change";
  }

  if (lifecyclePhase === "release") {
    return "pre-release-change";
  }

  return "pre-major-change";
}

function inferTriggerType(snapshot) {
  const restoreScope = normalizeArray(snapshot.restoreMetadata?.restoreScope);

  if (restoreScope.includes("execution-graph")) {
    return "graph-sensitive-change";
  }

  return "state-change";
}

export function createProjectSnapshotStore({
  projectStateSnapshot = null,
} = {}) {
  const normalizedSnapshot = normalizeObject(projectStateSnapshot);
  const snapshotId = normalizedSnapshot.snapshotId ?? "project-state-snapshot:unknown-project:v1";
  const stateVersion = normalizedSnapshot.stateVersion ?? 1;
  const executionGraphVersion = normalizedSnapshot.executionGraphVersion ?? 1;

  return {
    snapshotRecord: {
      snapshotRecordId: `snapshot-record:${snapshotId}`,
      snapshotId,
      projectId: normalizedSnapshot.projectId ?? "unknown-project",
      storageType: "project-snapshot-store",
      triggerType: inferTriggerType(normalizedSnapshot),
      reason: inferSnapshotReason(normalizedSnapshot),
      versions: {
        stateVersion,
        executionGraphVersion,
      },
      workspaceReference: {
        workspaceId: normalizedSnapshot.workspaceReference?.workspaceId ?? null,
        workspaceArea: normalizedSnapshot.workspaceReference?.workspaceArea ?? "developer-workspace",
        workspaceVisibility: normalizedSnapshot.workspaceReference?.workspaceVisibility ?? "workspace",
      },
      restoreMetadata: {
        ...normalizeObject(normalizedSnapshot.restoreMetadata),
        retentionPolicy: "pre-change-history",
        restoreWindow: "project-lifecycle",
      },
      artifactSummary: {
        ...normalizeObject(normalizedSnapshot.artifactSummary),
      },
      restorePayload: {
        ...normalizeObject(normalizedSnapshot.restorePayload),
      },
      storageMetadata: {
        storedAt: new Date().toISOString(),
        checksum: `${normalizedSnapshot.projectId ?? "unknown-project"}:${stateVersion}:${executionGraphVersion}`,
        includesExecutionGraph: executionGraphVersion > 0,
      },
      summary: {
        isStored: true,
        stateVersion,
        executionGraphVersion,
        canRestoreFull: normalizedSnapshot.restoreMetadata?.canRestoreFull ?? true,
      },
    },
  };
}
