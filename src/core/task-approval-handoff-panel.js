function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function createTaskApprovalHandoffPanel({
  guidedTaskExecutionSurface = null,
  taskStepFlowProgress = null,
  nextTaskApprovalPanel = null,
  sharedApprovalState = null,
} = {}) {
  const guided = normalizeObject(guidedTaskExecutionSurface);
  const progress = normalizeObject(taskStepFlowProgress);
  const approvalPanel = normalizeObject(nextTaskApprovalPanel);
  const sharedApproval = normalizeObject(sharedApprovalState);

  return {
    taskApprovalHandoffPanel: {
      taskApprovalHandoffPanelId: `task-approval-handoff:${guided.taskId ?? "no-task"}`,
      status: guided.status === "ready" ? "ready" : "blocked",
      taskId: guided.taskId ?? null,
      requiresApproval: approvalPanel.requiresApproval === true || sharedApproval.requiresApproval === true,
      approvalStatus: approvalPanel.approvalStatus ?? sharedApproval.status ?? "not-required",
      alternatives: approvalPanel.safeAlternatives ?? sharedApproval.alternatives ?? [],
      progressBlocked: progress.summary?.hasBlockedEntries === true,
      summary: {
        canProceedWithoutApproval:
          !(approvalPanel.requiresApproval === true || sharedApproval.requiresApproval === true),
      },
    },
  };
}
