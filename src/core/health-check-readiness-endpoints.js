function normalizeDependency(dependency, index) {
  const normalizeString = (value, fallback = null) =>
    typeof value === "string" && value.trim() ? value.trim() : fallback;

  if (!dependency || typeof dependency !== "object") {
    return {
      dependencyId: `dependency-${index + 1}`,
      name: `dependency-${index + 1}`,
      status: "unknown",
      readiness: "unknown",
      critical: false,
      details: [],
    };
  }

  const status = dependency.status ?? "unknown";
  const normalizedStatus = normalizeString(status, "unknown").toLowerCase();
  const readiness = normalizeString(dependency.readiness, null) ?? (
    ["ready", "healthy", "completed"].includes(normalizedStatus) ? "ready" : "unknown"
  );

  return {
    dependencyId: normalizeString(dependency.dependencyId, normalizeString(dependency.name, `dependency-${index + 1}`)),
    name: normalizeString(dependency.name, normalizeString(dependency.dependencyId, `dependency-${index + 1}`)),
    status: normalizedStatus,
    readiness: readiness.toLowerCase(),
    critical: dependency.critical === true,
    details: Array.isArray(dependency.details) ? dependency.details.map((entry) => normalizeString(entry, null)).filter(Boolean) : [],
  };
}

function summarizeHealth(dependencies) {
  const degraded = dependencies.filter((dependency) =>
    ["degraded", "down", "failed", "blocked"].includes(dependency.status)
  );

  return {
    status: degraded.length > 0 ? "degraded" : "healthy",
    isHealthy: degraded.length === 0,
    dependencyStatus: dependencies,
    summary: {
      totalDependencies: dependencies.length,
      healthyDependencies: dependencies.filter((dependency) => dependency.status === "healthy").length,
      degradedDependencies: degraded.length,
      readyDependencies: dependencies.filter((dependency) => dependency.readiness === "ready").length,
    },
  };
}

function summarizeReadiness(dependencies, startupSteps) {
  const blockers = [];

  for (const step of startupSteps) {
    if (step?.status && step.status !== "completed") {
      blockers.push(`startup:${step.step}`);
    }
  }

  for (const dependency of dependencies) {
    if (dependency.critical && dependency.readiness !== "ready") {
      blockers.push(`dependency:${dependency.name}`);
    }
  }

  return {
    status: blockers.length === 0 ? "ready" : "not-ready",
    isReady: blockers.length === 0,
    dependencyStatus: dependencies,
    blockers,
    summary: {
      totalDependencies: dependencies.length,
      criticalDependencies: dependencies.filter((dependency) => dependency.critical).length,
      readyCriticalDependencies: dependencies.filter((dependency) =>
        dependency.critical && dependency.readiness === "ready"
      ).length,
      startupStepsCompleted: startupSteps.filter((step) => step?.status === "completed").length,
      totalStartupSteps: startupSteps.length,
    },
  };
}

export function createHealthCheckAndReadinessEndpoints({
  runtimeHealthSignals = {},
} = {}) {
  const checkedAt =
    typeof runtimeHealthSignals.checkedAt === "string" && runtimeHealthSignals.checkedAt.trim()
      ? runtimeHealthSignals.checkedAt.trim()
      : new Date().toISOString();
  const dependencies = Array.isArray(runtimeHealthSignals.dependencies)
    ? runtimeHealthSignals.dependencies.map(normalizeDependency)
    : [];
  const startupSteps = Array.isArray(runtimeHealthSignals.startupSteps) ? runtimeHealthSignals.startupSteps : [];
  const runtimeId =
    typeof runtimeHealthSignals.runtimeId === "string" && runtimeHealthSignals.runtimeId.trim()
      ? runtimeHealthSignals.runtimeId.trim()
      : null;

  const healthSummary = summarizeHealth(dependencies);
  const readinessSummary = summarizeReadiness(dependencies, startupSteps);

  return {
    healthStatus: {
      runtimeId,
      checkedAt,
      ...healthSummary,
    },
    readinessStatus: {
      runtimeId,
      checkedAt,
      ...readinessSummary,
    },
  };
}
