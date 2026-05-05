function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createGeneratedAssetProvenanceRecord({
  aiDesignServiceResult = null,
  renderableDesignProposal = null,
  designProposalReviewState = null,
} = {}) {
  const serviceResult = normalizeObject(aiDesignServiceResult);
  const proposal = normalizeObject(renderableDesignProposal);
  const reviewState = normalizeObject(designProposalReviewState);
  const request = normalizeObject(serviceResult.aiDesignRequest);
  const providerResult = normalizeObject(serviceResult.aiDesignProviderResult);
  const selectedTask = normalizeObject(request.selectedTask);
  const regions = normalizeArray(proposal.regions);

  const hasCanonicalLineage = Boolean(
    serviceResult.serviceResultId
    && request.requestId
    && providerResult.providerResultId
    && proposal.proposalId
    && reviewState.reviewStateId,
  );

  return {
    generatedAssetProvenanceRecord: {
      provenanceRecordId: `generated-asset-provenance:${proposal.proposalId ?? "unknown"}`,
      proposalId: proposal.proposalId ?? null,
      requestId: request.requestId ?? null,
      providerResultId: providerResult.providerResultId ?? null,
      reviewStateId: reviewState.reviewStateId ?? null,
      status: hasCanonicalLineage ? "ready" : "incomplete",
      summary: {
        hasCanonicalLineage,
        assetCount: regions.length,
        reviewStatus: reviewState.status ?? "unknown",
        providerId: providerResult.providerId ?? providerResult.providerName ?? "unknown",
      },
      evidence: {
        sourceServiceResultId: serviceResult.serviceResultId ?? null,
        sourceProposalId: proposal.proposalId ?? null,
        selectedTaskId: selectedTask.id ?? null,
        selectedTaskSummary: selectedTask.summary ?? null,
        reviewChangedRegionCount: reviewState.summary?.changedRegionCount ?? 0,
        regionSlots: regions.map((region) => region?.slot).filter(Boolean),
      },
    },
  };
}
