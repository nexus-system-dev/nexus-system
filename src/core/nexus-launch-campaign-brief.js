function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(nexusPositioning) {
  const missingInputs = [];
  if (!nexusPositioning || normalizeString(nexusPositioning.status) !== "ready") {
    missingInputs.push("nexusPositioning");
  }
  return missingInputs;
}

export function createNexusLaunchCampaignBrief({
  nexusPositioning = null,
  businessContext = null,
} = {}) {
  const normalizedPositioning = normalizeObject(nexusPositioning);
  const normalizedBusinessContext = normalizeObject(businessContext);
  const missingInputs = buildMissingInputs(normalizedPositioning);

  if (missingInputs.length > 0) {
    return {
      launchCampaignBrief: {
        launchCampaignBriefId: `launch-campaign-brief:${slugify(normalizedPositioning?.nexusPositioningId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  return {
    launchCampaignBrief: {
      launchCampaignBriefId: `launch-campaign-brief:${slugify(normalizedPositioning.nexusPositioningId)}`,
      status: "ready",
      missingInputs: [],
      audience: normalizedPositioning.audience,
      message: normalizedPositioning.promise,
      channels: ["website", "email", "community"],
      successCriteria: normalizedBusinessContext?.kpis ?? ["activation-rate", "request-access-rate"],
    },
  };
}
