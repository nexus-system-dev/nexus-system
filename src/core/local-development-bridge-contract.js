function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveLocalTopology(executionTopology) {
  const topologies = normalizeArray(executionTopology?.topologies);

  return topologies.find((topology) => topology.topologyType === "local") ?? null;
}

export function createLocalDevelopmentBridgeContract({
  executionTopology = null,
  localEnvironmentMetadata = null,
} = {}) {
  const normalizedExecutionTopology = normalizeObject(executionTopology);
  const normalizedLocalEnvironmentMetadata = normalizeObject(localEnvironmentMetadata);
  const localTopology = resolveLocalTopology(normalizedExecutionTopology);

  const ide = normalizeObject(normalizedLocalEnvironmentMetadata.ide);
  const runtime = normalizeObject(normalizedLocalEnvironmentMetadata.runtime);
  const sync = normalizeObject(normalizedLocalEnvironmentMetadata.sync);

  return {
    localDevelopmentBridge: {
      bridgeId: `local-bridge:${normalizedExecutionTopology.projectId ?? "unknown-project"}`,
      projectId: normalizedExecutionTopology.projectId ?? null,
      topologyId: normalizedExecutionTopology.topologyId ?? null,
      connection: {
        mode: localTopology?.mode ?? "local-terminal",
        runnerType: localTopology?.runnerType ?? "local-runner",
        readiness: localTopology?.readiness ?? "planned",
        isConnected: normalizedLocalEnvironmentMetadata.isConnected ?? Boolean(localTopology),
      },
      environment: {
        workspacePath: normalizedLocalEnvironmentMetadata.workspacePath ?? null,
        ideName: ide.name ?? null,
        ideType: ide.type ?? null,
        runtimeName: runtime.name ?? null,
        os: normalizedLocalEnvironmentMetadata.os ?? null,
      },
      capabilities: {
        supportedActions: normalizeArray(localTopology?.capabilities),
        supportsSync: sync.enabled ?? false,
        supportsWriteback: sync.writeback ?? false,
        supportsCommandExecution: normalizeArray(localTopology?.capabilities).includes("local-command-execution"),
      },
      guardrails: {
        isPrimaryWorkspace: false,
        requiresNexusContext: true,
        handoffMode: normalizedLocalEnvironmentMetadata.handoffMode ?? "optional-bridge",
      },
      summary: {
        hasIdeBinding: Boolean(ide.name),
        hasWorkspacePath: Boolean(normalizedLocalEnvironmentMetadata.workspacePath),
        isReady: (normalizedLocalEnvironmentMetadata.isConnected ?? false) || localTopology?.readiness === "ready",
      },
    },
  };
}
