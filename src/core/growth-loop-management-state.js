function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(conversionAnalytics) {
  const missingInputs = [];
  if (!conversionAnalytics || normalizeString(conversionAnalytics.status) !== "ready") {
    missingInputs.push("conversionAnalytics");
  }
  return missingInputs;
}

export function createGrowthLoopManagementState({
  conversionAnalytics = null,
  launchPerformanceDashboard = null,
} = {}) {
  const normalizedAnalytics = normalizeObject(conversionAnalytics);
  const normalizedDashboard = normalizeObject(launchPerformanceDashboard);
  const missingInputs = buildMissingInputs(normalizedAnalytics);

  if (missingInputs.length > 0) {
    return {
      growthLoopManagement: {
        growthLoopManagementId: `growth-loop:${slugify(normalizedAnalytics?.conversionAnalyticsId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  return {
    growthLoopManagement: {
      growthLoopManagementId: `growth-loop:${slugify(normalizedAnalytics.conversionAnalyticsId)}`,
      status: "ready",
      missingInputs: [],
      hypotheses: [
        {
          hypothesisId: "growth-hypothesis:improve-first-touch-cta",
          summary: "Improve first-touch CTA clarity for the highest-intent landing path",
        },
      ],
      nextAction: normalizeString(normalizedDashboard?.summaryCards?.[0]?.label) ?? "Review conversion analytics",
    },
  };
}
