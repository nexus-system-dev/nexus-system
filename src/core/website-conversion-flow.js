function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(productCtaStrategy, authenticationState) {
  const missingInputs = [];
  if (!productCtaStrategy || normalizeString(productCtaStrategy.status) !== "ready") {
    missingInputs.push("productCtaStrategy");
  }
  if (!authenticationState || normalizeString(authenticationState.status) === null) {
    missingInputs.push("authenticationState");
  }
  return missingInputs;
}

function resolveEntryRoute(primaryCta, authenticationState) {
  if (primaryCta?.ctaId === "cta:book-demo") {
    return "book-demo";
  }
  if (primaryCta?.ctaId === "cta:join-waitlist") {
    return "waitlist";
  }
  if (authenticationState?.isAuthenticated === true) {
    return "onboarding";
  }
  return "signup";
}

export function createWebsiteConversionFlow({
  productCtaStrategy = null,
  authenticationState = null,
} = {}) {
  const normalizedStrategy = normalizeObject(productCtaStrategy);
  const normalizedAuth = normalizeObject(authenticationState);
  const missingInputs = buildMissingInputs(normalizedStrategy, normalizedAuth);

  if (missingInputs.length > 0) {
    return {
      websiteConversionFlow: {
        websiteConversionFlowId: `website-conversion-flow:${slugify(normalizedStrategy?.productCtaStrategyId)}`,
        status: "missing-inputs",
        missingInputs,
        steps: [],
      },
    };
  }

  const primaryCta = normalizedStrategy.primaryCta ?? null;
  const entryRoute = resolveEntryRoute(primaryCta, normalizedAuth);

  return {
    websiteConversionFlow: {
      websiteConversionFlowId: `website-conversion-flow:${slugify(normalizedStrategy.productCtaStrategyId)}`,
      status: "ready",
      missingInputs: [],
      entryRoute,
      steps: [
        "visitor-arrives",
        primaryCta?.ctaId ?? "cta:unknown",
        entryRoute,
        entryRoute === "onboarding" ? "onboarding-entry" : "access-capture",
      ],
      primaryCta,
    },
  };
}
