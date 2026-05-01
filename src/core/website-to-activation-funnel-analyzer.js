function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}
function buildMissingInputs(acquisitionSourceMetrics, activationMilestones) {
  const missingInputs = [];
  if (!acquisitionSourceMetrics || normalizeString(acquisitionSourceMetrics.status) !== "ready") missingInputs.push("acquisitionSourceMetrics");
  if (!activationMilestones || normalizeString(activationMilestones.status) !== "ready") missingInputs.push("activationMilestones");
  return missingInputs;
}
export function createWebsiteToActivationFunnelAnalyzer({ acquisitionSourceMetrics = null, activationMilestones = null } = {}) {
  const acquisition = normalizeObject(acquisitionSourceMetrics);
  const milestones = normalizeObject(activationMilestones);
  const missingInputs = buildMissingInputs(acquisition, milestones);
  if (missingInputs.length > 0) {
    return { websiteActivationFunnel: { websiteActivationFunnelId: `website-activation:${slugify(acquisition?.acquisitionSourceMetricsId)}`, status: "missing-inputs", missingInputs, stages: [] } };
  }
  return {
    websiteActivationFunnel: {
      websiteActivationFunnelId: `website-activation:${slugify(acquisition.acquisitionSourceMetricsId)}`,
      status: "ready",
      missingInputs: [],
      stages: [
        { stage: "visit", count: acquisition.entries?.length ?? 0 },
        { stage: "signup", count: 1 },
        { stage: "first-project", count: milestones.milestones?.some((m) => m.milestone === "first-project") ? 1 : 0 },
      ],
    },
  };
}
