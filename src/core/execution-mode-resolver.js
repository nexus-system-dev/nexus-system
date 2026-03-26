function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function findTopologyMode(executionTopology, mode) {
  return normalizeArray(executionTopology?.topologies).find((topology) => topology.mode === mode) ?? null;
}

function findBranchMode(executionTopology) {
  return normalizeArray(executionTopology?.topologies).find((topology) => topology.topologyType === "branch") ?? null;
}

function requiresControlledExecution(projectState = {}) {
  return Boolean(
    projectState.policyTrace?.requiresApproval
    || normalizeArray(projectState.riskFlags).some((flag) => ["deployment-impact", "migration-impact", "infra-impact"].includes(flag))
    || projectState.decisionIntelligence?.summary?.requiresApproval,
  );
}

function chooseMode({ executionTopology, taskType, projectState, cloudWorkspaceModel, localDevelopmentBridge, remoteMacRunner }) {
  const normalizedTaskType = typeof taskType === "string" ? taskType : "generic";
  const normalizedProjectState = normalizeObject(projectState);

  if (
    (normalizedProjectState.domain === "mobile-app" || ["mobile", "ios", "release"].includes(normalizedTaskType))
    && remoteMacRunner?.summary?.isReady
  ) {
    return {
      mode: remoteMacRunner.connection?.mode ?? "xcode",
      source: "remote-mac-runner",
      reason: "Apple-specific tooling requires remote Mac execution",
    };
  }

  if (
    ["frontend", "backend", "ops", "content", "growth"].includes(normalizedTaskType)
    && localDevelopmentBridge?.summary?.isReady
    && localDevelopmentBridge.capabilities?.supportsCommandExecution
  ) {
    return {
      mode: localDevelopmentBridge.connection?.mode ?? "local-terminal",
      source: "local-development-bridge",
      reason: "Local bridge is available for iterative development work",
    };
  }

  if (requiresControlledExecution(normalizedProjectState)) {
    const branchMode = findBranchMode(executionTopology);
    if (branchMode) {
      return {
        mode: branchMode.mode,
        source: "execution-topology",
        reason: "Controlled branch execution is preferred for risky or approval-gated work",
      };
    }
  }

  if (cloudWorkspaceModel?.summary?.isReady) {
    return {
      mode: cloudWorkspaceModel.surface?.surfaceId ?? executionTopology?.defaultMode ?? "sandbox",
      source: "cloud-workspace",
      reason: "Cloud workspace is ready and remains the primary execution environment",
    };
  }

  const defaultTopology = findTopologyMode(executionTopology, executionTopology?.defaultMode);
  if (defaultTopology) {
    return {
      mode: defaultTopology.mode,
      source: "execution-topology",
      reason: "Default execution topology was selected",
    };
  }

  return {
    mode: "agent",
    source: "fallback",
    reason: "No specialized execution surface was ready, falling back to agent mode",
  };
}

export function createExecutionModeResolver({
  executionTopology = null,
  taskType = "generic",
  projectState = null,
  cloudWorkspaceModel = null,
  localDevelopmentBridge = null,
  remoteMacRunner = null,
} = {}) {
  const normalizedExecutionTopology = normalizeObject(executionTopology);
  const normalizedProjectState = normalizeObject(projectState);
  const normalizedCloudWorkspaceModel = normalizeObject(cloudWorkspaceModel);
  const normalizedLocalDevelopmentBridge = normalizeObject(localDevelopmentBridge);
  const normalizedRemoteMacRunner = normalizeObject(remoteMacRunner);

  const selected = chooseMode({
    executionTopology: normalizedExecutionTopology,
    taskType,
    projectState: normalizedProjectState,
    cloudWorkspaceModel: normalizedCloudWorkspaceModel,
    localDevelopmentBridge: normalizedLocalDevelopmentBridge,
    remoteMacRunner: normalizedRemoteMacRunner,
  });

  return {
    executionModeDecision: {
      decisionId: `execution-mode:${normalizedExecutionTopology.projectId ?? normalizedProjectState.projectId ?? "unknown-project"}`,
      projectId: normalizedExecutionTopology.projectId ?? normalizedProjectState.projectId ?? null,
      taskType,
      selectedMode: selected.mode,
      selectedSource: selected.source,
      reason: selected.reason,
      alternatives: normalizeArray(normalizedExecutionTopology.topologies)
        .map((topology) => topology.mode)
        .filter((mode) => mode !== selected.mode),
      summary: {
        isControlled: ["temp-branch", "sandbox", "xcode"].includes(selected.mode),
        prefersPrimaryWorkspace: selected.source === "cloud-workspace",
        hasLocalOption: Boolean(normalizedLocalDevelopmentBridge.summary?.isReady),
      },
    },
  };
}
