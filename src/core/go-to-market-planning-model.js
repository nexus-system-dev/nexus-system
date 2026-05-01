function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}
function buildMissingInputs(launchCampaignBrief, websiteConversionFlow, activationFunnel) {
  const missingInputs = [];
  if (!launchCampaignBrief || normalizeString(launchCampaignBrief.status) !== "ready") missingInputs.push("launchCampaignBrief");
  if (!websiteConversionFlow || normalizeString(websiteConversionFlow.status) !== "ready") missingInputs.push("websiteConversionFlow");
  if (!activationFunnel || normalizeString(activationFunnel.status) !== "ready") missingInputs.push("activationFunnel");
  return missingInputs;
}
export function createGoToMarketPlanningModel({ launchCampaignBrief = null, websiteConversionFlow = null, activationFunnel = null } = {}) {
  const brief = normalizeObject(launchCampaignBrief);
  const flow = normalizeObject(websiteConversionFlow);
  const funnel = normalizeObject(activationFunnel);
  const missingInputs = buildMissingInputs(brief, flow, funnel);
  if (missingInputs.length > 0) {
    return { goToMarketPlan: { goToMarketPlanId: `gtm-plan:${slugify(brief?.launchCampaignBriefId)}`, status: "missing-inputs", missingInputs, stages: [] } };
  }
  return {
    goToMarketPlan: {
      goToMarketPlanId: `gtm-plan:${slugify(brief.launchCampaignBriefId)}`,
      status: "ready",
      missingInputs: [],
      stages: [flow.entryRoute ?? "signup", ...(funnel.stages ?? []).map((s) => s.stageId)],
      channels: brief.channels ?? [],
    },
  };
}
