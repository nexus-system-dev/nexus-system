function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function resolveBudgetStatus(weight, budget) {
  if (budget <= 0) {
    return "unmeasured";
  }

  if (weight > budget) {
    return "above-budget";
  }

  return "within-budget";
}

export function createGeneratedSurfacePerformanceBudgetValidator({
  renderableDesignProposal = null,
  previewScreenViewModel = null,
  generatedSurfaceProofSchema = null,
  generatedAccessibilityValidationEngine = null,
} = {}) {
  const proposal = normalizeObject(renderableDesignProposal);
  const preview = normalizeObject(previewScreenViewModel);
  const proof = normalizeObject(generatedSurfaceProofSchema);
  const accessibility = normalizeObject(generatedAccessibilityValidationEngine);
  const regions = normalizeArray(preview.regions);
  const ctaAnchors = normalizeArray(preview.ctaAnchors).filter((cta) => normalizeObject(cta).isVisible !== false);
  const layoutType = normalizeString(preview.layoutType, proposal.layoutType ?? "single-column");
  const regionCount = normalizeNumber(preview.meta?.regionCount, regions.length);
  const visibleCtaCount = ctaAnchors.length;
  const previewable = preview.meta?.isPreviewable === true;
  const baseFontSize = normalizeNumber(preview.tokens?.baseFontSize, 0);
  const regionBudget = layoutType === "single-column" ? 6 : 8;
  const ctaBudget = 2;
  const weightBudget = regionBudget + ctaBudget;
  const weightedSurfaceLoad = regionCount + visibleCtaCount;
  const budgetStatus = resolveBudgetStatus(weightedSurfaceLoad, weightBudget);

  const checks = [
    {
      key: "preview-runtime",
      status: previewable ? "pass" : "fail",
      reason: previewable
        ? "Generated surface preview is available in runtime."
        : "Generated surface preview is not available in runtime.",
    },
    {
      key: "region-budget",
      status: regionCount <= regionBudget ? "pass" : "fail",
      reason: regionCount <= regionBudget
        ? "Visible preview regions stay within the generated surface region budget."
        : "Visible preview regions exceed the generated surface region budget.",
    },
    {
      key: "cta-budget",
      status: visibleCtaCount <= ctaBudget ? "pass" : "warn",
      reason: visibleCtaCount <= ctaBudget
        ? "Visible CTA anchors stay within the generated surface CTA budget."
        : "Visible CTA anchors exceed the generated surface CTA budget.",
    },
    {
      key: "surface-load",
      status: budgetStatus === "within-budget" ? "pass" : "fail",
      reason: budgetStatus === "within-budget"
        ? "Combined region and CTA load stays within the generated surface performance budget."
        : "Combined region and CTA load exceeds the generated surface performance budget.",
    },
    {
      key: "readable-preview-density",
      status: baseFontSize >= 14 ? "pass" : "warn",
      reason: baseFontSize >= 14
        ? "Preview density keeps a readable font baseline."
        : "Preview density falls below the readable font baseline.",
    },
  ];

  const failedChecks = checks.filter((check) => check.status === "fail");
  const warningChecks = checks.filter((check) => check.status === "warn");

  return {
    generatedSurfacePerformanceBudgetValidator: {
      performanceBudgetValidatorId: `generated-surface-performance:${normalizeString(proposal.proposalId, preview.screenId ?? "unknown")}`,
      proposalId: normalizeString(proposal.proposalId),
      screenId: normalizeString(preview.screenId, proposal.screenId ?? null),
      proofId: normalizeString(proof.proofId),
      accessibilityValidationId: normalizeString(accessibility.validationEngineId),
      status: failedChecks.length === 0 ? "ready" : "needs-attention",
      checks,
      evidence: {
        layoutType,
        regionCount,
        regionBudget,
        visibleCtaCount,
        ctaBudget,
        weightedSurfaceLoad,
        weightBudget,
        baseFontSize,
        previewable,
      },
      summary: {
        failedCheckCount: failedChecks.length,
        warningCheckCount: warningChecks.length,
        budgetStatus,
        proofStatus: normalizeString(proof.status, "unknown"),
        accessibilityStatus: normalizeString(accessibility.status, "unknown"),
        performanceStatus: failedChecks.length === 0 ? "ready" : "needs-attention",
      },
    },
  };
}
