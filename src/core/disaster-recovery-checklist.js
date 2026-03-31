function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function resolveIncidentSeverity(incidentAlert = {}) {
  const severity = normalizeString(incidentAlert.severity, "low");
  if (["critical", "high", "medium", "low"].includes(severity)) {
    return severity;
  }

  return "low";
}

function resolveReadinessStatus({ isReady, allowWarning = false }) {
  if (isReady) {
    return "ready";
  }

  return allowWarning ? "warning" : "missing";
}

function createPrerequisite({
  key,
  label,
  isReady,
  reason,
  evidence = null,
  allowWarning = false,
}) {
  return {
    key,
    label,
    status: resolveReadinessStatus({ isReady, allowWarning }),
    reason,
    evidence,
  };
}

function buildRecoverySteps({
  backupStrategy = {},
  restorePlan = {},
  incidentAlert = {},
  snapshotRecord = {},
  rollbackExecutionResult = {},
  missingPrerequisites = [],
}) {
  const severity = resolveIncidentSeverity(incidentAlert);
  const hasBlockingPrerequisites = missingPrerequisites.length > 0;

  return [
    {
      stepId: "assess-incident",
      order: 1,
      phase: "detect",
      title: "Assess incident scope and blast radius",
      description:
        severity === "critical"
          ? "Classify outage as critical and freeze risky operations immediately."
          : "Classify failure scope and collect runtime evidence before recovery.",
      owner: "operator",
      ready: true,
    },
    {
      stepId: "verify-prerequisites",
      order: 2,
      phase: "prepare",
      title: "Verify recovery prerequisites",
      description:
        hasBlockingPrerequisites
          ? "Recovery prerequisites are incomplete. Resolve missing items before restore."
          : "All required backup, restore, and worker controls are available.",
      owner: "operator",
      ready: !hasBlockingPrerequisites,
      blockingIssues: missingPrerequisites,
    },
    {
      stepId: "restore-state",
      order: 3,
      phase: "recover",
      title: "Restore state from latest safe snapshot",
      description:
        snapshotRecord.snapshotRecordId
          ? `Use snapshot ${snapshotRecord.snapshotRecordId} and apply restore order from the restore plan.`
          : "No snapshot record is available yet. Execute an immediate backup before restore.",
      owner: "system",
      ready: Boolean(restorePlan.restorePlanId) && Boolean(backupStrategy.backupStrategyId),
    },
    {
      stepId: "validate-recovery",
      order: 4,
      phase: "validate",
      title: "Validate service health and data integrity",
      description:
        rollbackExecutionResult.executed
          ? "Rollback execution is available; validate restored targets, approvals, and linked artifacts."
          : "Run readiness checks for entity integrity, artifact availability, and workspace linkage.",
      owner: "qa-agent",
      ready: true,
    },
    {
      stepId: "resume-operations",
      order: 5,
      phase: "resume",
      title: "Resume normal operations with follow-up actions",
      description: "Publish incident summary, confirm continuity state, and re-enable execution lanes.",
      owner: "owner",
      ready: !hasBlockingPrerequisites,
    },
  ];
}

function summarizeChecklist({ prerequisites = [], steps = [], incidentAlert = {} }) {
  const readyPrerequisites = prerequisites.filter((item) => item.status === "ready").length;
  const missingPrerequisites = prerequisites.filter((item) => item.status === "missing");
  const warningPrerequisites = prerequisites.filter((item) => item.status === "warning");
  const actionableSteps = steps.filter((step) => step.ready !== false).length;

  return {
    readinessScore: Math.round((readyPrerequisites / Math.max(prerequisites.length, 1)) * 100),
    totalPrerequisites: prerequisites.length,
    readyPrerequisites,
    missingPrerequisites: missingPrerequisites.length,
    warningPrerequisites: warningPrerequisites.length,
    actionableSteps,
    incidentSeverity: resolveIncidentSeverity(incidentAlert),
    canExecuteRecovery: missingPrerequisites.length === 0,
  };
}

