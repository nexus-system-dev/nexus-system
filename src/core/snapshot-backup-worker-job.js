import { createBackgroundWorkerRuntime } from "./background-worker-runtime.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function resolveEnabled(workerInput = {}, previousWorker = null) {
  if (typeof workerInput.enabled === "boolean") {
    return workerInput.enabled;
  }

  if (typeof previousWorker?.enabled === "boolean") {
    return previousWorker.enabled;
  }

  return true;
}

function buildSummary(snapshotBackupWorker = {}) {
  const normalized = normalizeObject(snapshotBackupWorker);
  return {
    workerStatus: normalized.enabled ? "enabled" : "disabled",
    runCount: Number(normalized.runCount ?? 0),
    errorCount: Number(normalized.errorCount ?? 0),
    lastExecutionStatus: normalizeString(normalized.lastExecutionStatus, "not-run"),
  };
}

export function createSnapshotBackupWorkerJob({
  projectId = null,
  snapshotSchedule = null,
  snapshotRetentionDecision = null,
  previousWorkerState = null,
  previousJobState = null,
  workerInput = null,
  now = new Date(),
} = {}) {
  const schedule = normalizeObject(snapshotSchedule);
  const retentionDecision = normalizeObject(snapshotRetentionDecision);
  const previous = normalizeObject(previousWorkerState);
  const previousJob = normalizeObject(previousJobState);
  const input = normalizeObject(workerInput);
  const enabled = resolveEnabled(input, previous);
  const intervalSeconds = Number(schedule.intervalSeconds ?? 0);
  const intervalMs = Number(schedule.intervalMs ?? intervalSeconds * 1000);
  const nowDate = now instanceof Date ? now : new Date();
  const nowIso = nowDate.toISOString();
  const nextRunAt = enabled && Number.isFinite(intervalMs) && intervalMs > 0
    ? new Date(nowDate.getTime() + intervalMs).toISOString()
    : null;
  const normalizedProjectId = normalizeString(projectId ?? previous.projectId, null);
  const workerJobId = normalizeString(previous.workerJobId, null) ?? `snapshot-backup-worker:${normalizedProjectId ?? "unknown-project"}`;

  const snapshotBackupWorker = {
    workerJobId,
    projectId: normalizedProjectId,
    enabled,
    jobType: "snapshot-backup",
    intervalSeconds: Number.isFinite(intervalSeconds) && intervalSeconds > 0
      ? Math.floor(intervalSeconds)
      : Math.floor((intervalMs > 0 ? intervalMs : 0) / 1000),
    intervalMs: Number.isFinite(intervalMs) && intervalMs > 0 ? Math.floor(intervalMs) : null,
    runCount: Number(previous.runCount ?? 0),
    errorCount: Number(previous.errorCount ?? 0),
    status: enabled ? "idle" : "paused",
    lastRunAt: normalizeString(previous.lastRunAt, null),
    nextRunAt,
    lastExecutionStatus: normalizeString(previous.lastExecutionStatus, "not-run"),
    lastError: normalizeString(previous.lastError, null),
    updatedAt: nowIso,
  };

  const { workerRuntime, jobState } = createBackgroundWorkerRuntime({
    jobDefinition: {
      jobId: normalizeString(previousJob.jobId, null) ?? `snapshot-job:${normalizedProjectId ?? "unknown-project"}`,
      jobType: "snapshot-backup",
      enabled,
      schedule: normalizeString(schedule.summary?.scheduleStatus, "interval"),
      attempts: previousJob.attempts ?? previous.errorCount ?? 0,
      nextRunAt,
      payload: {
        projectId: normalizedProjectId,
        snapshotScheduleId: normalizeString(schedule.snapshotScheduleId, null),
        retentionPolicyId: normalizeString(retentionDecision.retentionPolicyId, null),
        triggerTypes: schedule.supportedTriggerTypes ?? [],
      },
    },
    runtimeConfig: {
      queueName: "nexus-snapshot-backups",
      concurrency: 1,
      supportedJobTypes: ["snapshot-backup"],
      heartbeatIntervalMs: 30000,
    },
  });

  const snapshotJobState = {
    ...jobState,
    jobId: normalizeString(previousJob.jobId, null) ?? `snapshot-job:${normalizedProjectId ?? "unknown-project"}`,
    jobType: "snapshot-backup",
    workerRuntimeId: workerRuntime.workerId,
    workerJobId,
    projectId: normalizedProjectId,
    status: enabled ? "queued" : "idle",
    enabled,
    lastExecutionStatus: normalizeString(previous.lastExecutionStatus ?? previousJob.lastExecutionStatus, "not-run"),
    lastRunAt: normalizeString(previous.lastRunAt ?? previousJob.lastRunAt, null),
    nextRunAt,
    attempts: previousJob.attempts ?? previous.errorCount ?? 0,
    triggerTypes: schedule.supportedTriggerTypes ?? [],
    retention: {
      retentionEnabled: retentionDecision.retentionEnabled ?? null,
      maxSnapshots: retentionDecision.maxSnapshots ?? null,
    },
    summary: {
      queueName: workerRuntime.queueName,
      runtimeStatus: workerRuntime.status,
      workerEnabled: enabled,
      lastExecutionStatus: normalizeString(previous.lastExecutionStatus ?? previousJob.lastExecutionStatus, "not-run"),
    },
    updatedAt: nowIso,
  };

  return {
    workerRuntime,
    snapshotJobState,
    snapshotBackupWorker: {
      ...snapshotBackupWorker,
      summary: buildSummary(snapshotBackupWorker),
    },
  };
}
