function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(messagingVariants, acquisitionSourceMetrics) {
  const missingInputs = [];

  if (!messagingVariants || normalizeString(messagingVariants.status) !== "ready") {
    missingInputs.push("messagingVariants");
  }

  if (!acquisitionSourceMetrics || normalizeString(acquisitionSourceMetrics.status) !== "ready") {
    missingInputs.push("acquisitionSourceMetrics");
  }

  return missingInputs;
}

function buildCandidateKeys(visitorContext) {
  const normalizedVisitorContext = normalizeObject(visitorContext);

  return [
    normalizedVisitorContext?.persona,
    normalizedVisitorContext?.audience,
    normalizedVisitorContext?.segment,
    normalizedVisitorContext?.segmentType,
  ]
    .map((value) => normalizeString(value)?.toLowerCase())
    .filter(Boolean);
}

function findVariantByVisitorIntent(variants, visitorContext) {
  const candidateKeys = buildCandidateKeys(visitorContext);

  if (candidateKeys.length === 0) {
    return null;
  }

  return (
    variants.find((variant) => {
      const label = normalizeString(variant?.audienceLabel)?.toLowerCase();
      const segmentType = normalizeString(variant?.segmentType)?.toLowerCase();

      return candidateKeys.some((key) => key === label || key === segmentType);
    }) ?? null
  );
}

function findVariantByAcquisitionSource(variants, acquisitionSourceMetrics) {
  const source = normalizeString(acquisitionSourceMetrics?.entries?.[0]?.source)?.toLowerCase();
  if (!source) {
    return null;
  }

  if (source.includes("community")) {
    return variants.find((variant) => normalizeString(variant?.segmentType)?.toLowerCase() === "operators") ?? null;
  }

  if (source.includes("sales") || source.includes("outbound")) {
    return variants.find((variant) => normalizeString(variant?.segmentType)?.toLowerCase() === "teams") ?? null;
  }

  return null;
}

function selectVariant(messagingVariants, visitorContext, acquisitionSourceMetrics) {
  const variants = Array.isArray(messagingVariants?.variants) ? messagingVariants.variants : [];
  if (variants.length === 0) {
    return null;
  }

  return (
    findVariantByVisitorIntent(variants, visitorContext)
    ?? findVariantByAcquisitionSource(variants, acquisitionSourceMetrics)
    ?? variants.find((variant) => normalizeString(variant?.segmentType)?.toLowerCase() === "general")
    ?? variants[0]
  );
}

function resolveMatchReason(selectedVariant, visitorContext, acquisitionSourceMetrics) {
  const candidateKeys = buildCandidateKeys(visitorContext);
  const label = normalizeString(selectedVariant?.audienceLabel)?.toLowerCase();
  const segmentType = normalizeString(selectedVariant?.segmentType)?.toLowerCase();

  if (candidateKeys.some((key) => key === label || key === segmentType)) {
    return "visitor-persona";
  }

  const source = normalizeString(acquisitionSourceMetrics?.entries?.[0]?.source);
  if (source) {
    return "acquisition-source";
  }

  return "default-fallback";
}

export function createPersonaSpecificLandingVariantResolver({
  messagingVariants = null,
  visitorContext = null,
  acquisitionSourceMetrics = null,
} = {}) {
  const normalizedMessagingVariants = normalizeObject(messagingVariants);
  const normalizedVisitorContext = normalizeObject(visitorContext);
  const normalizedAcquisitionSourceMetrics = normalizeObject(acquisitionSourceMetrics);
  const missingInputs = buildMissingInputs(normalizedMessagingVariants, normalizedAcquisitionSourceMetrics);

  if (missingInputs.length > 0) {
    return {
      landingVariantDecision: {
        landingVariantDecisionId: `landing-variant:${slugify(normalizedMessagingVariants?.messagingVariantsId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  const selectedVariant = selectVariant(
    normalizedMessagingVariants,
    normalizedVisitorContext,
    normalizedAcquisitionSourceMetrics,
  );

  return {
    landingVariantDecision: {
      landingVariantDecisionId: `landing-variant:${slugify(normalizedMessagingVariants.messagingVariantsId)}`,
      status: "ready",
      missingInputs: [],
      selectedVariantId: selectedVariant?.variantId ?? null,
      segmentType: normalizeString(selectedVariant?.segmentType) ?? "general",
      audienceLabel: normalizeString(selectedVariant?.audienceLabel) ?? "General audience",
      headline: normalizeString(selectedVariant?.headline) ?? normalizeString(normalizedMessagingVariants?.variants?.[0]?.headline),
      subheadline: normalizeString(selectedVariant?.subheadline) ?? null,
      acquisitionSource: normalizeString(normalizedAcquisitionSourceMetrics?.entries?.[0]?.source) ?? "direct",
      channelIntent: normalizeString(normalizedVisitorContext?.channelIntent) ?? "product-evaluation",
      matchReason: resolveMatchReason(selectedVariant, normalizedVisitorContext, normalizedAcquisitionSourceMetrics),
    },
  };
}
