function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(landingVariantDecision, productCtaStrategy) {
  const missingInputs = [];
  if (!landingVariantDecision || normalizeString(landingVariantDecision.status) !== "ready") {
    missingInputs.push("landingVariantDecision");
  }
  if (!productCtaStrategy || normalizeString(productCtaStrategy.status) !== "ready") {
    missingInputs.push("productCtaStrategy");
  }
  return missingInputs;
}

export function createFirstTouchAttributionRecorder({
  visitorContext = null,
  landingVariantDecision = null,
  productCtaStrategy = null,
} = {}) {
  const normalizedVisitorContext = normalizeObject(visitorContext);
  const normalizedDecision = normalizeObject(landingVariantDecision);
  const normalizedCta = normalizeObject(productCtaStrategy);
  const missingInputs = buildMissingInputs(normalizedDecision, normalizedCta);

  if (missingInputs.length > 0) {
    return {
      firstTouchAttribution: {
        firstTouchAttributionId: `first-touch:${slugify(normalizedDecision?.landingVariantDecisionId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  return {
    firstTouchAttribution: {
      firstTouchAttributionId: `first-touch:${slugify(normalizedDecision.landingVariantDecisionId)}`,
      status: "ready",
      missingInputs: [],
      source: normalizeString(normalizedDecision.acquisitionSource) ?? "direct",
      landingVariantId: normalizeString(normalizedDecision.selectedVariantId),
      channelIntent: normalizeString(normalizedVisitorContext?.channelIntent) ?? "product-evaluation",
      anonymousVisitorId: normalizeString(normalizedVisitorContext?.anonymousVisitorId) ?? null,
      ctaId: normalizeString(normalizedCta?.primaryCta?.ctaId) ?? "cta:unknown",
    },
  };
}
