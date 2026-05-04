function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function createGeneratedAccessibilityValidationEngine({
  renderableDesignProposal = null,
  previewScreenViewModel = null,
  generatedSurfaceProofSchema = null,
} = {}) {
  const proposal = normalizeObject(renderableDesignProposal);
  const preview = normalizeObject(previewScreenViewModel);
  const proof = normalizeObject(generatedSurfaceProofSchema);
  const regions = normalizeArray(preview.regions);
  const ctaAnchors = normalizeArray(preview.ctaAnchors);
  const baseFontSize = Number(preview.tokens?.baseFontSize ?? 0);

  const labeledRegionCount = regions.filter((region) => normalizeString(region?.slot) || normalizeString(region?.component)).length;
  const visibleCtaCount = ctaAnchors.filter((cta) => normalizeObject(cta).isVisible !== false).length;
  const labeledCtaCount = ctaAnchors.filter((cta) => normalizeString(cta?.label)).length;

  const checks = [
    {
      key: "proof-ready",
      status: proof.status === "proven" ? "pass" : "fail",
      reason: proof.status === "proven"
        ? "Generated surface proof is already canonical and proven."
        : "Generated surface proof is not yet proven.",
    },
    {
      key: "previewable-runtime",
      status: preview.meta?.isPreviewable === true ? "pass" : "fail",
      reason: preview.meta?.isPreviewable === true
        ? "Generated preview is available in runtime."
        : "Generated preview is not available in runtime.",
    },
    {
      key: "region-labels",
      status: regions.length > 0 && labeledRegionCount === regions.length ? "pass" : "fail",
      reason: regions.length > 0 && labeledRegionCount === regions.length
        ? "All generated preview regions expose accessible labels."
        : "One or more generated preview regions are missing accessible labels.",
    },
    {
      key: "cta-labels",
      status: visibleCtaCount === 0 || labeledCtaCount === visibleCtaCount ? "pass" : "warn",
      reason: visibleCtaCount === 0 || labeledCtaCount === visibleCtaCount
        ? "Visible CTA anchors expose labels."
        : "One or more visible CTA anchors are missing labels.",
    },
    {
      key: "minimum-font-size",
      status: baseFontSize >= 14 ? "pass" : "warn",
      reason: baseFontSize >= 14
        ? "Base font size meets the minimum readable threshold."
        : "Base font size is below the minimum readable threshold.",
    },
    {
      key: "proposal-cta-alignment",
      status: ctaAnchors.length <= normalizeArray(proposal.ctaAnchors).length ? "pass" : "warn",
      reason: ctaAnchors.length <= normalizeArray(proposal.ctaAnchors).length
        ? "Preview CTA anchors align with the renderable proposal contract."
        : "Preview CTA anchors exceed the renderable proposal contract.",
    },
  ];

  const failedChecks = checks.filter((check) => check.status === "fail");
  const warningChecks = checks.filter((check) => check.status === "warn");

  return {
    generatedAccessibilityValidationEngine: {
      validationEngineId: `generated-accessibility:${normalizeString(proposal.proposalId, preview.screenId ?? "unknown")}`,
      proposalId: normalizeString(proposal.proposalId),
      screenId: normalizeString(preview.screenId, proposal.screenId ?? null),
      status: failedChecks.length === 0 ? "ready" : "needs-attention",
      checks,
      evidence: {
        regionCount: regions.length,
        labeledRegionCount,
        visibleCtaCount,
        labeledCtaCount,
        baseFontSize: Number.isFinite(baseFontSize) ? baseFontSize : 0,
        previewable: preview.meta?.isPreviewable === true,
      },
      summary: {
        failedCheckCount: failedChecks.length,
        warningCheckCount: warningChecks.length,
        accessibilityStatus: failedChecks.length === 0 ? "ready" : "needs-attention",
        proofStatus: normalizeString(proof.status, "unknown"),
      },
    },
  };
}
