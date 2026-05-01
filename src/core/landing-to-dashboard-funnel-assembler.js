function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(landingAuthHandoff, appEntryDecision, postLoginDestination) {
  const missingInputs = [];
  if (!landingAuthHandoff || normalizeString(landingAuthHandoff.status) !== "ready") missingInputs.push("landingAuthHandoff");
  if (!appEntryDecision || normalizeString(appEntryDecision.status) !== "ready") missingInputs.push("appEntryDecision");
  if (!postLoginDestination || normalizeString(postLoginDestination.status) !== "ready") missingInputs.push("postLoginDestination");
  return missingInputs;
}

export function createLandingToDashboardFunnelAssembler({
  landingAuthHandoff = null,
  appEntryDecision = null,
  postLoginDestination = null,
  firstProjectKickoff = null,
} = {}) {
  const normalizedHandoff = normalizeObject(landingAuthHandoff);
  const normalizedEntryDecision = normalizeObject(appEntryDecision);
  const normalizedPostLoginDestination = normalizeObject(postLoginDestination);
  const normalizedKickoff = normalizeObject(firstProjectKickoff);
  const missingInputs = buildMissingInputs(normalizedHandoff, normalizedEntryDecision, normalizedPostLoginDestination);

  if (missingInputs.length > 0) {
    return {
      landingToDashboardFlow: {
        landingToDashboardFlowId: `landing-dashboard-flow:${slugify(normalizedHandoff?.landingAuthHandoffId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  const stages = [
    {
      stageId: "landing",
      route: normalizedHandoff.destinationRoute ?? "/signup",
    },
    {
      stageId: "app-entry",
      route: normalizedEntryDecision.destination ?? "/app",
    },
    {
      stageId: "post-login",
      route: normalizedPostLoginDestination.destination ?? "dashboard",
    },
  ];

  if (normalizeString(normalizedKickoff?.status) === "ready") {
    stages.push({
      stageId: "first-project",
      route: normalizedKickoff.destinationRoute ?? "/app/new-project",
    });
  }

  return {
    landingToDashboardFlow: {
      landingToDashboardFlowId: `landing-dashboard-flow:${slugify(normalizedHandoff.landingAuthHandoffId)}`,
      status: "ready",
      missingInputs: [],
      stages,
      finalDestination: normalizeString(normalizedKickoff?.destinationRoute) ?? normalizeString(normalizedPostLoginDestination.destination),
    },
  };
}
