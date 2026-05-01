function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export function createSystemOptimizationCycle({
  projectId = null,
  adaptiveExecutionDecision = null,
  serviceReliabilityDashboard = null,
  systemBottleneckSummary = null,
} = {}) {
  const adaptive = normalizeObject(adaptiveExecutionDecision);
  const reliability = normalizeObject(serviceReliabilityDashboard);
  const bottleneck = normalizeObject(systemBottleneckSummary);
  const optimizationTargets = [
    bottleneck.bottleneckType ? `reduce-${bottleneck.bottleneckType}` : null,
    reliability.incidentStatus === "active" ? "reduce-incident-pressure" : null,
    adaptive.loopMode === "stabilize" ? "increase-execution-stability" : "increase-throughput",
  ].filter(Boolean);

  return {
    systemOptimizationPlan: {
      systemOptimizationPlanId: `system-optimization:${normalizeString(projectId, "unknown-project")}`,
      projectId: normalizeString(projectId),
      status: "ready",
      executionMode: adaptive.loopMode ?? "stabilize",
      optimizationTargets,
      supportingSignals: normalizeArray(bottleneck.signals).map((signal) => signal.type ?? "unknown"),
      nextAction: adaptive.nextAction ?? "review-system-state",
    },
  };
}
