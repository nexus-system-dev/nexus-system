function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function createGuidedTaskExecutionSurface({
  dailyWorkspaceSurface = null,
  nextTaskPresentation = null,
  selectedTask = null,
  progressState = null,
  executionModeDecision = null,
} = {}) {
  const workspace = normalizeObject(dailyWorkspaceSurface);
  const nextTask = normalizeObject(nextTaskPresentation);
  const selected = normalizeObject(selectedTask);
  const progress = normalizeObject(progressState);
  const executionMode = normalizeObject(executionModeDecision);
  const taskId = selected.id ?? selected.taskId ?? nextTask.taskId ?? null;

  return {
    guidedTaskExecutionSurface: {
      guidedTaskExecutionSurfaceId: `guided-task-surface:${taskId ?? "no-task"}`,
      status: workspace.status === "ready" && taskId ? "ready" : "blocked",
      taskId,
      headline: nextTask.headline ?? selected.summary ?? nextTask.summary ?? "No guided task selected",
      executionMode: executionMode.selectedMode ?? null,
      progressPercent: progress.progressPercent ?? 0,
      workspaceKey: workspace.activeWorkspaceKey ?? null,
      summary: {
        canRunFocusedTask: workspace.status === "ready" && Boolean(taskId),
        hasExecutionMode: Boolean(executionMode.selectedMode),
      },
    },
  };
}
