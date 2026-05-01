function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}
function buildMissingInputs(launchCampaignBrief, websiteConversionFlow) {
  const missingInputs = [];
  if (!launchCampaignBrief || normalizeString(launchCampaignBrief.status) !== "ready") missingInputs.push("launchCampaignBrief");
  if (!websiteConversionFlow || normalizeString(websiteConversionFlow.status) !== "ready") missingInputs.push("websiteConversionFlow");
  return missingInputs;
}
export function defineGtmMetricSchema({ launchCampaignBrief = null, websiteConversionFlow = null } = {}) {
  const brief = normalizeObject(launchCampaignBrief);
  const flow = normalizeObject(websiteConversionFlow);
  const missingInputs = buildMissingInputs(brief, flow);
  if (missingInputs.length > 0) {
    return { gtmMetricSchema: { gtmMetricSchemaId: `gtm-schema:${slugify(brief?.launchCampaignBriefId)}`, status: "missing-inputs", missingInputs, metrics: [] } };
  }
  return {
    gtmMetricSchema: {
      gtmMetricSchemaId: `gtm-schema:${slugify(brief.launchCampaignBriefId)}`,
      status: "ready",
      missingInputs: [],
      metrics: ["visits", "signups", "activation", "waitlist-conversion", "campaign-attribution"],
      primaryRoute: flow.entryRoute ?? "signup",
    },
  };
}
