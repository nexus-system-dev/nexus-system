// Task #178 — Create product iteration feedback engine
// Returns recommendations for improving flows, features and defaults based on
// feature success, outcome scores and user behavior.

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function buildRecommendation(area, insight, priority, actionType) {
  return {
    recommendationId: `rec:${area}:${Date.now()}`,
    area,
    insight,
    priority,
    actionType,
  };
}

export function createProductIterationFeedbackEngine({
  featureSuccessSummary = null,
  outcomeFeedbackState = null,
  analyticsSummary = null,
} = {}) {
  const summaryRaw = normalizeObject(featureSuccessSummary);
  const summary = normalizeObject(summaryRaw.featureSuccessSummary ?? summaryRaw);
  const outcomeState = normalizeObject(outcomeFeedbackState);
  const analytics = normalizeObject(analyticsSummary);
  const analyticsInner = normalizeObject(analytics.analyticsSummary ?? analytics);

  const engineId = `product-iteration-engine:${Date.now()}`;
  const recommendations = [];

  // Feature friction recommendations
  const frictionIndicators = normalizeArray(summary.frictionIndicators);
  if (frictionIndicators.includes("high-override-rate")) {
    recommendations.push(buildRecommendation(
      "feature-defaults",
      "High override rate suggests defaults don't match user intent",
      "high",
      "adjust-defaults"
    ));
  }
  if (frictionIndicators.includes("low-completion-rate")) {
    recommendations.push(buildRecommendation(
      "flow-design",
      "Low completion rate indicates friction in the user flow",
      "high",
      "simplify-flow"
    ));
  }
  if (frictionIndicators.includes("multiple-drop-off-points")) {
    recommendations.push(buildRecommendation(
      "onboarding",
      "Multiple drop-off points detected — review onboarding steps",
      "medium",
      "review-onboarding"
    ));
  }

  // Adoption recommendations
  const adoptionLevel = normalizeString(summary.adoptionLevel);
  if (adoptionLevel === "low") {
    recommendations.push(buildRecommendation(
      "feature-discoverability",
      "Low adoption — consider improving feature discoverability",
      "medium",
      "improve-discoverability"
    ));
  }

  // Outcome score recommendations
  const outcomeScore = normalizeFiniteNumber(outcomeState.averageScore ?? outcomeState.score);
  if (outcomeScore < 0.5 && Object.keys(outcomeState).length > 0) {
    recommendations.push(buildRecommendation(
      "outcome-quality",
      "Low outcome scores indicate quality improvement opportunities",
      "high",
      "improve-quality"
    ));
  }

  // Analytics-based recommendations
  const retentionRate = normalizeFiniteNumber(analyticsInner.retentionRate ?? analyticsInner.totalReturningUsers);
  if (retentionRate > 0 && retentionRate < 0.4) {
    recommendations.push(buildRecommendation(
      "retention",
      "Low retention rate — prioritize re-engagement campaigns",
      "high",
      "reengagement-campaign"
    ));
  }

  const highPriorityCount = recommendations.filter((r) => r.priority === "high").length;

  return {
    productIterationInsights: {
      engineId,
      recommendations,
      recommendationCount: recommendations.length,
      highPriorityCount,
      meta: {
        hasFeatureData: Object.keys(summary).length > 0,
        hasOutcomeData: Object.keys(outcomeState).length > 0,
        hasAnalyticsData: Object.keys(analyticsInner).length > 0,
        requiresImmediateAction: highPriorityCount > 0,
      },
    },
  };
}
