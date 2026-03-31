function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeSeverity(value) {
  const severity = normalizeString(value, "low");
  return ["critical", "high", "medium", "low"].includes(severity) ? severity : "low";
}

function deriveFallbackReliabilitySlaModel(reliabilitySlaModel = {}, incidentAlert = {}) {
  const normalized = normalizeObject(reliabilitySlaModel);
  const hasCanonicalModel = Boolean(normalized.reliabilityModelId);
  const serviceTier = normalizeString(normalized.serviceTier, "standard");
  const severity = normalizeSeverity(incidentAlert.severity);

  return {
    reliabilityModelId: normalized.reliabilityModelId ?? null,
    schemaStatus: hasCanonicalModel ? "canonical" : "fallback",
    source: hasCanonicalModel ? "reliability-sla-schema" : "planner-fallback",
    serviceTier,
    runtimeCapabilities: {
      supportsRuntimeFailover: normalized.runtimeCapabilities?.supportsRuntimeFailover ?? (severity === "critical"),
      supportsQueueDrain: normalized.runtimeCapabilities?.supportsQueueDrain ?? true,
      supportsProviderFallback: normalized.runtimeCapabilities?.supportsProviderFallback ?? true,
      supportsWorkspaceFailover: normalized.runtimeCapabilities?.supportsWorkspaceFailover ?? (serviceTier !== "starter"),
    },
    thresholds: {
      maxQueueLagMinutes: Number(normalized.thresholds?.maxQueueLagMinutes ?? 10),
      providerFailureBurst: Number(normalized.thresholds?.providerFailureBurst ?? 3),
      maxRuntimeRecoveryMinutes: Number(normalized.thresholds?.maxRuntimeRecoveryMinutes ?? 30),
    },
    ownerEscalationPolicy: {
      requiresOwnerApprovalForFailover: normalized.ownerEscalationPolicy?.requiresOwnerApprovalForFailover ?? true,
    },
  };
}

function resolveAffectedLayer(incidentAlert = {}) {
  const incidentType = normalizeString(incidentAlert.incidentType, "runtime-outage");
  if (incidentType.includes("queue")) {
    return "queue";
  }
  if (incidentType.includes("provider")) {
    return "provider";
  }
  if (incidentType.includes("workspace") || incidentType.includes("cluster")) {
    return "workspace-cluster";
  }
  return "runtime";
}

function buildFallbackActions({ affectedLayer, severity, runtimeCapabilities }) {
  if (affectedLayer === "queue") {
    return [
      "pause-noncritical-jobs",
      runtimeCapabilities.supportsQueueDrain ? "drain-stuck-queue" : "queue-drain-unavailable",
      "switch-to-manual-approval-mode",
    ];
  }
  if (affectedLayer === "provider") {
    return [
      runtimeCapabilities.supportsProviderFallback ? "switch-provider-route" : "provider-fallback-unavailable",
      "cooldown-provider-calls",
      "preserve-last-known-good-state",
    ];
  }
  if (affectedLayer === "workspace-cluster") {
    return [
      runtimeCapabilities.supportsWorkspaceFailover ? "promote-standby-workspace" : "workspace-failover-unavailable",
      "freeze-destructive-actions",
      "serve-readonly-workspace",
    ];
  }

  return [
    runtimeCapabilities.supportsRuntimeFailover && severity === "critical"
      ? "promote-runtime-failover-target"
      : "run-runtime-recovery-playbook",
    "freeze-risky-actions",
    "validate-runtime-health",
  ];
}

function resolveRecommendedMode({ affectedLayer, severity, runtimeCapabilities }) {
  if (affectedLayer === "queue") {
    return "degraded";
  }
  if (affectedLayer === "provider") {
    return runtimeCapabilities.supportsProviderFallback ? "degraded" : "recovery";
  }
  if (affectedLayer === "workspace-cluster") {
    return runtimeCapabilities.supportsWorkspaceFailover ? "failover" : "recovery";
  }
  if (severity === "critical" && runtimeCapabilities.supportsRuntimeFailover) {
    return "failover";
  }
  return severity === "high" ? "recovery" : "degraded";
}

