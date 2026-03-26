function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

const MODE_TO_TOPOLOGY = {
  agent: {
    topologyType: "cloud",
    runnerType: "agent-runtime",
    capabilities: ["assignment-execution", "orchestration"],
  },
  sandbox: {
    topologyType: "cloud",
    runnerType: "sandbox",
    capabilities: ["isolated-run", "command-execution"],
  },
  "temp-branch": {
    topologyType: "branch",
    runnerType: "branch-runner",
    capabilities: ["branch-run", "command-execution"],
  },
  container: {
    topologyType: "container",
    runnerType: "container-runner",
    capabilities: ["container-run", "command-execution"],
  },
  "local-terminal": {
    topologyType: "local",
    runnerType: "local-runner",
    capabilities: ["local-command-execution"],
  },
  xcode: {
    topologyType: "remote-specialized",
    runnerType: "remote-xcode-runner",
    capabilities: ["apple-build", "mobile-signing"],
  },
  "ci-runner": {
    topologyType: "remote-specialized",
    runnerType: "ci-runner",
    capabilities: ["pipeline-run", "build-verification"],
  },
  "execution-surface": {
    topologyType: "cloud",
    runnerType: "generic-execution-surface",
    capabilities: ["bootstrap"],
  },
};

function createTopologyEntry(mode, resolvedSurfaceMap, environmentConfig) {
  const fromMode = MODE_TO_TOPOLOGY[mode] ?? {
    topologyType: "cloud",
    runnerType: mode,
    capabilities: [],
  };
  const resolvedSurface = resolvedSurfaceMap.get(mode) ?? null;

  return {
    mode,
    topologyType: fromMode.topologyType,
    runnerType: fromMode.runnerType,
    surfaceId: resolvedSurface?.surfaceId ?? mode,
    surfaceType: resolvedSurface?.surfaceType ?? "execution-surface",
    readiness: resolvedSurface?.readiness ?? "planned",
    capabilities: [...new Set([...(fromMode.capabilities ?? []), ...(resolvedSurface?.supports ?? [])])],
    environment: {
      provider: environmentConfig.provider ?? null,
      target: environmentConfig.target ?? null,
      runtimeSource: environmentConfig.runtimeSource ?? null,
    },
  };
}

export function defineExecutionTopologySchema({
  executionSurfaces = [],
  environmentConfig = null,
} = {}) {
  const normalizedExecutionSurfaces = normalizeArray(executionSurfaces);
  const normalizedEnvironmentConfig = normalizeObject(environmentConfig);
  const modes = normalizeArray(normalizedEnvironmentConfig.executionModes);

  const resolvedSurfaceMap = new Map(
    normalizedExecutionSurfaces
      .map((surface) => {
        const normalized = normalizeObject(surface);
        const mode = normalized.dispatchMode ?? normalized.resolvedSurface?.surfaceId ?? null;
        return [mode, normalizeObject(normalized.resolvedSurface)];
      })
      .filter(([mode]) => Boolean(mode)),
  );

  const topologies = modes.map((mode) => createTopologyEntry(mode, resolvedSurfaceMap, normalizedEnvironmentConfig));
  const defaultTopology =
    topologies.find((topology) => topology.mode === normalizedEnvironmentConfig.defaultMode)
    ?? topologies[0]
    ?? null;

  return {
    executionTopology: {
      topologyId: `execution-topology:${normalizedEnvironmentConfig.projectId ?? "unknown-project"}`,
      projectId: normalizedEnvironmentConfig.projectId ?? null,
      defaultMode: defaultTopology?.mode ?? normalizedEnvironmentConfig.defaultMode ?? null,
      topologies,
      summary: {
        totalTopologies: topologies.length,
        includesLocal: topologies.some((topology) => topology.topologyType === "local"),
        includesBranch: topologies.some((topology) => topology.topologyType === "branch"),
        includesRemoteSpecialized: topologies.some((topology) => topology.topologyType === "remote-specialized"),
      },
    },
  };
}
