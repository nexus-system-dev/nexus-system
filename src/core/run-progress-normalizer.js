import { defineExecutionProgressSchema } from "./execution-progress-schema.js";

function normalizeTaskResults(taskResults = [], taskId = null) {
  return (Array.isArray(taskResults) ? taskResults : [])
    .filter((result) => !taskId || result.taskId === taskId)
    .map((result) => ({
      taskId: result.taskId ?? null,
      status: result.status ?? "unknown",
      timestamp: result.timestamp ?? null,
    }));
}

export function createRunProgressNormalizer({
  taskExecutionState = null,
  runtimeLogs = [],
  taskResults = [],
} = {}) {
  const progressSchema = defineExecutionProgressSchema({
    taskExecutionState,
    runtimeLogs,
  });
  const normalizedTaskResults = normalizeTaskResults(taskResults, progressSchema.taskId);

  return {
    normalizedProgressInputs: {
      ...progressSchema,
      taskResults: normalizedTaskResults,
      hasRuntimeLogs: progressSchema.logCount > 0,
      latestTaskResult: normalizedTaskResults.at(-1) ?? null,
    },
  };
}
