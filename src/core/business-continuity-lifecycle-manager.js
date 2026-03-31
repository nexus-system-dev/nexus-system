function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function resolveIncidentSeverity(incidentAlert = {}) {
  const severity = normalizeString(incidentAlert.severity, "low");
  if (["critical", "high", "medium", "low"].includes(severity)) {
    return severity;
  }

  return "low";
}

function resolveLifecycleState({
  continuityPlan = {},
  disasterRecoveryChecklist = {},
  incidentAlert = {},
  snapshotSchedule = {},
  snapshotBackupWorker = {},
  snapshotRetentionPolicy = {},
}) {
  const forcedState = normalizeString(continuityPlan.forcedLifecycleState, null);
  if (["normal", "degraded", "incident", "recovery", "failover"].includes(forcedState)) {
    return forcedState;
  }

  const incidentActive = normalizeString(incidentAlert.status, "stable") === "active";
  const canExecuteRecovery = disasterRecoveryChecklist.summary?.canExecuteRecovery === true;
  const scheduleHealthy = snapshotSchedule.enabled !== false;
  const workerHealthy = snapshotBackupWorker.enabled !== false;
  const retentionHealthy = Number.isFinite(snapshotRetentionPolicy.maxSnapshots) && snapshotRetentionPolicy.maxSnapshots > 0;
  const operationallyHealthy = scheduleHealthy && workerHealthy && retentionHealthy;

  if (incidentActive) {
    if (canExecuteRecovery) {
      return "recovery";
    }
    if (
      resolveIncidentSeverity(incidentAlert) === "critical"
      && normalizeBoolean(continuityPlan.failover?.enabled, false)
    ) {
      return "failover";
    }
    return "incident";
  }

  if (!operationallyHealthy) {
    return "degraded";
  }

  return "normal";
}

function resolveAvailableActions(state) {
  const stateToActions = {
    normal: ["request-backup-validation", "trigger-continuity-health-check"],
    degraded: ["start-recovery", "run-backup-now", "run-retention-cleanup"],
    incident: ["start-recovery", "prepare-failover", "freeze-risky-actions"],
    recovery: ["execute-recovery-checklist", "mark-service-stable", "request-owner-approval"],
    failover: ["execute-failover-placeholder", "request-failover-plan", "notify-owner"],
  };

  return stateToActions[state] ?? [];
}

