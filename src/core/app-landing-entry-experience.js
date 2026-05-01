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
  if (!siteAppBoundary || normalizeString(siteAppBoundary.status) !== "ready") missingInputs.push("siteAppBoundary");
  if (!accessModeDecision || normalizeString(accessModeDecision.status) !== "ready") missingInputs.push("accessModeDecision");
  if (!productCtaStrategy || normalizeString(productCtaStrategy.status) !== "ready") missingInputs.push("productCtaStrategy");
  return missingInputs;
}

function buildFirstVisitStates(accessModeDecision) {
  const mode = normalizeString(accessModeDecision?.mode) ?? "request-access";

  return [
    {
      stateId: "first-visit",
      mode,
      route: mode === "open-access" ? "/signup" : `/${mode}`,
    },
    {
      stateId: "returning-visit",
      mode: "login",
      route: "/login",
    },
  ];
}

export function createAppLandingEntryExperience({
  siteAppBoundary = null,
  accessModeDecision = null,
  productCtaStrategy = null,
} = {}) {
  const normalizedBoundary = normalizeObject(siteAppBoundary);
  const normalizedAccess = normalizeObject(accessModeDecision);
  const normalizedStrategy = normalizeObject(productCtaStrategy);
  const missingInputs = buildMissingInputs(normalizedBoundary, normalizedAccess, normalizedStrategy);

  if (missingInputs.length > 0) {
    return {
      appLandingEntry: {
        appLandingEntryId: `app-landing-entry:${slugify(normalizedBoundary?.siteAppBoundaryId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  return {
    appLandingEntry: {
      appLandingEntryId: `app-landing-entry:${slugify(normalizedBoundary.siteAppBoundaryId)}`,
      status: "ready",
      missingInputs: [],
      heroTitle: normalizeString(normalizedStrategy.primaryCta?.label) ?? "Open Nexus",
      trustBoundary: normalizeString(normalizedBoundary.trustBoundary),
      accessMode: normalizeString(normalizedAccess.mode) ?? "request-access",
      firstVisitStates: buildFirstVisitStates(normalizedAccess),
      ctas: [
        normalizedStrategy.primaryCta ?? null,
        ...(Array.isArray(normalizedStrategy.secondaryCtas) ? normalizedStrategy.secondaryCtas : []),
      ].filter(Boolean),
    },
  };
}