export function createDisasterRecoveryChecklist({
  backupStrategy = null,
  restorePlan = null,
  incidentAlert = null,
  platformTrace = null,
  platformLogs = null,
  observabilitySummary = null,
  snapshotSchedule = null,
  snapshotBackupWorker = null,
  snapshotRetentionPolicy = null,
  snapshotRecord = null,
  restoreDecision = null,
  rollbackExecutionResult = null,
} = {}) {
  const normalizedBackupStrategy = normalizeObject(backupStrategy);
  const normalizedRestorePlan = normalizeObject(restorePlan);
  const normalizedIncidentAlert = normalizeObject(incidentAlert);
  const normalizedPlatformTrace = normalizeObject(platformTrace);
  const normalizedObservabilitySummary = normalizeObject(observabilitySummary);
  const normalizedSnapshotSchedule = normalizeObject(snapshotSchedule);
  const normalizedWorker = normalizeObject(snapshotBackupWorker);
  const normalizedRetentionPolicy = normalizeObject(snapshotRetentionPolicy);
  const normalizedSnapshotRecord = normalizeObject(snapshotRecord);
  const normalizedRestoreDecision = normalizeObject(restoreDecision);
  const normalizedRollbackExecutionResult = normalizeObject(rollbackExecutionResult);
  const normalizedPlatformLogs = Array.isArray(platformLogs) ? platformLogs : [];
  const hasObservabilityEvidence =
    Boolean(normalizedPlatformTrace.traceId)
    || normalizedPlatformLogs.length > 0
    || Number(normalizedObservabilitySummary.totalTraces ?? 0) > 0
    || Number(normalizedObservabilitySummary.totalLogs ?? 0) > 0;

  const prerequisites = [
    createPrerequisite({
      key: "backup-strategy",
      label: "Backup strategy is configured",
      isReady: Boolean(normalizedBackupStrategy.backupStrategyId),
      reason: normalizedBackupStrategy.backupStrategyId
        ? "Backup strategy contract exists."
        : "Missing backup strategy configuration.",
      evidence: normalizedBackupStrategy.backupStrategyId ?? null,
    }),
    createPrerequisite({
      key: "restore-plan",
      label: "Restore plan is available",
      isReady: Boolean(normalizedRestorePlan.restorePlanId),
      reason: normalizedRestorePlan.restorePlanId
        ? "Restore plan includes ordered recovery targets."
        : "Restore plan is missing.",
      evidence: normalizedRestorePlan.restorePlanId ?? null,
    }),
    createPrerequisite({
      key: "platform-observability",
      label: "Platform observability evidence is available",
      isReady: hasObservabilityEvidence,
      reason: hasObservabilityEvidence
        ? "Trace and log evidence is available for recovery validation."
        : "Missing direct observability evidence for runtime recovery readiness.",
      evidence: normalizedPlatformTrace.traceId
        ?? normalizedObservabilitySummary.observabilityId
        ?? (normalizedPlatformLogs[0]?.logId ?? null),
      allowWarning: true,
    }),
    createPrerequisite({
      key: "snapshot-schedule",
      label: "Snapshot schedule is active",
      isReady: normalizedSnapshotSchedule.enabled !== false,
      reason: normalizedSnapshotSchedule.enabled === false
        ? "Snapshot schedule is disabled."
        : "Snapshot schedule is configured for recurring backups.",
      evidence: normalizedSnapshotSchedule.snapshotScheduleId ?? null,
      allowWarning: true,
    }),
    createPrerequisite({
      key: "snapshot-worker",
      label: "Snapshot backup worker is enabled",
      isReady: normalizedWorker.enabled !== false,
      reason: normalizedWorker.enabled === false
        ? "Backup worker is disabled."
        : "Backup worker can execute scheduled backups.",
      evidence: normalizedWorker.workerId ?? null,
      allowWarning: true,
    }),
    createPrerequisite({
      key: "retention-policy",
      label: "Snapshot retention policy is configured",
      isReady: Boolean(normalizedRetentionPolicy.maxSnapshots),
      reason: normalizedRetentionPolicy.maxSnapshots
        ? "Retention guard can prune old snapshots safely."
        : "Retention policy is missing max snapshot limit.",
      evidence: normalizedRetentionPolicy.retentionPolicyId ?? null,
      allowWarning: true,
    }),
    createPrerequisite({
      key: "latest-snapshot",
      label: "Latest snapshot record exists",
      isReady: Boolean(normalizedSnapshotRecord.snapshotRecordId),
      reason: normalizedSnapshotRecord.snapshotRecordId
        ? "A snapshot record is available for restore."
        : "No snapshot record exists yet.",
      evidence: normalizedSnapshotRecord.snapshotRecordId ?? null,
      allowWarning: true,
    }),
    createPrerequisite({
      key: "restore-decision",
      label: "Restore decision is safe to execute",
      isReady: normalizedRestoreDecision.summary?.isSafeToExecute === true,
      reason: normalizedRestoreDecision.summary?.isSafeToExecute === true
        ? "Restore decision allows safe execution."
        : normalizeString(normalizedRestoreDecision.blockedReason, "Restore decision still blocked."),
      evidence: normalizedRestoreDecision.restoreDecisionId ?? null,
      allowWarning: true,
    }),
  ];

  const missingPrerequisites = prerequisites
    .filter((item) => item.status === "missing")
    .map((item) => item.label);
  const steps = buildRecoverySteps({
    backupStrategy: normalizedBackupStrategy,
    restorePlan: normalizedRestorePlan,
    incidentAlert: normalizedIncidentAlert,
    snapshotRecord: normalizedSnapshotRecord,
    rollbackExecutionResult: normalizedRollbackExecutionResult,
    missingPrerequisites,
  });
  const summary = summarizeChecklist({
    prerequisites,
    steps,
    incidentAlert: normalizedIncidentAlert,
  });

  return {
    disasterRecoveryChecklist: {
      checklistId: `disaster-recovery:${normalizedBackupStrategy.projectId ?? "unknown-project"}`,
      projectId: normalizedBackupStrategy.projectId ?? normalizedRestorePlan.projectId ?? null,
      incident: {
        status: normalizeString(normalizedIncidentAlert.status, "stable"),
        severity: resolveIncidentSeverity(normalizedIncidentAlert),
      incidentType: normalizeString(normalizedIncidentAlert.incidentType, "runtime"),
    },
      observability: {
        traceId: normalizedPlatformTrace.traceId ?? null,
        totalLogs: normalizedPlatformLogs.length,
        totalTraces: Number(normalizedObservabilitySummary.totalTraces ?? (normalizedPlatformTrace.traceId ? 1 : 0)),
        healthStatus: normalizeString(normalizedObservabilitySummary.healthStatus, normalizedIncidentAlert.status ?? "stable"),
      },
      prerequisites,
      steps,
      summary,
    },
  };
}
