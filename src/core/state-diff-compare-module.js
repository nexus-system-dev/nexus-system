function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function compareScalar(label, before, after) {
  return {
    label,
    before: before ?? null,
    after: after ?? null,
    changed: before !== after,
  };
}

function compareArrays(label, before, after) {
  const normalizedBefore = normalizeArray(before);
  const normalizedAfter = normalizeArray(after);

  return {
    label,
    before: normalizedBefore,
    after: normalizedAfter,
    changed:
      normalizedBefore.length !== normalizedAfter.length
      || normalizedBefore.some((entry, index) => entry !== normalizedAfter[index]),
  };
}

export function createStateDiffAndCompareModule({
  snapshotRecord = null,
  comparisonTarget = null,
} = {}) {
  const normalizedSnapshotRecord = normalizeObject(snapshotRecord);
  const normalizedComparisonTarget = normalizeObject(comparisonTarget);
  const baselineVersions = normalizeObject(normalizedSnapshotRecord.versions);
  const baselineArtifacts = normalizeObject(normalizedSnapshotRecord.artifactSummary);
  const baselineWorkspace = normalizeObject(normalizedSnapshotRecord.workspaceReference);
  const targetVersions = normalizeObject(normalizedComparisonTarget.versions);
  const targetArtifacts = normalizeObject(normalizedComparisonTarget.artifactSummary);
  const targetWorkspace = normalizeObject(normalizedComparisonTarget.workspaceReference);

  const stateChanges = [
    compareScalar("stateVersion", baselineVersions.stateVersion ?? 1, targetVersions.stateVersion ?? 1),
    compareScalar("workspaceArea", baselineWorkspace.workspaceArea ?? "developer-workspace", targetWorkspace.workspaceArea ?? "developer-workspace"),
    compareScalar("workspaceVisibility", baselineWorkspace.workspaceVisibility ?? "workspace", targetWorkspace.workspaceVisibility ?? "workspace"),
  ];
  const graphChanges = [
    compareScalar("executionGraphVersion", baselineVersions.executionGraphVersion ?? 1, targetVersions.executionGraphVersion ?? 1),
    compareScalar("runningNodes", normalizedSnapshotRecord.executionGraphSummary?.runningNodes ?? 0, normalizedComparisonTarget.executionGraphSummary?.runningNodes ?? 0),
    compareScalar("blockedNodes", normalizedSnapshotRecord.executionGraphSummary?.blockedNodes ?? 0, normalizedComparisonTarget.executionGraphSummary?.blockedNodes ?? 0),
  ];
  const artifactChanges = [
    compareScalar("artifactCount", baselineArtifacts.artifactCount ?? 0, targetArtifacts.artifactCount ?? 0),
    compareScalar("packageFormat", baselineArtifacts.packageFormat ?? null, targetArtifacts.packageFormat ?? null),
    compareScalar("packagedFileCount", baselineArtifacts.packagedFileCount ?? 0, targetArtifacts.packagedFileCount ?? 0),
    compareScalar("verificationStatus", baselineArtifacts.verificationStatus ?? "unknown", targetArtifacts.verificationStatus ?? "unknown"),
    compareArrays("outputPaths", baselineArtifacts.outputPaths ?? [], targetArtifacts.outputPaths ?? []),
  ];

  return {
    stateDiff: {
      stateDiffId: `state-diff:${normalizeString(normalizedSnapshotRecord.snapshotRecordId, "unknown-snapshot")}`,
      snapshotRecordId: normalizeString(normalizedSnapshotRecord.snapshotRecordId, null),
      comparisonTargetId: normalizeString(normalizedComparisonTarget.comparisonTargetId, null),
      stateChanges,
      graphChanges,
      artifactChanges,
      summary: {
        hasStateChanges: stateChanges.some((change) => change.changed),
        hasGraphChanges: graphChanges.some((change) => change.changed),
        hasArtifactChanges: artifactChanges.some((change) => change.changed),
        totalChanges:
          stateChanges.filter((change) => change.changed).length
          + graphChanges.filter((change) => change.changed).length
          + artifactChanges.filter((change) => change.changed).length,
      },
    },
  };
}
