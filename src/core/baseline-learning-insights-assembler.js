function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function toConfidenceScore(count, scale = 3) {
  const normalizedCount = Number.isFinite(count) ? Math.max(0, count) : 0;
  return Number(Math.min(0.9, 0.35 + (normalizedCount / Math.max(1, scale)) * 0.25).toFixed(2));
}

function buildTaskOutcomeInsight(taskResults) {
  const completed = taskResults.filter((entry) => entry.status === "completed");
  const failed = taskResults.filter((entry) => entry.status === "failed");
  const retried = taskResults.filter((entry) => entry.status === "retried");

  if (failed.length > 0) {
    return {
      id: "baseline-learning-failures",
      title: "Recent task failures need attention",
      pattern: "failure-pattern",
      summary: `${failed.length} task result${failed.length === 1 ? "" : "s"} ended in failure in the current project state.`,
      confidenceScore: toConfidenceScore(failed.length),
      evidence: failed.slice(0, 3).map((entry) => ({
        type: entry.type ?? "task.failed",
        taskId: entry.taskId ?? null,
        taskType: entry.taskType ?? null,
        timestamp: entry.timestamp ?? null,
      })),
    };
  }

  if (retried.length > 0) {
    return {
      id: "baseline-learning-retries",
      title: "Retry behavior is part of the current execution pattern",
      pattern: "retry-pattern",
      summary: `${retried.length} task result${retried.length === 1 ? "" : "s"} required a retry before stabilizing.`,
      confidenceScore: toConfidenceScore(retried.length),
      evidence: retried.slice(0, 3).map((entry) => ({
        type: entry.type ?? "task.retried",
        taskId: entry.taskId ?? null,
        taskType: entry.taskType ?? null,
        timestamp: entry.timestamp ?? null,
      })),
    };
  }

  if (completed.length > 0) {
    return {
      id: "baseline-learning-completions",
      title: "Completed task outcomes are accumulating",
      pattern: "completion-pattern",
      summary: `${completed.length} task result${completed.length === 1 ? "" : "s"} completed successfully in the current project state.`,
      confidenceScore: toConfidenceScore(completed.length),
      evidence: completed.slice(0, 3).map((entry) => ({
        type: entry.type ?? "task.completed",
        taskId: entry.taskId ?? null,
        taskType: entry.taskType ?? null,
        timestamp: entry.timestamp ?? null,
      })),
    };
  }

  return null;
}

function buildApprovalInsight(approvalStatus, approvalRecords) {
  const status = approvalStatus.status ?? "missing";

  if (status === "pending" || status === "rejected") {
    return {
      id: "baseline-learning-approval-friction",
      title: "Approval state is shaping current recommendations",
      pattern: "approval-friction",
      summary:
        approvalStatus.reason
        ?? (status === "pending"
          ? "A valid approval is still pending in the current project state."
          : "A recent approval decision rejected the current path."),
      confidenceScore: toConfidenceScore(approvalRecords.length || 1, 2),
      evidence: approvalRecords.slice(0, 3).map((record) => ({
        type: "approval-record",
        approvalRecordId: record.approvalRecordId ?? null,
        approvalRequestId: record.approvalRequestId ?? null,
        status: record.status ?? null,
      })),
    };
  }

  return null;
}

export function createBaselineLearningInsightsAssembler({
  taskResults = null,
  approvalRecords = null,
  approvalStatus = null,
  workspaceModel = null,
} = {}) {
  const normalizedTaskResults = normalizeArray(taskResults);
  const normalizedApprovalRecords = normalizeArray(approvalRecords);
  const normalizedApprovalStatus = normalizeObject(approvalStatus);
  const normalizedWorkspaceModel = normalizeObject(workspaceModel);
  const items = [
    buildTaskOutcomeInsight(normalizedTaskResults),
    buildApprovalInsight(normalizedApprovalStatus, normalizedApprovalRecords),
  ].filter(Boolean);

  const summary = items.length > 0
    ? items.map((item) => item.summary).join(" ")
    : "Baseline learning insights are waiting for more task outcomes and approval signals.";

  return {
    learningInsights: {
      insightSetId: `baseline-learning-insights:${normalizedWorkspaceModel.workspaceId ?? "workspace"}`,
      source: "wave2-baseline-assembler",
      sourceWorkspaceId: normalizedWorkspaceModel.workspaceId ?? null,
      summary,
      items,
      summaryCounts: {
        totalInsights: items.length,
        taskResults: normalizedTaskResults.length,
        approvalRecords: normalizedApprovalRecords.length,
      },
    },
  };
}
