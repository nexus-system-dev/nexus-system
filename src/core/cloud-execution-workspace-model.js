function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveCloudTopology(executionTopology) {
  const topologies = normalizeArray(executionTopology?.topologies);

  return (
    topologies.find((topology) => topology.topologyType === "cloud" && topology.readiness === "ready")
    ?? topologies.find((topology) => topology.topologyType === "cloud")
    ?? null
  );
}

export function createCloudExecutionWorkspaceModel({
  executionTopology = null,
  projectState = null,
} = {}) {
  const normalizedExecutionTopology = normalizeObject(executionTopology);
  const normalizedProjectState = normalizeObject(projectState);
  const cloudTopology = resolveCloudTopology(normalizedExecutionTopology);
  const storageRecord = normalizeObject(normalizedProjectState.storageRecord);
  const executionResult = normalizeObject(normalizedProjectState.bootstrapExecutionResult);
  const executionMetadata = normalizeObject(normalizedProjectState.bootstrapExecutionMetadata);
  const artifacts = normalizeArray(normalizedProjectState.bootstrapArtifacts);

  const projectId = normalizedProjectState.projectId ?? normalizedExecutionTopology.projectId ?? "unknown-project";

  return {
    cloudWorkspaceModel: {
      workspaceId: `cloud-workspace:${projectId}`,
      projectId,
      topologyId: normalizedExecutionTopology.topologyId ?? null,
      surface: {
        topologyType: cloudTopology?.topologyType ?? "cloud",
        runnerType: cloudTopology?.runnerType ?? null,
        surfaceId: cloudTopology?.surfaceId ?? null,
        surfaceType: cloudTopology?.surfaceType ?? "execution-surface",
        readiness: cloudTopology?.readiness ?? "planned",
        capabilities: normalizeArray(cloudTopology?.capabilities),
      },
      filesystem: {
        rootPath: storageRecord.storagePath ?? `storage/projects/${projectId}`,
        storageDriver: storageRecord.storageDriver ?? "filesystem",
        fileCount: storageRecord.summary?.totalStoredItems ?? 0,
        artifactCount: storageRecord.summary?.artifactCount ?? artifacts.length,
      },
      commandRuntime: {
        status: executionResult.status ?? "idle",
        commandCount: executionMetadata.commandCount ?? executionResult.commandCount ?? 0,
        executedAt: executionResult.executedAt ?? executionMetadata.executedAt ?? null,
        supportsWriteback: normalizeArray(cloudTopology?.capabilities).includes("command-execution"),
      },
      isolation: {
        mode: cloudTopology?.runnerType ?? "sandbox",
        isIsolated: true,
        runScope: storageRecord.storageScope ?? "project",
      },
      persistence: {
        storageRecordId: storageRecord.storageRecordId ?? null,
        retentionPolicy: storageRecord.retentionPolicy ?? "project-lifecycle",
        artifactIds: artifacts.map((artifact) => artifact.artifactId ?? artifact.id ?? artifact.name ?? null).filter(Boolean),
      },
      summary: {
        isReady: cloudTopology?.readiness === "ready" || cloudTopology?.readiness === "partial",
        hasArtifacts: artifacts.length > 0 || (storageRecord.summary?.artifactCount ?? 0) > 0,
        isWritable: normalizeArray(cloudTopology?.capabilities).includes("command-execution"),
      },
    },
  };
}
