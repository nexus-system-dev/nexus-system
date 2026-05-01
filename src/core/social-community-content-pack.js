function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(storyAssets, launchContentCalendar) {
  const missingInputs = [];
  if (!storyAssets || normalizeString(storyAssets.status) !== "ready") {
    missingInputs.push("storyAssets");
  }
  if (!launchContentCalendar || normalizeString(launchContentCalendar.status) !== "ready") {
    missingInputs.push("launchContentCalendar");
  }
  return missingInputs;
}

export function createSocialAndCommunityContentPack({
  storyAssets = null,
  launchContentCalendar = null,
} = {}) {
  const normalizedAssets = normalizeObject(storyAssets);
  const normalizedCalendar = normalizeObject(launchContentCalendar);
  const missingInputs = buildMissingInputs(normalizedAssets, normalizedCalendar);

  if (missingInputs.length > 0) {
    return {
      socialCommunityPack: {
        socialCommunityPackId: `social-community-pack:${slugify(normalizedAssets?.storyAssetsId)}`,
        status: "missing-inputs",
        missingInputs,
        assets: [],
      },
    };
  }

  return {
    socialCommunityPack: {
      socialCommunityPackId: `social-community-pack:${slugify(normalizedAssets.storyAssetsId)}`,
      status: "ready",
      missingInputs: [],
      assets: normalizedAssets.assets.map((asset, index) => ({
        assetId: `social:${index + 1}`,
        channel: index === 0 ? "x" : "community",
        hook: asset.title,
      })),
      cadence: normalizedCalendar.entries?.map((entry) => entry.phase) ?? [],
    },
  };
}
