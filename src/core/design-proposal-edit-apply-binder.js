function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createDesignProposalEditApplyBinder({
  designProposalReviewState = null,
  editableProposal = null,
  editedProposal = null,
  partialAcceptanceDecision = null,
  screenProposalDiff = null,
} = {}) {
  const reviewState = normalizeObject(designProposalReviewState);
  const editable = normalizeObject(editableProposal);
  const edited = normalizeObject(editedProposal);
  const partial = normalizeObject(partialAcceptanceDecision);
  const diff = normalizeObject(screenProposalDiff);
  const activeProposal = edited.revisionId ? edited : editable;
  const approvedCount = partial.summary?.approvedCount ?? 0;
  const canIntegrate = reviewState.summary?.canEnterHumanReview === true && Boolean(activeProposal.proposalId);

  return {
    approvedScreenDelta: {
      deltaId: `approved-screen-delta:${activeProposal.proposalId ?? "unknown"}`,
      proposalId: activeProposal.proposalId ?? null,
      changedRegions: normalizeArray(diff.changedRegions).filter((region) => region.changed),
      approvedCount,
      remainingCount: partial.summary?.remainingCount ?? 0,
    },
    proposalApplyDecision: {
      decisionId: `proposal-apply-decision:${activeProposal.proposalId ?? "unknown"}`,
      proposalId: activeProposal.proposalId ?? null,
      status: canIntegrate ? "ready-for-state-integration" : "blocked",
      followUpAction: partial.followUpAction ?? activeProposal.nextAction?.intent ?? "review",
      summary: {
        canIntegrate,
        hasEditedProposal: Boolean(edited.revisionId),
        hasPartialAcceptanceDecision: Boolean(partial.decisionId),
      },
    },
  };
}
