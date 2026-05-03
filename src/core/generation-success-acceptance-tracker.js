function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function classifyProposalOutcome({
  proposal,
  reviewState,
  applyDecision,
  partialAcceptanceDecision,
  observability,
} = {}) {
  if (!proposal.proposalId) {
    return {
      acceptedProposalCount: 0,
      rejectedProposalCount: 0,
      pendingProposalCount: 0,
      proposalOutcome: "missing",
    };
  }

  const partialStatus = normalizeString(partialAcceptanceDecision.status);
  if (partialStatus === "fully-accepted" || partialStatus === "partially-accepted") {
    return {
      acceptedProposalCount: 1,
      rejectedProposalCount: 0,
      pendingProposalCount: 0,
      proposalOutcome: partialStatus,
    };
  }

  if (
    partialStatus === "needs-regeneration"
    || reviewState.status === "blocked"
    || applyDecision.status === "blocked"
    || observability.summary?.validationStatus === "invalid"
  ) {
    return {
      acceptedProposalCount: 0,
      rejectedProposalCount: 1,
      pendingProposalCount: 0,
      proposalOutcome: partialStatus ?? "rejected",
    };
  }

  return {
    acceptedProposalCount: 0,
    rejectedProposalCount: 0,
    pendingProposalCount: 1,
    proposalOutcome: "pending-review",
  };
}

function buildAcceptanceBreakdown(partialAcceptanceDecision = {}) {
  const partial = normalizeObject(partialAcceptanceDecision);
  const approvedElementCount =
    normalizeArray(partial.approvedSections).length
    + normalizeArray(partial.approvedComponents).length
    + normalizeArray(partial.approvedCopy).length;
  const rejectedElementCount =
    normalizeArray(partial.rejectedSections).length
    + normalizeArray(partial.rejectedComponents).length;
  const remainingElementCount =
    normalizeArray(partial.remainingCopy).length
    + (partial.summary?.remainingCount ?? 0);

  return {
    approvedElementCount,
    rejectedElementCount,
    remainingElementCount,
  };
}

export function createGenerationSuccessAcceptanceTracker({
  aiGenerationObservability = null,
  aiDesignProposal = null,
  renderableDesignProposal = null,
  designProposalReviewState = null,
  proposalApplyDecision = null,
  partialAcceptanceDecision = null,
} = {}) {
  const observability = normalizeObject(aiGenerationObservability);
  const proposal = normalizeObject(aiDesignProposal);
  const renderableProposal = normalizeObject(renderableDesignProposal);
  const reviewState = normalizeObject(designProposalReviewState);
  const applyDecision = normalizeObject(proposalApplyDecision);
  const partial = normalizeObject(partialAcceptanceDecision);

  const producedProposalCount = proposal.proposalId ? 1 : 0;
  const renderableProposalCount = renderableProposal.proposalId && renderableProposal.meta?.isRenderable === true ? 1 : 0;
  const generatedRegionCount = normalizeArray(proposal.regions).length;
  const { acceptedProposalCount, rejectedProposalCount, pendingProposalCount, proposalOutcome } = classifyProposalOutcome({
    proposal,
    reviewState,
    applyDecision,
    partialAcceptanceDecision: partial,
    observability,
  });
  const { approvedElementCount, rejectedElementCount, remainingElementCount } = buildAcceptanceBreakdown(partial);
  const handledProposalCount = acceptedProposalCount + rejectedProposalCount + pendingProposalCount;
  const acceptanceRate = handledProposalCount > 0 ? acceptedProposalCount / handledProposalCount : 0;
  const status =
    producedProposalCount === 0
      ? "blocked"
      : acceptedProposalCount > 0
        ? "accepted"
        : rejectedProposalCount > 0
          ? "needs-attention"
          : "pending-review";

  return {
    generationSuccessAcceptanceTracker: {
      trackerId: `generation-success-acceptance:${normalizeString(observability.observabilityId, proposal.proposalId ?? "unknown")}`,
      observabilityId: normalizeString(observability.observabilityId),
      proposalId: normalizeString(proposal.proposalId),
      renderableProposalId: normalizeString(renderableProposal.proposalId),
      reviewStateId: normalizeString(reviewState.reviewStateId),
      applyDecisionId: normalizeString(applyDecision.decisionId),
      partialAcceptanceDecisionId: normalizeString(partial.decisionId),
      status,
      generation: {
        producedProposalCount,
        renderableProposalCount,
        generatedRegionCount,
        providerMode: normalizeString(observability.summary?.providerMode, "unknown"),
      },
      proposalOutcomes: {
        acceptedProposalCount,
        rejectedProposalCount,
        pendingProposalCount,
        proposalOutcome,
      },
      ownerAcceptance: {
        status: normalizeString(partial.status, producedProposalCount > 0 ? "pending-owner-review" : "missing-proposal"),
        followUpAction: normalizeString(partial.followUpAction, "review"),
        approvedElementCount,
        rejectedElementCount,
        remainingElementCount,
      },
      operatorAcceptance: {
        reviewStatus: normalizeString(reviewState.status, "unknown"),
        applyStatus: normalizeString(applyDecision.status, "unknown"),
        canEnterHumanReview: reviewState.summary?.canEnterHumanReview === true,
        canIntegrate: applyDecision.summary?.canIntegrate === true,
      },
      summary: {
        producedProposalCount,
        acceptedProposalCount,
        rejectedProposalCount,
        pendingProposalCount,
        acceptanceRate,
        reviewStatus: normalizeString(reviewState.status, "unknown"),
        applyStatus: normalizeString(applyDecision.status, "unknown"),
        ownerAcceptanceStatus: normalizeString(partial.status, producedProposalCount > 0 ? "pending-owner-review" : "missing-proposal"),
        requiresAttention: status === "needs-attention" || producedProposalCount === 0,
      },
    },
  };
}
