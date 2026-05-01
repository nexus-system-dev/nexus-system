function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function createDesignProposalReviewHandoff({
  renderableDesignProposal = null,
  designProposalValidation = null,
  screenProposalDiff = null,
} = {}) {
  const proposal = normalizeObject(renderableDesignProposal);
  const validation = normalizeObject(designProposalValidation);
  const diff = normalizeObject(screenProposalDiff);
  const canEnterHumanReview = validation.summary?.isValid === true && Boolean(proposal.proposalId);

  return {
    designProposalReviewState: {
      reviewStateId: `design-proposal-review:${proposal.proposalId ?? "unknown"}`,
      proposalId: proposal.proposalId ?? null,
      status: canEnterHumanReview ? "ready-for-review" : "blocked",
      summary: {
        canEnterHumanReview,
        changedRegionCount: diff.summary?.changedRegionCount ?? 0,
        validationStatus: validation.status ?? "unknown",
      },
      reviewPayload: {
        validation,
        diff,
      },
    },
  };
}
