function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildApprovalState(approvalStatus) {
  const normalizedApprovalStatus = normalizeObject(approvalStatus);
  const status = normalizedApprovalStatus.status ?? "missing";

  return {
    status,
    requiresApproval: ["missing", "pending", "expired", "rejected"].includes(status),
    reason: normalizedApprovalStatus.reason ?? null,
    isApproved: normalizedApprovalStatus.isApproved ?? status === "approved",
  };
}

function buildAlternatives(selectedTask, nextActionExplanation, schedulerDecision) {
  const normalizedTask = normalizeObject(selectedTask);
  const normalizedExplanation = normalizeObject(nextActionExplanation);
  const normalizedScheduler = normalizeObject(schedulerDecision);

  return [
    ...normalizeArray(normalizedTask.alternatives),
    ...normalizeArray(normalizedExplanation.alternatives),
    ...normalizeArray(normalizedScheduler.alternatives),
  ].filter(Boolean);
}

function buildExpectedOutcome(selectedTask, nextActionExplanation) {
  const normalizedTask = normalizeObject(selectedTask);
  const normalizedExplanation = normalizeObject(nextActionExplanation);
  const successCriteria = normalizeArray(normalizedTask.successCriteria);

  return {
    headline: normalizedTask.summary ?? normalizedExplanation.userFacingAction ?? "Continue with the next task",
    successCriteria,
    reason: normalizedExplanation.reason ?? null,
    expectedImpact: successCriteria[0] ?? normalizedExplanation.userFacingAction ?? null,
  };
}

export function createNextTaskPresentationModel({
  schedulerDecision = null,
  nextActionExplanation = null,
  approvalStatus = null,
  selectedTask = null,
  selectionReason = null,
} = {}) {
  const normalizedTask = normalizeObject(selectedTask);
  const normalizedSelectionReason = normalizeObject(selectionReason);
  const normalizedExplanation = normalizeObject(nextActionExplanation);
  const normalizedScheduler = normalizeObject(schedulerDecision);
  const approvalState = buildApprovalState(approvalStatus);
  const alternatives = buildAlternatives(normalizedTask, normalizedExplanation, normalizedScheduler);
  const expectedOutcome = buildExpectedOutcome(normalizedTask, normalizedExplanation);

  return {
    nextTaskPresentation: {
      presentationId: `next-task-presentation:${normalizedTask.id ?? normalizedScheduler.taskId ?? "none"}`,
      selectedTask: normalizedTask.id ? normalizedTask : null,
      reason: {
        code: normalizedSelectionReason.code ?? "scheduler-partial",
        summary: normalizedSelectionReason.summary ?? normalizedExplanation.reason ?? null,
        source: normalizedSelectionReason.source ?? normalizedExplanation.summary?.schedulerSource ?? "scheduler-partial",
      },
      alternatives,
      approvalState,
      expectedOutcome,
      summary: {
        hasTask: Boolean(normalizedTask.id),
        alternativeCount: alternatives.length,
        requiresApproval: approvalState.requiresApproval,
        schedulerSource: normalizedScheduler.source ?? normalizedExplanation.summary?.schedulerSource ?? "scheduler-partial",
      },
    },
  };
}
