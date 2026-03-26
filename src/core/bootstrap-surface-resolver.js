const SURFACE_REGISTRY = {
  "agent-runtime": {
    surfaceId: "agent-runtime",
    surfaceType: "agent",
    supports: ["bootstrap", "assignment-execution"],
    readiness: "ready",
  },
  sandbox: {
    surfaceId: "sandbox",
    surfaceType: "execution-surface",
    supports: ["bootstrap", "command-execution", "isolated-run"],
    readiness: "partial",
  },
  "temp-branch": {
    surfaceId: "temp-branch",
    surfaceType: "execution-surface",
    supports: ["bootstrap", "branch-run", "command-execution"],
    readiness: "partial",
  },
  container: {
    surfaceId: "container",
    surfaceType: "execution-surface",
    supports: ["bootstrap", "container-run", "command-execution"],
    readiness: "partial",
  },
  "execution-surface": {
    surfaceId: "execution-surface",
    surfaceType: "execution-surface",
    supports: ["bootstrap"],
    readiness: "partial",
  },
};

export function createBootstrapSurfaceResolver({
  executionRequest = null,
} = {}) {
  const dispatchMode = executionRequest?.dispatchMode ?? "execution-surface";
  const surface = SURFACE_REGISTRY[dispatchMode] ?? SURFACE_REGISTRY["execution-surface"];

  return {
    requestId: executionRequest?.requestId ?? null,
    taskId: executionRequest?.taskId ?? null,
    targetType: executionRequest?.targetType ?? null,
    targetId: executionRequest?.targetId ?? null,
    dispatchMode,
    resolvedSurface: {
      ...surface,
      targetId: executionRequest?.targetId ?? null,
    },
  };
}
