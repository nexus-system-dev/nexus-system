function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function resolveRestorePayload(snapshotRecord) {
  return normalizeObject(snapshotRecord.restorePayload);
}

function buildRestoredProjectState(snapshotRecord, restoreDecision) {
  if (!normalizeArray(restoreDecision.restoreTargets).includes("project-state")) {
    return null;
  }

  return normalizeObject(resolveRestorePayload(snapshotRecord).projectState);
}

function buildRestoredExecutionGraph(snapshotRecord, restoreDecision) {
  if (!normalizeArray(restoreDecision.restoreTargets).includes("execution-graph")) {
    return null;
  }

  return normalizeObject(resolveRestorePayload(snapshotRecord).executionGraph);
}

function buildRestoredWorkspaceReference(snapshotRecord, restoreDecision) {
  if (!normalizeArray(restoreDecision.restoreTargets).includes("workspace-reference")) {
    return null;
  }

  return normalizeObject(resolveRestorePayload(snapshotRecord).workspaceReference);
}

function buildLinkedMetadataResult(snapshotRecord, target) {
  if (target !== "linked-metadata") {
    return null;
  }

  const artifactSummary = normalizeObject(
    resolveRestorePayload(snapshotRecord).linkedMetadata?.artifactSummary ?? snapshotRecord.artifactSummary,
  );

  return {
    target,
    restored: true,
    artifactCount: artifactSummary.artifactCount ?? 0,
    packageFormat: artifactSummary.packageFormat ?? null,
    verificationStatus: artifactSummary.verificationStatus ?? "unknown",
  };
}

function buildAppliedTargets(restoreDecision, snapshotRecord) {
  const targets = normalizeArray(restoreDecision.restoreTargets);
  const snapshotWorkspace = normalizeObject(snapshotRecord.workspaceReference);

  return targets.map((target) => {
    if (target === "project-state") {
      return {
        target,
        restored: true,
        stateVersion: snapshotRecord.versions?.stateVersion ?? null,
      };
    }

    if (target === "workspace-reference") {
      return {
        target,
        restored: true,
        workspaceId: snapshotWorkspace.workspaceId ?? null,
        workspaceArea: snapshotWorkspace.workspaceArea ?? "developer-workspace",
      };
    }

    if (target === "execution-graph") {
      return {
        target,
        restored: true,
        executionGraphVersion: snapshotRecord.versions?.executionGraphVersion ?? null,
      };
    }

    const linkedMetadataResult = buildLinkedMetadataResult(snapshotRecord, target);
    if (linkedMetadataResult) {
      return linkedMetadataResult;
    }

    return {
      target,
      restored: true,
    };
  });
}

function inferExecutionStatus(restoreDecision) {
  if (restoreDecision.canRestore !== true) {
    return "blocked";
  }

  if (restoreDecision.restoreMode === "partial") {
    return "executed-partial";
  }

  if (restoreDecision.restoreMode === "full") {
    return "executed-full";
  }

  return "blocked";
}

export function createProjectRollbackExecutionModule({
  restoreDecision = null,
  snapshotRecord = null,
} = {}) {
  const normalizedRestoreDecision = normalizeObject(restoreDecision);
  const normalizedSnapshotRecord = normalizeObject(snapshotRecord);
  const executionStatus = inferExecutionStatus(normalizedRestoreDecision);
  const appliedTargets =
    normalizedRestoreDecision.canRestore === true
      ? buildAppliedTargets(normalizedRestoreDecision, normalizedSnapshotRecord)
      : [];
  const restoredProjectState =
    normalizedRestoreDecision.canRestore === true
      ? buildRestoredProjectState(normalizedSnapshotRecord, normalizedRestoreDecision)
      : null;
  const restoredExecutionGraph =
    normalizedRestoreDecision.canRestore === true
      ? buildRestoredExecutionGraph(normalizedSnapshotRecord, normalizedRestoreDecision)
      : null;
  const restoredWorkspaceReference =
    normalizedRestoreDecision.canRestore === true
      ? buildRestoredWorkspaceReference(normalizedSnapshotRecord, normalizedRestoreDecision)
      : null;
  const linkedMetadataResults = appliedTargets.filter((target) => target.target === "linked-metadata");

  return {
    rollbackExecutionResult: {
      snapshotRecordId: normalizeString(normalizedSnapshotRecord.snapshotRecordId, null),
      rollbackExecutionId: `rollback-execution:${normalizeString(normalizedSnapshotRecord.snapshotRecordId, "unknown-snapshot")}`,
      restoreDecisionId: normalizeString(normalizedRestoreDecision.restoreDecisionId, null),
      executionStatus,
      executed: executionStatus !== "blocked",
      restoreMode: normalizeString(normalizedRestoreDecision.restoreMode, "blocked"),
      appliedTargets,
      restoredProjectState,
      restoredExecutionGraph,
      restoredWorkspaceReference:
        restoredWorkspaceReference && Object.keys(restoredWorkspaceReference).length > 0
          ? restoredWorkspaceReference
          : appliedTargets.find((target) => target.target === "workspace-reference") ?? null,
      linkedMetadataResults,
      blockedReason: executionStatus === "blocked" ? normalizeString(normalizedRestoreDecision.blockedReason, null) : null,
      summary: {
        restoredTargetCount: appliedTargets.length,
        restoredStateVersion: normalizedSnapshotRecord.versions?.stateVersion ?? null,
        restoredExecutionGraphVersion: normalizedSnapshotRecord.versions?.executionGraphVersion ?? null,
        restoredWorkspace: appliedTargets.some((target) => target.target === "workspace-reference"),
        restoredStateApplied: Boolean(restoredProjectState && Object.keys(restoredProjectState).length > 0),
        restoredExecutionGraphApplied: Boolean(restoredExecutionGraph && Object.keys(restoredExecutionGraph).length > 0),
      },
    },
  };
}
