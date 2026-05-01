function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(websiteActivationFunnel) {
  const missingInputs = [];
  if (!websiteActivationFunnel || normalizeString(websiteActivationFunnel.status) !== "ready") {
    missingInputs.push("websiteActivationFunnel");
  }
  return missingInputs;
}

export function createLaunchPerformanceDashboardAssembler({
  websiteActivationFunnel = null,
  launchFeedbackSummary = null,
  revenueSummary = null,
} = {}) {
  const normalizedFunnel = normalizeObject(websiteActivationFunnel);
  const normalizedFeedback = normalizeObject(launchFeedbackSummary);
  const normalizedRevenue = normalizeObject(revenueSummary);
  const missingInputs = buildMissingInputs(normalizedFunnel);

  if (missingInputs.length > 0) {
    return {
      launchPerformanceDashboard: {
        launchPerformanceDashboardId: `launch-performance:${slugify(normalizedFunnel?.websiteActivationFunnelId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  return {
    launchPerformanceDashboard: {
      launchPerformanceDashboardId: `launch-performance:${slugify(normalizedFunnel.websiteActivationFunnelId)}`,
      status: "ready",
      missingInputs: [],
      websiteActivationStatus: normalizeString(normalizedFunnel.status) ?? "ready",
      launchFeedbackStatus: normalizeString(normalizedFeedback?.status) ?? "not-required",
      revenueStatus: normalizeString(normalizedRevenue?.status) ?? "not-required",
      summaryCards: [
        { cardId: "website-activation", label: "Website to activation", status: normalizeString(normalizedFunnel.status) ?? "ready" },
        { cardId: "launch-feedback", label: "Launch feedback", status: normalizeString(normalizedFeedback?.status) ?? "not-required" },
        { cardId: "revenue", label: "Revenue", status: normalizeString(normalizedRevenue?.status) ?? "not-required" },
      ],
    },
  };
}
