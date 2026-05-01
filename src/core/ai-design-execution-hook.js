function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function createAiDesignExecutionHook({
  selectedTask = null,
  aiDesignServiceResult = null,
} = {}) {
  const normalizedSelectedTask = normalizeObject(selectedTask);
  const normalizedResult = normalizeObject(aiDesignServiceResult);
  const shouldRun =
    Boolean(normalizedSelectedTask.id || normalizedSelectedTask.summary)
    && Boolean(normalizedResult.aiDesignProviderResult?.aiDesignProposal?.proposalId);

  return {
    aiDesignExecutionState: {
      executionStateId: `ai-design-execution:${normalizeString(normalizedSelectedTask.id, "selected-task")}`,
      selectedTaskId: normalizeString(normalizedSelectedTask.id),
      selectedTaskSummary: normalizeString(normalizedSelectedTask.summary),
      status: shouldRun ? "generated" : "skipped",
      providerResultId: normalizeString(normalizedResult.aiDesignProviderResult?.providerResultId),
      proposalId: normalizeString(normalizedResult.aiDesignProviderResult?.aiDesignProposal?.proposalId),
      summary: {
        shouldRun,
        hasCanonicalRequest: Boolean(normalizedResult.aiDesignRequest?.requestId),
        hasCanonicalProposal: Boolean(normalizedResult.aiDesignProviderResult?.aiDesignProposal?.proposalId),
      },
    },
  };
}
