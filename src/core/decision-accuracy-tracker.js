function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(ownerActionRecommendations) {
  const missingInputs = [];
  if (!ownerActionRecommendations || normalizeString(ownerActionRecommendations.status) !== "ready") missingInputs.push("ownerActionRecommendations");
  return missingInputs;
}

export function createDecisionAccuracyTracker({
  ownerActionRecommendations = null,
  outcomeEvaluation = null,
} = {}) {
  const recommendations = normalizeObject(ownerActionRecommendations);
  const outcome = normalizeObject(outcomeEvaluation);
  const missingInputs = buildMissingInputs(recommendations);

  if (missingInputs.length > 0) {
    return { decisionAccuracySummary: { decisionAccuracySummaryId: `decision-accuracy:${slugify(recommendations?.ownerActionRecommendationsId)}`, status: "missing-inputs", missingInputs } };
  }

  return {
    decisionAccuracySummary: {
      decisionAccuracySummaryId: `decision-accuracy:${slugify(recommendations.ownerActionRecommendationsId)}`,
      status: "ready",
      missingInputs: [],
      recommendationsTracked: Array.isArray(recommendations.recommendations) ? recommendations.recommendations.length : 0,
      outcomeStatus: normalizeString(outcome?.status) ?? "not-required",
    },
  };
}
