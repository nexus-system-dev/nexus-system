import { mapSandboxLevelToSurfacePolicy } from "./agent-sandbox-level-mapper.js";
import { resolveTaskBoundaryRequirements } from "./task-boundary-requirements.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueStrings(values = []) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim().length > 0))];
}

function rankSandboxLevel(level) {
  return {
    "no-execution": 0,
    "read-only": 1,
    sandbox: 2,
    "controlled-write": 3,
    privileged: 4,
  }[level] ?? 1;
}

function resolveAvailableSurfaces({
  executionTopology = null,
  cloudWorkspaceModel = null,
  localDevelopmentBridge = null,
  remoteMacRunner = null,
} = {}) {
  const normalizedExecutionTopology = normalizeObject(executionTopology);
  const normalizedCloudWorkspaceModel = normalizeObject(cloudWorkspaceModel);
  const normalizedLocalDevelopmentBridge = normalizeObject(localDevelopmentBridge);
  const normalizedRemoteMacRunner = normalizeObject(remoteMacRunner);

  const fromTopology = normalizeArray(normalizedExecutionTopology.topologies)
    .filter((topology) => ["ready", "partial"].includes(topology?.readiness ?? "planned"))
    .map((topology) => topology.mode);

  const available = new Set(fromTopology);

  if (normalizedCloudWorkspaceModel.summary?.isReady) {
    available.add(normalizedCloudWorkspaceModel.surface?.surfaceId ?? "sandbox");
  }
  if (normalizedLocalDevelopmentBridge.summary?.isReady && normalizedLocalDevelopmentBridge.capabilities?.supportsCommandExecution) {
    available.add(normalizedLocalDevelopmentBridge.connection?.mode ?? "local-terminal");
  }
  if (normalizedRemoteMacRunner.summary?.isReady) {
    available.add(normalizedRemoteMacRunner.connection?.mode ?? "xcode");
  }
  if (normalizeArray(normalizedExecutionTopology.topologies).some((topology) => topology.mode === "agent")) {
    available.add("agent");
  }

  return uniqueStrings([...available]);
}

function selectSurface({ preferredSurfaces, allowedSurfaces, compatibleSurfaces, availableSurfaces }) {
  const allowedCompatible = compatibleSurfaces.filter((surface) => allowedSurfaces.includes(surface));
  const availableAllowedCompatible = allowedCompatible.filter((surface) => availableSurfaces.includes(surface));

  const selectedSurface = preferredSurfaces.find((surface) => availableAllowedCompatible.includes(surface))
    ?? availableAllowedCompatible[0]
    ?? null;

  return {
    selectedSurface,
    allowedCompatible,
    availableAllowedCompatible,
  };
}