export function createBusinessContinuityLifecycleManager({
  backupStrategy = null,
  continuityPlan = null,
  disasterRecoveryChecklist = null,
  incidentAlert = null,
  snapshotSchedule = null,
  snapshotBackupWorker = null,
  snapshotRetentionPolicy = null,
  ownerContinuityDecision = null,
} = {}) {
  const normalizedBackupStrategy = normalizeObject(backupStrategy);
  const normalizedContinuityPlan = normalizeObject(continuityPlan);
  const normalizedChecklist = normalizeObject(disasterRecoveryChecklist);
  const normalizedIncidentAlert = normalizeObject(incidentAlert);
  const normalizedSchedule = normalizeObject(snapshotSchedule);
  const normalizedWorker = normalizeObject(snapshotBackupWorker);
  const normalizedRetentionPolicy = normalizeObject(snapshotRetentionPolicy);
  const normalizedOwnerDecision = normalizeObject(ownerContinuityDecision);

  const lifecycleState = resolveLifecycleState({
    continuityPlan: normalizedContinuityPlan,
    disasterRecoveryChecklist: normalizedChecklist,
    incidentAlert: normalizedIncidentAlert,
    snapshotSchedule: normalizedSchedule,
    snapshotBackupWorker: normalizedWorker,
    snapshotRetentionPolicy: normalizedRetentionPolicy,
  });
  const readinessScore = Number(normalizedChecklist.summary?.readinessScore ?? 0);
  const failoverPlan = normalizeObject(normalizedContinuityPlan.failover);
  const hasFailoverPlanner = normalizeBoolean(failoverPlan.hasPlanner, false);
  const failoverRequested = lifecycleState === "failover" || normalizeBoolean(normalizedOwnerDecision.requestFailover, false);

  const phase = lifecycleState === "normal"
    ? "stable"
    : lifecycleState === "degraded"
      ? "watch"
      : lifecycleState === "incident"
        ? "contain"
        : lifecycleState === "recovery"
          ? "recover"
          : "failover";
  const continuityStatus = lifecycleState === "failover" && !hasFailoverPlanner
    ? "at-risk"
    : lifecycleState === "incident"
      ? "critical"
      : lifecycleState === "degraded"
        ? "warning"
        : "healthy";

  const businessContinuityState = {
    continuityStateId: `business-continuity:${normalizedBackupStrategy.projectId ?? "unknown-project"}`,
    projectId: normalizedBackupStrategy.projectId ?? normalizedChecklist.projectId ?? null,
    lifecycleState,
    phase,
    continuityStatus,
    orchestration: {
      backup: {
        strategyId: normalizedBackupStrategy.backupStrategyId ?? null,
        cadence: normalizedBackupStrategy.cadence ?? null,
        scheduleId: normalizedSchedule.snapshotScheduleId ?? null,
        workerId: normalizedWorker.workerId ?? null,
        workerEnabled: normalizedWorker.enabled !== false,
      },
      retention: {
        retentionPolicyId: normalizedRetentionPolicy.retentionPolicyId ?? null,
        maxSnapshots: normalizedRetentionPolicy.maxSnapshots ?? null,
        enabled: normalizedRetentionPolicy.enabled !== false,
      },
      incidentRecovery: {
        checklistId: normalizedChecklist.checklistId ?? null,
        canExecuteRecovery: normalizedChecklist.summary?.canExecuteRecovery === true,
        readinessScore,
      },
      failover: {
        dependency: "Create failover and continuity planner",
        integrationStatus: normalizeString(
          failoverPlan.integrationStatus,
          hasFailoverPlanner ? "connected" : "placeholder",
        ),
        requested: failoverRequested,
        isBlocking:
          lifecycleState === "failover"
          && (!hasFailoverPlanner || failoverPlan.supportsAutomaticSwitch === false),
        target: failoverPlan.target ?? null,
        route: Array.isArray(failoverPlan.route) ? failoverPlan.route : [],
        note:
          failoverPlan.note
          ?? (hasFailoverPlanner
            ? "Failover planner integration is connected."
            : "Failover planner is not implemented yet. Manager exposes a placeholder integration point."),
      },
      ownerDecision: {
        decisionId: normalizeString(normalizedOwnerDecision.decisionId, null),
        decisionType: normalizeString(normalizedOwnerDecision.decisionType, null),
        forcedLifecycleState: normalizeString(normalizedContinuityPlan.forcedLifecycleState, null),
        decidedAt: normalizeString(normalizedOwnerDecision.decidedAt, null),
      },
    },
    transitions: {
      fromState: normalizeString(normalizedContinuityPlan.previousLifecycleState, null),
      toState: lifecycleState,
      reason:
        normalizeString(normalizedOwnerDecision.reason, null)
        ?? normalizeString(normalizedIncidentAlert.summary, null)
        ?? (lifecycleState === "degraded" ? "Continuity prerequisites degraded." : "Continuity state evaluated."),
      evaluatedAt: new Date().toISOString(),
    },
    availableActions: resolveAvailableActions(lifecycleState),
    summary: {
      readinessScore,
      canContinueWithoutRisk: continuityStatus === "healthy",
      failoverReady: hasFailoverPlanner,
      hasBlockingDependency: lifecycleState === "failover" && !hasFailoverPlanner,
      totalRecoverySteps: Array.isArray(normalizedChecklist.steps) ? normalizedChecklist.steps.length : 0,
    },
  };

  return {
    businessContinuityState,
  };
}
