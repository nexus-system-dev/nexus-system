function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
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
    lastExecutionStatus: normalized.lastExecutionStatus ?? "not-run",
  };
}

export function createSnapshotBackupWorkerJob({
  projectId = null,
  snapshotSchedule = null,
  previousWorkerState = null,
  workerInput = null,
  now = new Date(),
} = {}) {
  const schedule = normalizeObject(snapshotSchedule);
  const previous = normalizeObject(previousWorkerState);
  const input = normalizeObject(workerInput);
  const enabled = resolveEnabled(input, previous);
  const intervalSeconds = Number(schedule.intervalSeconds ?? 0);
  const intervalMs = Number(schedule.intervalMs ?? intervalSeconds * 1000);
  const nowDate = now instanceof Date ? now : new Date();
  const nowIso = nowDate.toISOString();

  const snapshotBackupWorker = {
    workerJobId: previous.workerJobId ?? `snapshot-backup-worker:${projectId ?? "unknown-project"}`,
    projectId: projectId ?? previous.projectId ?? null,
    enabled,
    jobType: "snapshot-backup",
    intervalSeconds: Number.isFinite(intervalSeconds) && intervalSeconds > 0
      ? Math.floor(intervalSeconds)
      : Math.floor((intervalMs > 0 ? intervalMs : 0) / 1000),
    intervalMs: Number.isFinite(intervalMs) && intervalMs > 0 ? Math.floor(intervalMs) : null,
    runCount: Number(previous.runCount ?? 0),
    errorCount: Number(previous.errorCount ?? 0),
    status: enabled ? "idle" : "paused",
    lastRunAt: previous.lastRunAt ?? null,
    nextRunAt: enabled && Number.isFinite(intervalMs) && intervalMs > 0
      ? new Date(nowDate.getTime() + intervalMs).toISOString()
      : null,
    lastExecutionStatus: previous.lastExecutionStatus ?? "not-run",
    lastError: previous.lastError ?? null,
    updatedAt: nowIso,
  };

  return {
    snapshotBackupWorker: {
      ...snapshotBackupWorker,
      summary: buildSummary(snapshotBackupWorker),
    },
  };
}
