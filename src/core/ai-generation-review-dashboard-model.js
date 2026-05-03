function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function createAiGenerationReviewDashboardModel({
  aiGenerationObservability = null,
  providerLatencyFailureTracker = null,
  generationSuccessAcceptanceTracker = null,
  promptContractFailureTracker = null,
} = {}) {
  const observability = normalizeObject(aiGenerationObservability);
  const latencyTracker = normalizeObject(providerLatencyFailureTracker);
  const successTracker = normalizeObject(generationSuccessAcceptanceTracker);
  const promptTracker = normalizeObject(promptContractFailureTracker);

  const blockerCount =
    (observability.summary?.blockingCheckCount ?? 0)
    + (promptTracker.failureSummary?.blockingFailureCount ?? 0);
  const riskSignals = [
    latencyTracker.summary?.requiresAttention === true ? "provider-latency-or-failure" : null,
    successTracker.summary?.requiresAttention === true ? "generation-acceptance" : null,
    promptTracker.failureSummary?.requiresAttention === true ? "prompt-contract" : null,
  ].filter(Boolean);

  const primaryAction =
    promptTracker.latestFailure?.reason
    ?? latencyTracker.failure?.latestReason
    ?? (successTracker.summary?.requiresAttention ? "Review generation acceptance blockers." : null)
    ?? "AI generation lane is healthy.";

  return {
    aiGenerationReviewDashboard: {
      dashboardId: `ai-generation-review-dashboard:${normalizeString(observability.observabilityId, "unknown")}`,
      observabilityId: normalizeString(observability.observabilityId),
      status: blockerCount > 0 || riskSignals.length > 0 ? "needs-attention" : "healthy",
      summary: {
        blockerCount,
        riskSignalCount: riskSignals.length,
        providerHealth: normalizeString(latencyTracker.providerHealth?.providerHealth, "unknown"),
        reviewStatus: normalizeString(successTracker.summary?.reviewStatus, observability.summary?.reviewStatus ?? "unknown"),
        acceptanceRate: successTracker.summary?.acceptanceRate ?? 0,
        promptFailureCount: promptTracker.failureSummary?.blockingFailureCount ?? 0,
        primaryAction,
      },
      panels: {
        health: {
          title: "Health",
          status: normalizeString(latencyTracker.status, "unknown"),
          body: `${normalizeString(latencyTracker.providerId, "provider")} | ${normalizeString(latencyTracker.latency?.latencyStatus, "unknown")}`,
        },
        acceptance: {
          title: "Acceptance",
          status: normalizeString(successTracker.status, "unknown"),
          body: `accepted ${successTracker.summary?.acceptedProposalCount ?? 0} / rejected ${successTracker.summary?.rejectedProposalCount ?? 0}`,
        },
        promptContract: {
          title: "Prompt contract",
          status: normalizeString(promptTracker.status, "unknown"),
          body: promptTracker.latestFailure?.reason ?? "No active prompt contract failure.",
        },
      },
      riskSignals,
    },
  };
}
