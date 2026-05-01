function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function buildLaneLookup(roadmap = [], executionGraphNodes = []) {
  const lookup = new Map();

  for (const task of normalizeArray(roadmap)) {
    if (task?.id) {
      lookup.set(task.id, task.lane ?? null);
    }
  }

  for (const node of normalizeArray(executionGraphNodes)) {
    if (node?.id && !lookup.has(node.id)) {
      lookup.set(node.id, node.lane ?? null);
    }
  }

  return lookup;
}

function buildResultEntry(result, laneLookup) {
  return {
    metricEntryId: `task-execution-entry:${result.id ?? result.taskId ?? "unknown"}`,
    projectId: result.projectId ?? null,
    taskId: result.taskId ?? null,
    lane: laneLookup.get(result.taskId) ?? null,
    agentId: result.agentId ?? null,
    assignmentEventId: result.assignmentEventId ?? null,
    status: result.status ?? "unknown",
    timestamp: result.timestamp ?? null,
    blockedBy: [],
  };
}

export function defineTaskExecutionMetricSchema({
  projectId = null,
  taskResults = [],
  roadmap = [],
} = {}) {
  const normalizedTaskResults = normalizeArray(taskResults);
  const laneLookup = buildLaneLookup(roadmap, []);

  const resultEntries = normalizedTaskResults.map((result) => buildResultEntry(result, laneLookup));
  const entries = [];
  const seenEntryIds = new Set();

  for (const entry of resultEntries) {
    const metricEntryId = entry.metricEntryId ?? `task-execution-entry:${entry.taskId ?? "unknown"}`;
    if (seenEntryIds.has(metricEntryId)) {
      continue;
    }
    seenEntryIds.add(metricEntryId);
    entries.push(entry);
  }

  return {
    taskExecutionMetric: {
      taskExecutionMetricId: `task-execution-metric:${projectId ?? "unknown-project"}`,
      entries,
    },
  };
}
