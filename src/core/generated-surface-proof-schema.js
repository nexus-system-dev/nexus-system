function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function defineGeneratedSurfaceProofSchema({
  renderableDesignProposal = null,
  designProposalValidation = null,
  designProposalPreviewState = null,
  previewScreenViewModel = null,
  aiControlCenterSurface = null,
} = {}) {
  const renderableProposal = normalizeObject(renderableDesignProposal);
  const validation = normalizeObject(designProposalValidation);
  const previewState = normalizeObject(designProposalPreviewState);
  const preview = normalizeObject(previewScreenViewModel);
  const controlCenter = normalizeObject(aiControlCenterSurface);
  const generatedPreview = normalizeObject(controlCenter.generatedSurfacePreview);

  const proofChecks = [
    {
      key: "renderability",
      status: renderableProposal.meta?.isRenderable === true ? "pass" : "fail",
      reason: renderableProposal.meta?.isRenderable === true
        ? "Renderable design proposal is available."
        : "Renderable design proposal is missing or not renderable.",
    },
    {
      key: "preview-runtime",
      status: previewState.summary?.isPreviewable === true && generatedPreview.isPreviewable === true ? "pass" : "fail",
      reason: previewState.summary?.isPreviewable === true && generatedPreview.isPreviewable === true
        ? "Generated preview is available in runtime."
        : "Generated preview is not available in runtime.",
    },
    {
      key: "validation",
      status: validation.status === "valid" ? "pass" : "fail",
      reason: validation.status === "valid"
        ? "Generated surface validation passed."
        : "Generated surface validation is not valid.",
    },
    {
      key: "accessibility-anchors",
      status: preview.meta?.hasCtaAnchors === true ? "pass" : "warn",
      reason: preview.meta?.hasCtaAnchors === true
        ? "CTA anchors are present in the generated preview."
        : "CTA anchors are not present in the generated preview.",
    },
    {
      key: "provenance",
      status: renderableProposal.meta?.sourceProposalId ? "pass" : "fail",
      reason: renderableProposal.meta?.sourceProposalId
        ? "Generated surface provenance is linked to a canonical proposal."
        : "Generated surface provenance is missing.",
    },
    {
      key: "layout-evidence",
      status: typeof preview.meta?.regionCount === "number" && preview.meta.regionCount > 0 ? "pass" : "fail",
      reason: typeof preview.meta?.regionCount === "number" && preview.meta.regionCount > 0
        ? "Generated surface has region-level layout evidence."
        : "Generated surface layout evidence is missing.",
    },
  ];

  const failedChecks = proofChecks.filter((check) => check.status === "fail");
  const warningChecks = proofChecks.filter((check) => check.status === "warn");

  return {
    generatedSurfaceProofSchema: {
      proofId: `generated-surface-proof:${normalizeString(renderableProposal.proposalId, preview.screenId ?? "unknown")}`,
      proposalId: normalizeString(renderableProposal.proposalId),
      screenId: normalizeString(renderableProposal.screenId, preview.screenId ?? generatedPreview.screenId ?? null),
      previewStateId: normalizeString(previewState.previewStateId),
      validationId: normalizeString(validation.validationId),
      status: failedChecks.length === 0 ? "proven" : "needs-attention",
      proofChecks,
      evidence: {
        regionCount: preview.meta?.regionCount ?? generatedPreview.regionCount ?? 0,
        isPreviewable: preview.meta?.isPreviewable === true || generatedPreview.isPreviewable === true,
        hasCtaAnchors: preview.meta?.hasCtaAnchors === true || generatedPreview.hasCtaAnchors === true,
        sourceProposalId: normalizeString(renderableProposal.meta?.sourceProposalId),
      },
      summary: {
        failedCheckCount: failedChecks.length,
        warningCheckCount: warningChecks.length,
        validationStatus: normalizeString(validation.status, "unknown"),
        previewStatus: normalizeString(previewState.status, "unknown"),
        proofStatus: failedChecks.length === 0 ? "proven" : "needs-attention",
      },
    },
  };
}