export function createAgentSandboxPolicyResolver({
  agentGovernancePolicy = null,
  taskType = "generic",
  executionTopology = null,
  cloudWorkspaceModel = null,
  localDevelopmentBridge = null,
  remoteMacRunner = null,
} = {}) {
  const normalizedAgentGovernancePolicy = normalizeObject(agentGovernancePolicy);
  const surfacePolicy = mapSandboxLevelToSurfacePolicy(normalizedAgentGovernancePolicy);
  const taskRequirements = resolveTaskBoundaryRequirements(taskType);
  const availableSurfaces = resolveAvailableSurfaces({
    executionTopology,
    cloudWorkspaceModel,
    localDevelopmentBridge,
    remoteMacRunner,
  });
  const reasons = [];

  if (surfacePolicy.sandboxLevel === "no-execution") {
    reasons.push("Agent policy blocks execution entirely under no-execution sandbox level.");
    return {
      sandboxDecision: {
        sandboxDecisionId: `sandbox-decision:${normalizedAgentGovernancePolicy.agentType ?? "unknown-agent"}:${taskRequirements.taskType}`,
        agentType: normalizedAgentGovernancePolicy.agentType ?? "unknown-agent",
        taskType: taskRequirements.taskType,
        selectedSurface: "no-execution",
        decision: "blocked",
        allowed: false,
        requiresEscalation: false,
        selectedBoundary: surfacePolicy.boundaries["no-execution"],
        alternatives: [],
        reason: reasons,
        summary: `Execution is blocked for ${taskRequirements.taskType} because the agent policy allows no execution.`,
      },
    };
  }

  if (rankSandboxLevel(surfacePolicy.sandboxLevel) < rankSandboxLevel(taskRequirements.minimumSandboxLevel)) {
    const escalatableAlternatives = taskRequirements.compatibleSurfaces.filter((surface) => availableSurfaces.includes(surface));
    reasons.push(
      `Task type ${taskRequirements.taskType} requires at least ${taskRequirements.minimumSandboxLevel}, but policy ceiling is ${surfacePolicy.sandboxLevel}.`,
    );

    return {
      sandboxDecision: {
        sandboxDecisionId: `sandbox-decision:${normalizedAgentGovernancePolicy.agentType ?? "unknown-agent"}:${taskRequirements.taskType}`,
        agentType: normalizedAgentGovernancePolicy.agentType ?? "unknown-agent",
        taskType: taskRequirements.taskType,
        selectedSurface: null,
        decision: escalatableAlternatives.length > 0 ? "requires-escalation" : "blocked",
        allowed: false,
        requiresEscalation: escalatableAlternatives.length > 0,
        selectedBoundary: null,
        alternatives: escalatableAlternatives,
        reason: reasons,
        summary:
          escalatableAlternatives.length > 0
            ? `Execution for ${taskRequirements.taskType} requires escalation above ${surfacePolicy.sandboxLevel}.`
            : `Execution for ${taskRequirements.taskType} is blocked because no compatible privileged surface is available.`,
      },
    };
  }

  const { selectedSurface, allowedCompatible, availableAllowedCompatible } = selectSurface({
    preferredSurfaces: surfacePolicy.preferredSurfaces.filter((surface) => taskRequirements.compatibleSurfaces.includes(surface))
      .concat(taskRequirements.preferredSurfaces.filter((surface) => surfacePolicy.allowedSurfaces.includes(surface))),
    allowedSurfaces: surfacePolicy.allowedSurfaces,
    compatibleSurfaces: taskRequirements.compatibleSurfaces,
    availableSurfaces,
  });

  if (!selectedSurface) {
    reasons.push(
      `No available execution surface satisfies task type ${taskRequirements.taskType} under sandbox level ${surfacePolicy.sandboxLevel}.`,
    );
    return {
      sandboxDecision: {
        sandboxDecisionId: `sandbox-decision:${normalizedAgentGovernancePolicy.agentType ?? "unknown-agent"}:${taskRequirements.taskType}`,
        agentType: normalizedAgentGovernancePolicy.agentType ?? "unknown-agent",
        taskType: taskRequirements.taskType,
        selectedSurface: null,
        decision: "blocked",
        allowed: false,
        requiresEscalation: false,
        selectedBoundary: null,
        alternatives: availableAllowedCompatible,
        reason: reasons,
        summary: `Execution for ${taskRequirements.taskType} is blocked because no compatible allowed surface is available.`,
      },
    };
  }

  reasons.push(
    `Policy ceiling ${surfacePolicy.sandboxLevel} allows ${allowedCompatible.join(", ") || "no compatible surfaces"} for task type ${taskRequirements.taskType}.`,
  );
  reasons.push(
    `Selected surface ${selectedSurface} because it is the highest-priority available option that satisfies the task capability ${taskRequirements.requiredCapability}.`,
  );

  return {
    sandboxDecision: {
      sandboxDecisionId: `sandbox-decision:${normalizedAgentGovernancePolicy.agentType ?? "unknown-agent"}:${taskRequirements.taskType}`,
      agentType: normalizedAgentGovernancePolicy.agentType ?? "unknown-agent",
      taskType: taskRequirements.taskType,
      selectedSurface,
      decision: "allowed",
      allowed: true,
      requiresEscalation: false,
      selectedBoundary: surfacePolicy.boundaries[selectedSurface] ?? null,
      alternatives: availableAllowedCompatible.filter((surface) => surface !== selectedSurface),
      reason: reasons,
      summary: `Execution for ${taskRequirements.taskType} is allowed on ${selectedSurface} under ${surfacePolicy.sandboxLevel} policy.`,
    },
  };
}
