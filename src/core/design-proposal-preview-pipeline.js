import { createGeneratedScreenPreviewRenderer } from "./generated-screen-preview-renderer.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function createDesignProposalPreviewPipeline({
  renderableDesignProposal = null,
  designProposalValidation = null,
  designTokens = null,
  layoutSystem = null,
  colorRules = null,
} = {}) {
  const normalizedProposal = normalizeObject(renderableDesignProposal);
  const normalizedValidation = normalizeObject(designProposalValidation);
  const { previewScreenViewModel } = createGeneratedScreenPreviewRenderer({
    renderableScreenComposition: normalizedProposal,
    designTokens,
    layoutSystem,
    colorRules,
  });

  return {
    designProposalPreviewState: {
      previewStateId: `design-proposal-preview:${normalizedProposal.proposalId ?? "unknown"}`,
      proposalId: normalizedProposal.proposalId ?? null,
      status: normalizedValidation.status === "valid" ? "ready" : "blocked",
      previewScreenViewModel,
      summary: {
        isPreviewable: previewScreenViewModel.meta?.isPreviewable === true,
        regionCount: previewScreenViewModel.meta?.regionCount ?? 0,
        validationStatus: normalizedValidation.status ?? "unknown",
      },
    },
  };
}
