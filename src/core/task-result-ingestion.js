function normalizeRuntimeResults(runtimeResults = []) {
  return Array.isArray(runtimeResults) ? runtimeResults.filter(Boolean) : [];
}

export function ingestTaskResults({ runtimeResults = [] } = {}) {
  const normalizedResults = normalizeRuntimeResults(runtimeResults);

  const taskResults = normalizedResults
    .filter((event) => event.type === "task.completed" || event.type === "task.failed")
    .map((event) => ({
      id: event.id,
      type: event.type,
      projectId: event.payload?.projectId ?? null,
      taskId: event.payload?.taskId ?? null,
      agentId: event.payload?.agentId ?? null,
      assignmentEventId: event.payload?.assignmentEventId ?? null,
      status: event.type === "task.completed" ? "completed" : "failed",
      output: event.payload?.output ?? null,
      reason: event.payload?.reason ?? null,
      timestamp: event.timestamp ?? null,
    }));

  return {
    taskResults,
    transitionEvents: taskResults.map((result) => ({
      type: result.type,
      taskId: result.taskId,
      agentId: result.agentId,
      timestamp: result.timestamp,
    })),
  };
}
