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
  if (!ownerActionRecommendations || normalizeString(ownerActionRecommendations.status) !== "ready") {
    missingInputs.push("ownerActionRecommendations");
  }
  return missingInputs;
}

export function createOwnerDecisionDashboard({
  ownerActionRecommendations = null,
  approvalChain = null,
} = {}) {
  const normalizedRecommendations = normalizeObject(ownerActionRecommendations);
  const normalizedApprovalChain = normalizeObject(approvalChain);
  const missingInputs = buildMissingInputs(normalizedRecommendations);

  if (missingInputs.length > 0) {
    return {
      ownerDecisionDashboard: {
        ownerDecisionDashboardId: `owner-decision-dashboard:${slugify(normalizedRecommendations?.ownerActionRecommendationsId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  return {
    ownerDecisionDashboard: {
      ownerDecisionDashboardId: `owner-decision-dashboard:${slugify(normalizedRecommendations.ownerActionRecommendationsId)}`,
      status: "ready",
      missingInputs: [],
      openDecisions: Array.isArray(normalizedRecommendations.recommendations) ? normalizedRecommendations.recommendations.length : 0,
      approvalStatus: normalizeString(normalizedApprovalChain?.status) ?? "missing",
      approvalEntries: Array.isArray(normalizedApprovalChain?.entries) ? normalizedApprovalChain.entries.length : 0,
    },
  };
}