function buildContinuitySteps({ affectedLayer, recommendedMode, fallbackActions }) {
  return fallbackActions.map((action, index) => ({
    stepId: `continuity-step:${affectedLayer}:${index + 1}`,
    order: index + 1,
    action,
    phase:
      index === 0
        ? "contain"
        : index === fallbackActions.length - 1
          ? "stabilize"
          : "fallback",
    targetMode: recommendedMode,
  }));
}

export function createFailoverAndContinuityPlanner({
  reliabilitySlaModel = null,
  incidentAlert = null,
} = {}) {
  const normalizedIncident = normalizeObject(incidentAlert);
  const normalizedReliability = deriveFallbackReliabilitySlaModel(reliabilitySlaModel, normalizedIncident);
  const severity = normalizeSeverity(normalizedIncident.severity);
  const affectedLayer = resolveAffectedLayer(normalizedIncident);
  const fallbackActions = buildFallbackActions({
    affectedLayer,
    severity,
    runtimeCapabilities: normalizedReliability.runtimeCapabilities,
  });
  const recommendedMode = resolveRecommendedMode({
    affectedLayer,
    severity,
    runtimeCapabilities: normalizedReliability.runtimeCapabilities,
  });
  const failoverEnabled = recommendedMode === "failover";
  const continuityPlan = {
    continuityPlanId: `continuity-plan:${normalizeString(normalizedIncident.projectId, "unknown-project")}:${affectedLayer}`,
    projectId: normalizeString(normalizedIncident.projectId, null),
    planningStatus: normalizedReliability.schemaStatus === "canonical" ? "ready" : "partial",
    incidentType: normalizeString(normalizedIncident.incidentType, "runtime-outage"),
    affectedLayer,
    severity,
    recommendedMode,
    fallbackActions,
    degradedMode: {
      isEnabled: recommendedMode === "degraded",
      allowedActions:
        recommendedMode === "degraded"
          ? fallbackActions.filter((action) => !action.includes("unavailable"))
          : [],
    },
    recoveryDirection: {
      mode: recommendedMode === "failover" ? "promote-standby" : "recover-in-place",
      requiresOwnerDecision:
        failoverEnabled && normalizedReliability.ownerEscalationPolicy.requiresOwnerApprovalForFailover,
      nextCheckpoint:
        failoverEnabled
          ? "confirm-failover-target"
          : recommendedMode === "recovery"
            ? "execute-recovery-checklist"
            : "stabilize-degraded-services",
    },
    failover: {
      hasPlanner: true,
      plannerStatus: normalizedReliability.schemaStatus === "canonical" ? "ready" : "partial",
      integrationStatus: normalizedReliability.schemaStatus === "canonical" ? "connected" : "connected-partial",
      enabled: failoverEnabled,
      target:
        affectedLayer === "workspace-cluster"
          ? "standby-workspace-cluster"
          : affectedLayer === "runtime"
            ? "standby-runtime"
            : "same-cluster-recovery",
      supportsAutomaticSwitch:
        affectedLayer === "workspace-cluster"
          ? normalizedReliability.runtimeCapabilities.supportsWorkspaceFailover
          : normalizedReliability.runtimeCapabilities.supportsRuntimeFailover,
      route: failoverEnabled
        ? [
            affectedLayer === "workspace-cluster" ? "freeze-current-cluster" : "freeze-runtime",
            "promote-standby",
            "validate-failover-health",
          ]
        : [],
      note:
        normalizedReliability.schemaStatus === "canonical"
          ? "Failover plan is backed by the reliability SLA model."
          : "Failover plan uses observability-driven fallback defaults until the reliability SLA schema is fully implemented.",
    },
    steps: buildContinuitySteps({ affectedLayer, recommendedMode, fallbackActions }),
    summary: {
      planStatus: normalizedReliability.schemaStatus === "canonical" ? "ready" : "partial",
      canFailover: failoverEnabled && !fallbackActions.includes("workspace-failover-unavailable"),
      needsFallbackReliabilityModel: normalizedReliability.schemaStatus !== "canonical",
      totalSteps: fallbackActions.length,
    },
    decisionTrace: {
      reliabilityInputStatus: normalizedReliability.schemaStatus,
      reliabilitySource: normalizedReliability.source,
      reason:
        normalizeString(normalizedIncident.summary, null)
        ?? `Continuity plan selected ${recommendedMode} mode for ${affectedLayer}.`,
      generatedAt: new Date().toISOString(),
    },
  };

  return {
    continuityPlan,
  };
}
