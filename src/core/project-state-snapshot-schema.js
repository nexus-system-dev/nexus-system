function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function resolveStateVersion(projectState) {
  if (Number.isInteger(projectState.stateVersion) && projectState.stateVersion > 0) {
    return projectState.stateVersion;
  }

  if (Number.isInteger(projectState.version) && projectState.version > 0) {
    return projectState.version;
  }

  return 1;
}

function resolveExecutionGraphVersion(projectState, executionGraph) {
  if (Number.isInteger(projectState.executionGraphVersion) && projectState.executionGraphVersion > 0) {
    return projectState.executionGraphVersion;
  }

  const nodes = normalizeArray(executionGraph.nodes);
  const edges = normalizeArray(executionGraph.edges);
  return Math.max(1, nodes.length + edges.length);
}

export function defineProjectStateSnapshotSchema({
  projectState = null,
  executionGraph = null,
} = {}) {
  const normalizedProjectState = normalizeObject(projectState);
  const normalizedExecutionGraph = normalizeObject(executionGraph);
  const nodes = normalizeArray(normalizedExecutionGraph.nodes);
  const edges = normalizeArray(normalizedExecutionGraph.edges);
  const stateVersion = resolveStateVersion(normalizedProjectState);
  const executionGraphVersion = resolveExecutionGraphVersion(normalizedProjectState, normalizedExecutionGraph);
  const projectId = normalizeString(normalizedProjectState.projectId, "unknown-project");
  const workspaceId = normalizeString(normalizedProjectState.workspaceId, null);

  return {
    projectStateSnapshot: {
      snapshotId: `project-state-snapshot:${projectId}:v${stateVersion}`,
      projectId,
      stateVersion,
      executionGraphVersion,
      workspaceReference: {
        workspaceId,
        workspaceArea: normalizeString(normalizedProjectState.workspaceArea, "developer-workspace"),
        workspaceVisibility: normalizeString(normalizedProjectState.workspaceVisibility, "workspace"),
      },
      restoreMetadata: {
        canRestoreFull: true,
        canRestorePartial: nodes.length > 0 || edges.length > 0,
        requiresApproval:
          normalizedProjectState.approvalStatus === "pending"
          || normalizedProjectState.approvalStatus === "missing",
        restoreScope:
          nodes.length > 0 || edges.length > 0
            ? ["project-state", "execution-graph", "workspace-reference"]
            : ["project-state"],
      },
      stateSummary: {
        lifecyclePhase: normalizedProjectState.lifecyclePhase ?? "unknown",
        hasArtifacts: Boolean(normalizedProjectState.hasArtifacts),
        hasBlockers: Boolean(normalizedProjectState.hasBlockers),
        updatedAt: normalizeString(normalizedProjectState.updatedAt, null),
      },
      artifactSummary: {
        artifactCount: normalizedProjectState.artifactCount ?? 0,
        outputPaths: normalizeArray(normalizedProjectState.outputPaths).map((value) => normalizeString(value, null)).filter(Boolean),
        packageFormat: normalizeString(normalizedProjectState.packageFormat, null),
        packagedFileCount: normalizedProjectState.packagedFileCount ?? 0,
        verificationStatus: normalizeString(normalizedProjectState.verificationStatus, "unknown"),
      },
      executionGraphSummary: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        runningNodes: nodes.filter((node) => node?.status === "running").length,
        blockedNodes: nodes.filter((node) => node?.status === "blocked").length,
      },
      restorePayload: {
        projectState: normalizedProjectState,
        executionGraph: normalizedExecutionGraph,
        workspaceReference: {
        workspaceId,
        workspaceArea: normalizeString(normalizedProjectState.workspaceArea, "developer-workspace"),
        workspaceVisibility: normalizeString(normalizedProjectState.workspaceVisibility, "workspace"),
        },
        linkedMetadata: {
          artifactSummary: {
            artifactCount: normalizedProjectState.artifactCount ?? 0,
            outputPaths: normalizeArray(normalizedProjectState.outputPaths).map((value) => normalizeString(value, null)).filter(Boolean),
            packageFormat: normalizeString(normalizedProjectState.packageFormat, null),
            packagedFileCount: normalizedProjectState.packagedFileCount ?? 0,
            verificationStatus: normalizeString(normalizedProjectState.verificationStatus, "unknown"),
          },
        },
      },
      summary: {
        projectId,
        workspaceId,
        stateVersion,
        executionGraphVersion,
        isRestorable: true,
      },
    },
  };
}
