function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeIntervalSeconds(intervalSeconds, previousSchedule = null) {
  if (Number.isFinite(Number(intervalSeconds)) && Number(intervalSeconds) >= 30) {
    return Math.floor(Number(intervalSeconds));
  }

  const previous = Number(previousSchedule?.intervalSeconds);
  if (Number.isFinite(previous) && previous >= 30) {
    return Math.floor(previous);
  }

  return 300;
}

function normalizeTriggers(scheduleInput = {}, previousSchedule = null) {
  const defaults = ["bootstrap", "migration", "deploy"];
  const source = normalizeArray(scheduleInput.preChangeTriggers);
  if (source.length > 0) {
    return [...new Set(source.map((trigger) => `${trigger ?? ""}`.trim().toLowerCase()).filter(Boolean))];
  }

  const previous = normalizeArray(previousSchedule?.preChangeTriggers);
  if (previous.length > 0) {
    return [...new Set(previous.map((trigger) => `${trigger ?? ""}`.trim().toLowerCase()).filter(Boolean))];
  }

  return defaults;
}

function resolveEnabled(scheduleInput = {}, previousSchedule = null) {
  if (typeof scheduleInput.enabled === "boolean") {
    return scheduleInput.enabled;
  }

  if (typeof previousSchedule?.enabled === "boolean") {
    return previousSchedule.enabled;
  }

  return true;
}

export function createSnapshotBackupSchedulingModule({
  backupStrategy = null,
  projectState = null,
  previousSchedule = null,
  scheduleInput = null,
  now = new Date(),
} = {}) {
  const normalizedBackupStrategy = normalizeObject(backupStrategy);
  const normalizedProjectState = normalizeObject(projectState);
  const normalizedPreviousSchedule = normalizeObject(previousSchedule);
  const normalizedScheduleInput = normalizeObject(scheduleInput);
  const enabled = resolveEnabled(normalizedScheduleInput, normalizedPreviousSchedule);
  const intervalSeconds = normalizeIntervalSeconds(normalizedScheduleInput.intervalSeconds, normalizedPreviousSchedule);
  const preChangeTriggers = normalizeTriggers(normalizedScheduleInput, normalizedPreviousSchedule);
  const nowAt = now instanceof Date ? now : new Date();
  const nowIso = nowAt.toISOString();
  const lastRunAt = normalizedPreviousSchedule.lastRunAt ?? null;
  const runCount = Number.isFinite(Number(normalizedPreviousSchedule.runCount))
    ? Number(normalizedPreviousSchedule.runCount)
    : 0;
  const nextRunAt = enabled ? new Date(nowAt.getTime() + (intervalSeconds * 1000)).toISOString() : null;
  const scheduleId = normalizedPreviousSchedule.snapshotScheduleId
    ?? `snapshot-schedule:${normalizedProjectState.projectId ?? "unknown-project"}`;

  return {
    snapshotSchedule: {
      snapshotScheduleId: scheduleId,
      backupStrategyId: normalizedBackupStrategy.backupStrategyId ?? null,
      projectId: normalizedProjectState.projectId ?? null,
      enabled,
      intervalSeconds,
      intervalMs: intervalSeconds * 1000,
      preChangeTriggers,
      supportedTriggerTypes: ["interval", "manual", ...preChangeTriggers],
      execution: {
        timerMode: "interval",
        nextRunAt,
        lastRunAt,
        runCount,
      },
      summary: {
        scheduleStatus: enabled ? "scheduled" : "paused",
        supportsPreChangeBackups: preChangeTriggers.length > 0,
        supportsIntervalBackups: true,
        backupMode: normalizedBackupStrategy.backupMode ?? "state-only",
      },
      updatedAt: nowIso,
    },
  };
}
