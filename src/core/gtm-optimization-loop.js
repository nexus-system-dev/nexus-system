function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(launchPerformanceDashboard) {
  const missingInputs = [];
  if (!launchPerformanceDashboard || normalizeString(launchPerformanceDashboard.status) !== "ready") {
    missingInputs.push("launchPerformanceDashboard");
  }
  return missingInputs;
}

function buildRecommendations(launchFeedbackSummary) {
  const items = [];
  const topThemes = Array.isArray(launchFeedbackSummary?.topThemes) ? launchFeedbackSummary.topThemes : [];

  if (topThemes.length > 0) {
    items.push({
      recommendationId: `gtm-opt:${slugify(topThemes[0])}`,
      area: "messaging",
      action: `Strengthen messaging around ${topThemes[0]}`,
    });
  }

  if (items.length === 0) {
    items.push({
      recommendationId: "gtm-opt:cta-iteration",
      area: "cta-strategy",
      action: "Run another CTA iteration against the highest-intent path",
    });
  }

  return items;
}

export function createGtmOptimizationLoop({
  launchPerformanceDashboard = null,
  launchFeedbackSummary = null,
} = {}) {
  const normalizedDashboard = normalizeObject(launchPerformanceDashboard);
  const normalizedFeedback = normalizeObject(launchFeedbackSummary);
  const missingInputs = buildMissingInputs(normalizedDashboard);

  if (missingInputs.length > 0) {
    return {
      gtmOptimizationPlan: {
        gtmOptimizationPlanId: `gtm-optimization:${slugify(normalizedDashboard?.launchPerformanceDashboardId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  return {
    gtmOptimizationPlan: {
      gtmOptimizationPlanId: `gtm-optimization:${slugify(normalizedDashboard.launchPerformanceDashboardId)}`,
      status: "ready",
      missingInputs: [],
      loopState: "ready-for-next-iteration",
      recommendations: buildRecommendations(normalizedFeedback),
    },
  };
}
