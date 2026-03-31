function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

const SURFACE_BOUNDARIES = {
  "no-execution": "no-execution-boundary",
  agent: "agent-read-boundary",
  sandbox: "sandbox-boundary",
  "temp-branch": "branch-boundary",
  container: "container-boundary",
  "local-terminal": "local-boundary",
  xcode: "xcode-boundary",
  "ci-runner": "ci-boundary",
};

export function mapSandboxLevelToSurfacePolicy(agentGovernancePolicy = null) {
  const sandboxLevel = agentGovernancePolicy?.sandboxLevel ?? "read-only";
  const allowedTools = normalizeArray(agentGovernancePolicy?.allowedTools);
  const hasLocalTerminalPermission = allowedTools.includes("run-local-command");

  if (sandboxLevel === "no-execution") {
    return {
      sandboxLevel,
      preferredSurfaces: ["no-execution"],
      allowedSurfaces: ["no-execution"],
      boundaries: SURFACE_BOUNDARIES,
    };
  }

  if (sandboxLevel === "read-only") {
    return {
      sandboxLevel,
      preferredSurfaces: ["agent"],
      allowedSurfaces: ["agent"],
      boundaries: SURFACE_BOUNDARIES,
    };
  }

  if (sandboxLevel === "sandbox") {
    return {
      sandboxLevel,
      preferredSurfaces: ["sandbox", "container"],
      allowedSurfaces: ["sandbox", "container"],
      boundaries: SURFACE_BOUNDARIES,
    };
  }

  if (sandboxLevel === "controlled-write") {
    return {
      sandboxLevel,
      preferredSurfaces: ["temp-branch", "sandbox"],
      allowedSurfaces: hasLocalTerminalPermission
        ? ["temp-branch", "sandbox", "local-terminal"]
        : ["temp-branch", "sandbox"],
      boundaries: SURFACE_BOUNDARIES,
    };
  }

  return {
    sandboxLevel: "privileged",
    preferredSurfaces: ["ci-runner", "temp-branch", "local-terminal", "xcode"],
    allowedSurfaces: ["ci-runner", "temp-branch", "local-terminal", "xcode", "sandbox", "container", "agent"],
    boundaries: SURFACE_BOUNDARIES,
  };
}
