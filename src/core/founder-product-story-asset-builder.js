function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(nexusPositioning, launchContentCalendar) {
  const missingInputs = [];
  if (!nexusPositioning || normalizeString(nexusPositioning.status) !== "ready") {
    missingInputs.push("nexusPositioning");
  }
  if (!launchContentCalendar || normalizeString(launchContentCalendar.status) !== "ready") {
    missingInputs.push("launchContentCalendar");
  }
  return missingInputs;
}

export function createFounderAndProductStoryAssetBuilder({
  nexusPositioning = null,
  launchContentCalendar = null,
} = {}) {
  const normalizedPositioning = normalizeObject(nexusPositioning);
  const normalizedCalendar = normalizeObject(launchContentCalendar);
  const missingInputs = buildMissingInputs(normalizedPositioning, normalizedCalendar);

  if (missingInputs.length > 0) {
    return {
      storyAssets: {
        storyAssetsId: `story-assets:${slugify(normalizedPositioning?.nexusPositioningId)}`,
        status: "missing-inputs",
        missingInputs,
        assets: [],
      },
    };
  }

  return {
    storyAssets: {
      storyAssetsId: `story-assets:${slugify(normalizedPositioning.nexusPositioningId)}`,
      status: "ready",
      missingInputs: [],
      assets: [
        { assetId: "story:problem", title: "Why Nexus exists", angle: normalizedPositioning.problem },
        { assetId: "story:promise", title: "What Nexus changes", angle: normalizedPositioning.promise },
        { assetId: "story:launch", title: "How we are launching", angle: normalizedCalendar.entries?.[1]?.format ?? "launch-post" },
      ],
    },
  };
}
