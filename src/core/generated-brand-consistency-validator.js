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

function hasPreviewColor(previewStyles, expectedToken) {
  const styles = normalizeObject(previewStyles);
  return Object.values(styles).some((value) => normalizeString(value)?.toLowerCase() === normalizeString(expectedToken)?.toLowerCase());
}

export function createGeneratedBrandConsistencyValidator({
  designTokens = null,
  colorRules = null,
  typographySystem = null,
  renderableDesignProposal = null,
  previewScreenViewModel = null,
  generatedSurfaceProofSchema = null,
} = {}) {
  const tokens = normalizeObject(designTokens);
  const colors = normalizeObject(colorRules);
  const typography = normalizeObject(typographySystem);
  const proposal = normalizeObject(renderableDesignProposal);
  const preview = normalizeObject(previewScreenViewModel);
  const proof = normalizeObject(generatedSurfaceProofSchema);

  const accentToken = normalizeString(tokens.colors?.accent, colors.roles?.accent?.token ?? preview.tokens?.primaryColor ?? null);
  const bodyFontFamily = normalizeString(
    typography.typeScale?.body?.fontFamily,
    tokens.typography?.familyBody ?? preview.tokens?.fontFamily ?? null,
  );
  const displayFontFamily = normalizeString(
    typography.typeScale?.display?.fontFamily,
    tokens.typography?.familyDisplay ?? bodyFontFamily,
  );
  const previewFontFamily = normalizeString(preview.tokens?.fontFamily);
  const previewRegionCount = normalizeNumber(preview.meta?.regionCount, normalizeArray(preview.regions).length);
  const proposalCopyCount = normalizeArray(proposal.copy).length;
  const accentMatchedRegions = normalizeArray(preview.regions).filter((region) =>
    hasPreviewColor(region?.previewStyles, accentToken)
  ).length;

  const checks = [
    {
      key: "proof-ready",
      status: proof.status === "proven" ? "pass" : "fail",
      reason: proof.status === "proven"
        ? "Generated surface proof is already canonical and proven."
        : "Generated surface proof is not yet proven.",
    },
    {
      key: "font-family-alignment",
      status: previewFontFamily && (previewFontFamily === bodyFontFamily || previewFontFamily === displayFontFamily) ? "pass" : "fail",
      reason: previewFontFamily && (previewFontFamily === bodyFontFamily || previewFontFamily === displayFontFamily)
        ? "Preview typography matches the canonical brand typography."
        : "Preview typography does not match the canonical brand typography.",
    },
    {
      key: "accent-token-presence",
      status: accentToken && preview.tokens?.primaryColor === accentToken ? "pass" : "warn",
      reason: accentToken && preview.tokens?.primaryColor === accentToken
        ? "Preview primary color matches the canonical accent token."
        : "Preview primary color diverges from the canonical accent token.",
    },
    {
      key: "region-brand-coverage",
      status: previewRegionCount === 0 || accentMatchedRegions > 0 ? "pass" : "warn",
      reason: previewRegionCount === 0 || accentMatchedRegions > 0
        ? "At least one generated region carries visible branded color treatment."
        : "Generated regions do not show branded color treatment.",
    },
    {
      key: "copy-presence",
      status: proposalCopyCount > 0 ? "pass" : "warn",
      reason: proposalCopyCount > 0
        ? "Generated proposal includes canonical brand-facing copy payload."
        : "Generated proposal is missing brand-facing copy payload.",
    },
  ];

  const failedChecks = checks.filter((check) => check.status === "fail");
  const warningChecks = checks.filter((check) => check.status === "warn");

  return {
    generatedBrandConsistencyValidator: {
      brandConsistencyValidatorId: `generated-brand-consistency:${normalizeString(proposal.proposalId, preview.screenId ?? "unknown")}`,
      proposalId: normalizeString(proposal.proposalId),
      screenId: normalizeString(preview.screenId, proposal.screenId ?? null),
      proofId: normalizeString(proof.proofId),
      status: failedChecks.length === 0 ? "ready" : "needs-attention",
      checks,
      evidence: {
        accentToken,
        previewPrimaryColor: normalizeString(preview.tokens?.primaryColor),
        previewFontFamily,
        bodyFontFamily,
        displayFontFamily,
        previewRegionCount,
        accentMatchedRegions,
        proposalCopyCount,
      },
      summary: {
        failedCheckCount: failedChecks.length,
        warningCheckCount: warningChecks.length,
        proofStatus: normalizeString(proof.status, "unknown"),
        brandStatus: failedChecks.length === 0 ? "ready" : "needs-attention",
      },
    },
  };
}
