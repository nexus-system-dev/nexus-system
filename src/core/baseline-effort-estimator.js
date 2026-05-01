const TASK_TYPE_TO_BASELINE_MS = Object.freeze({
  backend: 1800000,
  frontend: 1500000,
  growth: 1200000,
  mobile: 2100000,
  ops: 900000,
  release: 900000,
});

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function parseTimestamp(value) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }

  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveBaselineEstimateMs(taskType) {
  const normalizedTaskType = normalizeString(taskType);
  if (!normalizedTaskType) {
    return null;
  }

  return TASK_TYPE_TO_BASELINE_MS[normalizedTaskType] ?? null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function roundFiniteNumber(value) {
  const normalized = normalizeFiniteNumber(value);
  return normalized === null ? null : Math.round(normalized);
}

function buildAssignmentLookup(events = []) {
  const lookup = new Map();

  for (const event of normalizeArray(events)) {
    if (event?.type !== "task.assigned" || !event.id) {
      continue;
    }

    lookup.set(event.id, event);
  }

  return lookup;
}

function resolveExecutionDurationMs(result, assignmentLookup) {
  const assignmentEvent = assignmentLookup.get(result?.assignmentEventId);
  const assignedAt = parseTimestamp(assignmentEvent?.timestamp);
  const completedAt = parseTimestamp(result?.timestamp);

  if (assignedAt === null || completedAt === null) {
    return null;
  }

  const durationMs = completedAt - assignedAt;
  return durationMs >= 0 ? durationMs : null;
}

function shouldLearnFromResult(result, durationMs) {
  if (durationMs === null) {
    return false;
  }

  const status = normalizeString(result?.status);
  return status !== "blocked";
}

function buildLearnedEstimate(durationHistory = []) {
  if (!durationHistory.length) {
    return null;
  }

  const average = durationHistory.reduce((sum, durationMs) => sum + durationMs, 0) / durationHistory.length;
  return roundFiniteNumber(average);
}

function buildEstimateEntry(result, baselineEstimateMs, estimationSource, evidenceCount) {
  return {
    baselineEstimateEntryId: `baseline-estimate-entry:${result.id ?? result.taskId ?? "unknown"}`,
    taskId: normalizeString(result.taskId),
    taskType: normalizeString(result.taskType),
    assignmentEventId: normalizeString(result.assignmentEventId),
    baselineEstimateMs,
    estimationSource,
    evidenceCount,
  };
}

export function createBaselineEffortEstimator({
  projectId = null,
  taskResults = [],
  events = [],
  domain = null,
  context = null,
} = {}) {
  const assignmentLookup = buildAssignmentLookup(events);
  const durationHistoryByTaskType = new Map();
  const entries = [];
  let learnedEntryCount = 0;
  let fallbackEntryCount = 0;

  for (const result of normalizeArray(taskResults)) {
    const taskType = normalizeString(result?.taskType);
    const durationHistory = taskType ? (durationHistoryByTaskType.get(taskType) ?? []) : [];
    const learnedEstimateMs = buildLearnedEstimate(durationHistory);
    const defaultEstimateMs = resolveBaselineEstimateMs(taskType);
    const baselineEstimateMs = learnedEstimateMs ?? defaultEstimateMs;
    const estimationSource =
      learnedEstimateMs !== null
        ? "execution-history"
        : defaultEstimateMs !== null
          ? "task-type-default"
          : "unresolved";

    if (learnedEstimateMs !== null) {
      learnedEntryCount += 1;
    } else {
      fallbackEntryCount += 1;
    }

    entries.push(
      buildEstimateEntry(
        result,
        baselineEstimateMs,
        estimationSource,
        learnedEstimateMs !== null ? durationHistory.length : 0,
      ),
    );

    const durationMs = resolveExecutionDurationMs(result, assignmentLookup);
    if (!taskType || !shouldLearnFromResult(result, durationMs)) {
      continue;
    }

    durationHistoryByTaskType.set(taskType, [...durationHistory, durationMs]);
  }

  const learnedTaskTypes = Object.fromEntries(
    [...durationHistoryByTaskType.entries()]
      .filter(([, durationHistory]) => durationHistory.length > 0)
      .map(([taskType, durationHistory]) => [
        taskType,
        {
          sampleSize: durationHistory.length,
          learnedBaselineMs: buildLearnedEstimate(durationHistory),
        },
      ]),
  );

  return {
    baselineEstimate: {
      baselineEstimateId: `baseline-estimate:${normalizeString(projectId) ?? "unknown-project"}`,
      entries,
      defaults: { ...TASK_TYPE_TO_BASELINE_MS },
      domain: normalizeString(domain),
      contextUsed: learnedEntryCount > 0,
      learnedTaskTypes,
      summary:
        entries.length === 0
          ? "Baseline estimate resolved with Wave 2 taskType defaults and no executed task results."
          : learnedEntryCount > 0
            ? `Baseline estimate resolved from execution history where available with ${learnedEntryCount} learned entr${learnedEntryCount === 1 ? "y" : "ies"} and ${fallbackEntryCount} fallback entr${fallbackEntryCount === 1 ? "y" : "ies"}.`
            : "Baseline estimate resolved with Wave 2 taskType defaults only.",
    },
  };
}
