function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}
function buildMissingInputs(launchCampaignBrief, socialCommunityPack) {
  const missingInputs = [];
  if (!launchCampaignBrief || normalizeString(launchCampaignBrief.status) !== "ready") missingInputs.push("launchCampaignBrief");
  if (!socialCommunityPack || normalizeString(socialCommunityPack.status) !== "ready") missingInputs.push("socialCommunityPack");
  return missingInputs;
}
export function createLaunchChannelRolloutPlan({ launchCampaignBrief = null, socialCommunityPack = null } = {}) {
  const brief = normalizeObject(launchCampaignBrief);
  const pack = normalizeObject(socialCommunityPack);
  const missingInputs = buildMissingInputs(brief, pack);
  if (missingInputs.length > 0) {
    return { launchRolloutPlan: { launchRolloutPlanId: `launch-rollout:${slugify(brief?.launchCampaignBriefId)}`, status: "missing-inputs", missingInputs, channels: [] } };
  }
  return {
    launchRolloutPlan: {
      launchRolloutPlanId: `launch-rollout:${slugify(brief.launchCampaignBriefId)}`,
      status: "ready",
      missingInputs: [],
      channels: (brief.channels ?? []).map((channel, index) => ({ channelId: `channel:${index + 1}`, channel, assetCount: pack.assets?.length ?? 0 })),
    },
  };
}
