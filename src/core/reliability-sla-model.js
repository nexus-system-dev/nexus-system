function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeNumber(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function inferServiceTier(serviceTierDefinitions = {}, runtimeCapabilities = {}) {
  const normalizedDefinitions = normalizeObject(serviceTierDefinitions);
  const normalizedRuntime = normalizeObject(runtimeCapabilities);
  const requestedTier = normalizeString(
    normalizedDefinitions.serviceTier
      ?? normalizedDefinitions.defaultTier
      ?? normalizedRuntime.serviceTier
      ?? normalizedRuntime.accountTier,
    null,
  );

  if (["starter", "standard", "enterprise"].includes(requestedTier)) {
    return requestedTier;
  }

  if (
    normalizeBoolean(normalizedRuntime.supportsRuntimeFailover)
    && normalizeBoolean(normalizedRuntime.supportsWorkspaceFailover)
  ) {
    return "enterprise";
  }

  if (
    normalizeBoolean(normalizedRuntime.supportsProviderFallback)
    || normalizeBoolean(normalizedRuntime.automaticRecovery)
  ) {
    return "standard";
  }

  return "starter";
}

function buildTierDefaults(serviceTier) {
  if (serviceTier === "enterprise") {
    return {
      uptimeTargets: {
        monthlyPercent: 99.95,
        maxMonthlyDowntimeMinutes: 22,
      },
      recoveryObjectives: {
        rtoMinutes: 15,
        rpoMinutes: 5,
      },
      thresholds: {
        maxQueueLagMinutes: 3,
        providerFailureBurst: 2,
        maxRuntimeRecoveryMinutes: 15,
        maxWorkspaceFailoverMinutes: 10,
      },
      ownerEscalationPolicy: {
        requiresOwnerApprovalForFailover: true,
        escalationWindowMinutes: 10,
        notifyRoles: ["owner", "operator"],
      },
      serviceGuarantees: {
        failoverSupport: "automatic-and-operator-assisted",
        workspaceContinuity: "standby-cluster",
        supportResponse: "priority",
      },
    };
  }

  if (serviceTier === "standard") {
    return {
      uptimeTargets: {
        monthlyPercent: 99.5,
        maxMonthlyDowntimeMinutes: 216,
      },
      recoveryObjectives: {
        rtoMinutes: 30,
        rpoMinutes: 15,
      },
      thresholds: {
        maxQueueLagMinutes: 8,
        providerFailureBurst: 3,
        maxRuntimeRecoveryMinutes: 30,
        maxWorkspaceFailoverMinutes: 25,
      },
      ownerEscalationPolicy: {
        requiresOwnerApprovalForFailover: true,
        escalationWindowMinutes: 20,
        notifyRoles: ["owner"],
      },
      serviceGuarantees: {
        failoverSupport: "guided",
        workspaceContinuity: "degraded-workspace",
        supportResponse: "standard",
      },
    };
  }

  return {
    uptimeTargets: {
      monthlyPercent: 99,
      maxMonthlyDowntimeMinutes: 438,
    },
    recoveryObjectives: {
      rtoMinutes: 60,
      rpoMinutes: 30,
    },
    thresholds: {
      maxQueueLagMinutes: 12,
      providerFailureBurst: 4,
      maxRuntimeRecoveryMinutes: 45,
      maxWorkspaceFailoverMinutes: 60,
    },
    ownerEscalationPolicy: {
      requiresOwnerApprovalForFailover: true,
      escalationWindowMinutes: 30,
      notifyRoles: ["owner"],
    },
    serviceGuarantees: {
      failoverSupport: "manual",
      workspaceContinuity: "best-effort",
      supportResponse: "best-effort",
    },
  };
}

function buildFailureClasses(runtimeCapabilities = {}) {
  const normalizedRuntime = normalizeObject(runtimeCapabilities);
  return [
    {
      classId: "runtime-outage",
      severity: "critical",
      affects: ["execution-runtime", "api-runtime"],
      automaticResponse: normalizeBoolean(normalizedRuntime.automaticRecovery, true) ? "recover-runtime" : "manual-recovery",
    },
    {
      classId: "queue-stall",
      severity: "high",
      affects: ["worker-queue", "scheduled-jobs"],
      automaticResponse: normalizeBoolean(normalizedRuntime.supportsQueueDrain, true) ? "drain-queue" : "manual-queue-recovery",
    },
    {
      classId: "provider-outage",
      severity: "high",
      affects: ["provider-adapters", "external-calls"],
      automaticResponse: normalizeBoolean(normalizedRuntime.supportsProviderFallback, true) ? "switch-provider-route" : "cooldown-provider-calls",
    },
    {
      classId: "workspace-cluster-outage",
      severity: "critical",
      affects: ["workspace-cluster", "project-state-surface"],
      automaticResponse: normalizeBoolean(normalizedRuntime.supportsWorkspaceFailover, false) ? "promote-standby-workspace" : "readonly-workspace-mode",
    },
    {
      classId: "snapshot-recovery-gap",
      severity: "medium",
      affects: ["snapshot-store", "restore-plan"],
      automaticResponse: normalizeBoolean(normalizedRuntime.snapshotRestore, true) ? "validate-latest-snapshot" : "manual-restore-escalation",
    },
    {
      classId: "observability-blind-spot",
      severity: "medium",
      affects: ["platform-observability", "incident-detection"],
      automaticResponse: "escalate-owner-review",
    },
  ];
}

export function defineReliabilityAndSlaSchema({
  serviceTierDefinitions = null,
  runtimeCapabilities = null,
  projectId = null,
} = {}) {
  const normalizedDefinitions = normalizeObject(serviceTierDefinitions);
  const providedRuntimeCapabilities = normalizeObject(runtimeCapabilities);
  const serviceTier = inferServiceTier(normalizedDefinitions, providedRuntimeCapabilities);
  const defaults = buildTierDefaults(serviceTier);
  const mergedRuntimeCapabilities = {
    snapshotRestore: normalizeBoolean(providedRuntimeCapabilities.snapshotRestore, true),
    automaticRecovery: normalizeBoolean(providedRuntimeCapabilities.automaticRecovery, serviceTier !== "starter"),
    supportsRuntimeFailover: normalizeBoolean(providedRuntimeCapabilities.supportsRuntimeFailover, serviceTier === "enterprise"),
    supportsQueueDrain: normalizeBoolean(providedRuntimeCapabilities.supportsQueueDrain, true),
    supportsProviderFallback: normalizeBoolean(providedRuntimeCapabilities.supportsProviderFallback, serviceTier !== "starter"),
    supportsWorkspaceFailover: normalizeBoolean(providedRuntimeCapabilities.supportsWorkspaceFailover, serviceTier === "enterprise"),
    operatorRunbooks: normalizeBoolean(providedRuntimeCapabilities.operatorRunbooks, true),
  };

  const reliabilitySlaModel = {
    reliabilityModelId: `reliability-sla:${normalizeString(projectId, "unknown-project")}:${serviceTier}`,
    projectId: normalizeString(projectId, null),
    schemaStatus: "canonical",
    source: "reliability-sla-schema",
    serviceTier,
    uptimeTargets: {
      monthlyPercent: normalizeNumber(
        normalizedDefinitions.uptimeTargets?.monthlyPercent,
        defaults.uptimeTargets.monthlyPercent,
      ),
      maxMonthlyDowntimeMinutes: normalizeNumber(
        normalizedDefinitions.uptimeTargets?.maxMonthlyDowntimeMinutes,
        defaults.uptimeTargets.maxMonthlyDowntimeMinutes,
      ),
    },
    recoveryObjectives: {
      rtoMinutes: normalizeNumber(
        normalizedDefinitions.recoveryObjectives?.rtoMinutes,
        defaults.recoveryObjectives.rtoMinutes,
      ),
      rpoMinutes: normalizeNumber(
        normalizedDefinitions.recoveryObjectives?.rpoMinutes,
        defaults.recoveryObjectives.rpoMinutes,
      ),
    },
    failureClasses: buildFailureClasses(mergedRuntimeCapabilities),
    runtimeCapabilities: mergedRuntimeCapabilities,
    thresholds: {
      maxQueueLagMinutes: normalizeNumber(normalizedDefinitions.thresholds?.maxQueueLagMinutes, defaults.thresholds.maxQueueLagMinutes),
      providerFailureBurst: normalizeNumber(normalizedDefinitions.thresholds?.providerFailureBurst, defaults.thresholds.providerFailureBurst),
      maxRuntimeRecoveryMinutes: normalizeNumber(normalizedDefinitions.thresholds?.maxRuntimeRecoveryMinutes, defaults.thresholds.maxRuntimeRecoveryMinutes),
      maxWorkspaceFailoverMinutes: normalizeNumber(normalizedDefinitions.thresholds?.maxWorkspaceFailoverMinutes, defaults.thresholds.maxWorkspaceFailoverMinutes),
    },
    ownerEscalationPolicy: {
      requiresOwnerApprovalForFailover: normalizeBoolean(
        normalizedDefinitions.ownerEscalationPolicy?.requiresOwnerApprovalForFailover,
        defaults.ownerEscalationPolicy.requiresOwnerApprovalForFailover,
      ),
      escalationWindowMinutes: normalizeNumber(
        normalizedDefinitions.ownerEscalationPolicy?.escalationWindowMinutes,
        defaults.ownerEscalationPolicy.escalationWindowMinutes,
      ),
      notifyRoles: Array.isArray(normalizedDefinitions.ownerEscalationPolicy?.notifyRoles)
        ? normalizedDefinitions.ownerEscalationPolicy.notifyRoles
        : defaults.ownerEscalationPolicy.notifyRoles,
    },
    serviceGuarantees: {
      failoverSupport: normalizeString(
        normalizedDefinitions.serviceGuarantees?.failoverSupport,
        defaults.serviceGuarantees.failoverSupport,
      ),
      workspaceContinuity: normalizeString(
        normalizedDefinitions.serviceGuarantees?.workspaceContinuity,
        defaults.serviceGuarantees.workspaceContinuity,
      ),
      supportResponse: normalizeString(
        normalizedDefinitions.serviceGuarantees?.supportResponse,
        defaults.serviceGuarantees.supportResponse,
      ),
    },
    summary: {
      tierSource: normalizeString(normalizedDefinitions.serviceTier, null) ? "provided" : "derived",
      hasSnapshotRestore: mergedRuntimeCapabilities.snapshotRestore,
      hasAutomaticRecovery: mergedRuntimeCapabilities.automaticRecovery,
      totalFailureClasses: 6,
      readinessStatus: "ready",
    },
  };

  return {
    reliabilitySlaModel,
  };
}
