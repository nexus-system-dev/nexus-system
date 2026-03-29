function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
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
  const projectId = normalizedProjectState.projectId ?? "unknown-project";
  const workspaceId = normalizedProjectState.workspaceId ?? null;

  return {
    projectStateSnapshot: {
      snapshotId: `project-state-snapshot:${projectId}:v${stateVersion}`,
      projectId,
      stateVersion,
      executionGraphVersion,
      workspaceReference: {
        workspaceId,
        workspaceArea: normalizedProjectState.workspaceArea ?? "developer-workspace",
        workspaceVisibility: normalizedProjectState.workspaceVisibility ?? "workspace",
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
        updatedAt: normalizedProjectState.updatedAt ?? null,
      },
      artifactSummary: {
        artifactCount: normalizedProjectState.artifactCount ?? 0,
        outputPaths: normalizeArray(normalizedProjectState.outputPaths),
        packageFormat: normalizedProjectState.packageFormat ?? null,
        packagedFileCount: normalizedProjectState.packagedFileCount ?? 0,
        verificationStatus: normalizedProjectState.verificationStatus ?? "unknown",
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
          workspaceArea: normalizedProjectState.workspaceArea ?? "developer-workspace",
          workspaceVisibility: normalizedProjectState.workspaceVisibility ?? "workspace",
        },
        linkedMetadata: {
          artifactSummary: {
            artifactCount: normalizedProjectState.artifactCount ?? 0,
            outputPaths: normalizeArray(normalizedProjectState.outputPaths),
            packageFormat: normalizedProjectState.packageFormat ?? null,
            packagedFileCount: normalizedProjectState.packagedFileCount ?? 0,
            verificationStatus: normalizedProjectState.verificationStatus ?? "unknown",
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
