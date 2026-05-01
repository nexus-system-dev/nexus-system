function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createTaskStepFlowAndProgressBinder({
  guidedTaskExecutionSurface = null,
  taskExecutionMetric = null,
  progressState = null,
  realityProgress = null,
} = {}) {
  const guided = normalizeObject(guidedTaskExecutionSurface);
  const metric = normalizeObject(taskExecutionMetric);
  const progress = normalizeObject(progressState);
  const reality = normalizeObject(realityProgress);
  const blockedEntries = normalizeArray(metric.entries ?? []).filter((entry) => entry.status === "blocked");

  return {
    taskStepFlowProgress: {
      taskStepFlowProgressId: `task-step-flow:${guided.taskId ?? "no-task"}`,
      status: guided.status === "ready" ? "ready" : "blocked",
      taskId: guided.taskId ?? null,
      steps: [
        { stepId: "select-task", status: guided.taskId ? "done" : "blocked" },
        { stepId: "enter-execution", status: guided.summary?.hasExecutionMode ? "done" : "blocked" },
        { stepId: "complete-progress", status: (progress.progressPercent ?? 0) > 0 ? "in-progress" : "pending" },
      ],
      blockedEntries,
      progressSummary: {
        progressPercent: progress.progressPercent ?? 0,
        progressStatus: progress.progressStatus ?? progress.status ?? "idle",
        realityPercent: reality.progressPercent ?? null,
      },
      summary: {
        hasBlockedEntries: blockedEntries.length > 0,
      },
    },
  };
}
