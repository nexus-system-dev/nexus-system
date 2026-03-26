function normalizeDependency(dependency, index) {
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
  const readiness = dependency.readiness ?? (
    ["ready", "healthy", "completed"].includes(status) ? "ready" : "unknown"
  );

  return {
    dependencyId: dependency.dependencyId ?? dependency.name ?? `dependency-${index + 1}`,
    name: dependency.name ?? dependency.dependencyId ?? `dependency-${index + 1}`,
    status,
    readiness,
    critical: dependency.critical === true,
    details: Array.isArray(dependency.details) ? dependency.details : [],
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
  const checkedAt = runtimeHealthSignals.checkedAt ?? new Date().toISOString();
  const dependencies = Array.isArray(runtimeHealthSignals.dependencies)
    ? runtimeHealthSignals.dependencies.map(normalizeDependency)
    : [];
  const startupSteps = Array.isArray(runtimeHealthSignals.startupSteps) ? runtimeHealthSignals.startupSteps : [];
  const runtimeId = runtimeHealthSignals.runtimeId ?? null;

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
