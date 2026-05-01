function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(siteAppBoundary, accessModeDecision, productCtaStrategy) {
  const missingInputs = [];
  if (!siteAppBoundary || normalizeString(siteAppBoundary.status) !== "ready") {
    missingInputs.push("siteAppBoundary");
  }
  if (!accessModeDecision || normalizeString(accessModeDecision.status) !== "ready") {
    missingInputs.push("accessModeDecision");
  }
  if (!productCtaStrategy || normalizeString(productCtaStrategy.status) !== "ready") {
    missingInputs.push("productCtaStrategy");
  }
  return missingInputs;
}

function resolveRoute(mode, primaryCta) {
  if (mode === "waitlist") {
    return "/waitlist";
  }
  if (mode === "request-access") {
    return "/request-access";
  }
  if (mode === "invite-only") {
    return "/login";
  }
  if (primaryCta?.ctaId === "cta:start-project") {
    return "/signup";
  }
  return "/signup";
}

export function createPublicLandingAuthHandoffFlow({
  siteAppBoundary = null,
  accessModeDecision = null,
  productCtaStrategy = null,
} = {}) {
  const normalizedBoundary = normalizeObject(siteAppBoundary);
  const normalizedAccessModeDecision = normalizeObject(accessModeDecision);
  const normalizedStrategy = normalizeObject(productCtaStrategy);
  const missingInputs = buildMissingInputs(normalizedBoundary, normalizedAccessModeDecision, normalizedStrategy);

  if (missingInputs.length > 0) {
    return {
      landingAuthHandoff: {
        landingAuthHandoffId: `landing-auth-handoff:${slugify(normalizedBoundary?.siteAppBoundaryId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  const primaryCta = normalizedStrategy.primaryCta ?? null;
  const destinationRoute = resolveRoute(normalizedAccessModeDecision.mode, primaryCta);

  return {
    landingAuthHandoff: {
      landingAuthHandoffId: `landing-auth-handoff:${slugify(normalizedBoundary.siteAppBoundaryId)}`,
      status: "ready",
      missingInputs: [],
      destinationRoute,
      preserveMarketingContext: true,
      trustBoundary: normalizedBoundary.trustBoundary,
      mode: normalizedAccessModeDecision.mode,
      ctaLabel: primaryCta?.label ?? null,
    },
  };
}
