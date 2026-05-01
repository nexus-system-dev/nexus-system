function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function createDesignProposalStateIntegration({
  proposalApplyDecision = null,
  approvedScreenDelta = null,
  renderableDesignProposal = null,
  designProposalReviewState = null,
} = {}) {
  const applyDecision = normalizeObject(proposalApplyDecision);
  const approvedDelta = normalizeObject(approvedScreenDelta);
  const proposal = normalizeObject(renderableDesignProposal);
  const reviewState = normalizeObject(designProposalReviewState);
  const accepted = applyDecision.summary?.canIntegrate === true;

  return {
    acceptedScreenState: {
      acceptedScreenStateId: `accepted-screen-state:${proposal.screenId ?? "unknown"}`,
      proposalId: proposal.proposalId ?? null,
      screenId: proposal.screenId ?? null,
      status: accepted ? "accepted" : "pending-review",
      changedRegionCount: approvedDelta.changedRegions?.length ?? 0,
    },
    integratedDesignProposalState: {
      integratedStateId: `integrated-design-proposal:${proposal.proposalId ?? "unknown"}`,
      proposalId: proposal.proposalId ?? null,
      status: accepted ? "integrated" : "pending-review",
      sourceReviewStateId: reviewState.reviewStateId ?? null,
      sourceDecisionId: applyDecision.decisionId ?? null,
      acceptedScreenStateId: `accepted-screen-state:${proposal.screenId ?? "unknown"}`,
    },
  };
}
