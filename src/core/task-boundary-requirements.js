function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

const TASK_TYPES = new Set([
  "generic",
  "frontend",
  "backend",
  "ops",
  "content",
  "growth",
  "mobile",
  "ios",
  "release",
]);

const TASK_REQUIREMENTS = {
  generic: {
    preferredSurfaces: ["agent", "sandbox"],
    compatibleSurfaces: ["agent", "sandbox", "container"],
    minimumSandboxLevel: "read-only",
    requiredCapability: "read-safe-execution",
  },
  frontend: {
    preferredSurfaces: ["sandbox", "temp-branch"],
    compatibleSurfaces: ["sandbox", "container", "temp-branch"],
    minimumSandboxLevel: "sandbox",
    requiredCapability: "command-execution",
  },
  backend: {
    preferredSurfaces: ["temp-branch", "sandbox"],
    compatibleSurfaces: ["temp-branch", "sandbox", "container"],
    minimumSandboxLevel: "sandbox",
    requiredCapability: "controlled-command-execution",
  },
  ops: {
    preferredSurfaces: ["temp-branch", "ci-runner", "local-terminal"],
    compatibleSurfaces: ["temp-branch", "ci-runner", "local-terminal", "sandbox"],
    minimumSandboxLevel: "controlled-write",
    requiredCapability: "operational-execution",
  },
  content: {
    preferredSurfaces: ["agent", "sandbox"],
    compatibleSurfaces: ["agent", "sandbox"],
    minimumSandboxLevel: "read-only",
    requiredCapability: "content-safe-execution",
  },
  growth: {
    preferredSurfaces: ["agent", "sandbox", "temp-branch"],
    compatibleSurfaces: ["agent", "sandbox", "temp-branch"],
    minimumSandboxLevel: "read-only",
    requiredCapability: "iterative-execution",
  },
  mobile: {
    preferredSurfaces: ["xcode", "ci-runner"],
    compatibleSurfaces: ["xcode", "ci-runner"],
    minimumSandboxLevel: "privileged",
    requiredCapability: "mobile-build-execution",
  },
  ios: {
    preferredSurfaces: ["xcode"],
    compatibleSurfaces: ["xcode"],
    minimumSandboxLevel: "privileged",
    requiredCapability: "apple-build-execution",
  },
  release: {
    preferredSurfaces: ["ci-runner", "local-terminal"],
    compatibleSurfaces: ["ci-runner", "local-terminal", "xcode"],
    minimumSandboxLevel: "privileged",
    requiredCapability: "release-execution",
  },
};

export function normalizeAgentTaskType(taskType = null) {
  const raw = normalizeString(taskType, "generic")?.toLowerCase() ?? "generic";
  return TASK_TYPES.has(raw) ? raw : "generic";
}

export function resolveTaskBoundaryRequirements(taskType = null) {
  const normalizedTaskType = normalizeAgentTaskType(taskType);
  return {
    taskType: normalizedTaskType,
    ...TASK_REQUIREMENTS[normalizedTaskType],
  };
}
