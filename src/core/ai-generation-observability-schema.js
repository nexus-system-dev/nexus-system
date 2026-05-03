function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function buildContractChecks({
  aiDesignRequest,
  aiDesignProposal,
  aiDesignProviderResult,
  aiDesignServiceResult,
  aiDesignExecutionState,
  renderableDesignProposal,
  designProposalValidation,
  designProposalReviewState,
  proposalApplyDecision,
} = {}) {
  const request = normalizeObject(aiDesignRequest);
  const proposal = normalizeObject(aiDesignProposal);
  const providerResult = normalizeObject(aiDesignProviderResult);
  const serviceResult = normalizeObject(aiDesignServiceResult);
  const executionState = normalizeObject(aiDesignExecutionState);
  const renderableProposal = normalizeObject(renderableDesignProposal);
  const validation = normalizeObject(designProposalValidation);
  const review = normalizeObject(designProposalReviewState);
  const applyDecision = normalizeObject(proposalApplyDecision);

  return [
    {
      key: "request-contract",
      status: request.requestId ? "ready" : "missing",
      reason: request.requestId ? "Canonical AI design request is available." : "AI design request contract is missing.",
    },
    {
      key: "response-contract",
      status: proposal.proposalId ? "ready" : "missing",
      reason: proposal.proposalId ? "Canonical AI design proposal is available." : "AI design response contract is missing.",
    },
    {
      key: "provider-execution",
      status: providerResult.status ?? (providerResult.providerResultId ? "ready" : "missing"),
      reason: providerResult.providerResultId
        ? `Provider ${normalizeString(providerResult.providerId, "unknown-provider")} returned a canonical proposal.`
        : "Provider result is missing.",
    },
    {
      key: "service-envelope",
      status: serviceResult.serviceResultId ? "ready" : "missing",
      reason: serviceResult.serviceResultId
        ? "AI design service result is available."
        : "AI design service result is missing.",
    },
    {
      key: "execution-state",
      status: executionState.status ?? (executionState.executionStateId ? "ready" : "missing"),
      reason: executionState.executionStateId
        ? "AI design execution state is available."
        : "AI design execution state is missing.",
    },
    {
      key: "renderability",
      status: renderableProposal.meta?.isRenderable === true ? "ready" : "blocked",
      reason: renderableProposal.meta?.isRenderable === true
        ? "Renderable design proposal is ready."
        : "Renderable design proposal is not ready.",
    },
    {
      key: "validation",
      status: validation.status ?? "unknown",
      reason: validation.validationId
        ? `Validation status is ${validation.status ?? "unknown"}.`
        : "Design proposal validation is missing.",
    },
    {
      key: "review",
      status: review.status ?? "unknown",
      reason: review.reviewStateId
        ? `Review handoff status is ${review.status ?? "unknown"}.`
        : "Design proposal review state is missing.",
    },
    {
      key: "apply-readiness",
      status: applyDecision.status ?? "unknown",
      reason: applyDecision.decisionId
        ? `Apply decision status is ${applyDecision.status ?? "unknown"}.`
        : "Proposal apply decision is missing.",
    },
  ];
}

export function defineAiGenerationObservabilitySchema({
  aiDesignRequest = null,
  aiDesignProposal = null,
  aiDesignProviderResult = null,
  aiDesignServiceResult = null,
  aiDesignExecutionState = null,
  renderableDesignProposal = null,
  designProposalValidation = null,
  designProposalReviewState = null,
  proposalApplyDecision = null,
} = {}) {
  const request = normalizeObject(aiDesignRequest);
  const proposal = normalizeObject(aiDesignProposal);
  const providerResult = normalizeObject(aiDesignProviderResult);
  const serviceResult = normalizeObject(aiDesignServiceResult);
  const executionState = normalizeObject(aiDesignExecutionState);
  const renderableProposal = normalizeObject(renderableDesignProposal);
  const validation = normalizeObject(designProposalValidation);
  const review = normalizeObject(designProposalReviewState);
  const applyDecision = normalizeObject(proposalApplyDecision);
  const contractChecks = buildContractChecks({
    aiDesignRequest: request,
    aiDesignProposal: proposal,
    aiDesignProviderResult: providerResult,
    aiDesignServiceResult: serviceResult,
    aiDesignExecutionState: executionState,
    renderableDesignProposal: renderableProposal,
    designProposalValidation: validation,
    designProposalReviewState: review,
    proposalApplyDecision: applyDecision,
  });
  const blockingChecks = contractChecks.filter((check) => ["missing", "blocked", "invalid"].includes(check.status));
  const readyChecks = contractChecks.filter((check) => check.status === "ready").length;

  return {
    aiGenerationObservability: {
      observabilityId: `ai-generation-observability:${normalizeString(request.requestId, proposal.proposalId ?? "unknown")}`,
      requestId: normalizeString(request.requestId),
      proposalId: normalizeString(proposal.proposalId),
      providerId: normalizeString(providerResult.providerId, "unknown-provider"),
      serviceResultId: normalizeString(serviceResult.serviceResultId),
      executionStateId: normalizeString(executionState.executionStateId),
      status: blockingChecks.length > 0 ? "needs-attention" : "ready",
      contractChecks,
      runtimeSignals: {
        hasCanonicalRequest: Boolean(request.requestId),
        hasCanonicalProposal: Boolean(proposal.proposalId),
        hasProviderResult: Boolean(providerResult.providerResultId),
        hasExecutionState: Boolean(executionState.executionStateId),
        isRenderable: renderableProposal.meta?.isRenderable === true,
        reviewReady: review.status === "ready-for-review",
        applyReady: normalizeString(applyDecision.status) === "ready-for-state-integration",
        validationStatus: normalizeString(validation.status, "unknown"),
      },
      reviewSignals: {
        reviewStateId: normalizeString(review.reviewStateId),
        reviewStatus: normalizeString(review.status, "unknown"),
        applyStatus: normalizeString(applyDecision.status, "unknown"),
        proposedRegionCount: normalizeArray(proposal.regions).length,
      },
      summary: {
        readyCheckCount: readyChecks,
        totalCheckCount: contractChecks.length,
        blockingCheckCount: blockingChecks.length,
        providerMode: normalizeString(providerResult.mode, "unknown"),
        validationStatus: normalizeString(validation.status, "unknown"),
        reviewStatus: normalizeString(review.status, "unknown"),
        applyStatus: normalizeString(applyDecision.status, "unknown"),
        requiresAttention: blockingChecks.length > 0,
      },
    },
  };
}
