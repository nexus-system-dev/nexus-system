function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(entryStateVariants, accessModeDecision, entryOrientationPanel) {
  const missingInputs = [];
  if (!entryStateVariants || normalizeString(entryStateVariants.status) !== "ready") missingInputs.push("entryStateVariants");
  if (!accessModeDecision || normalizeString(accessModeDecision.status) !== "ready") missingInputs.push("accessModeDecision");
  if (!entryOrientationPanel || normalizeString(entryOrientationPanel.status) !== "ready") missingInputs.push("entryOrientationPanel");
  return missingInputs;
}

function resolveRecommendedPath(accessModeDecision, visitorContext) {
  const mode = normalizeString(accessModeDecision?.mode) ?? "request-access";
  const channelIntent = normalizeString(visitorContext?.channelIntent)?.toLowerCase();

  if (mode === "waitlist") {
    return "waitlist";
  }
  if (channelIntent === "demo-request") {
    return "demo";
  }
  if (mode === "open-access") {
    return "signup";
  }
  return "request-access";
}

export function createEntryDecisionSupportFlow({
  entryStateVariants = null,
  accessModeDecision = null,
  entryOrientationPanel = null,
  visitorContext = null,
} = {}) {
  const normalizedVariants = normalizeObject(entryStateVariants);
  const normalizedAccess = normalizeObject(accessModeDecision);
  const normalizedOrientation = normalizeObject(entryOrientationPanel);
  const normalizedVisitorContext = normalizeObject(visitorContext);
  const missingInputs = buildMissingInputs(normalizedVariants, normalizedAccess, normalizedOrientation);

  if (missingInputs.length > 0) {
    return {
      entryDecisionSupport: {
        entryDecisionSupportId: `entry-decision-support:${slugify(normalizedVariants?.entryStateVariantsId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  const recommendedPath = resolveRecommendedPath(normalizedAccess, normalizedVisitorContext);

  return {
    entryDecisionSupport: {
      entryDecisionSupportId: `entry-decision-support:${slugify(normalizedVariants.entryStateVariantsId)}`,
      status: "ready",
      missingInputs: [],
      recommendedPath,
      orientationHeadline: normalizeString(normalizedOrientation.headline),
      alternatives: (Array.isArray(normalizedVariants.variants) ? normalizedVariants.variants : [])
        .map((variant) => normalizeString(variant.kind))
        .filter(Boolean),
    },
  };
}
