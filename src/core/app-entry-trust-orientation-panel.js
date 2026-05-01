function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(appLandingEntry, trustProofBlocks) {
  const missingInputs = [];
  if (!appLandingEntry || normalizeString(appLandingEntry.status) !== "ready") missingInputs.push("appLandingEntry");
  if (!trustProofBlocks || normalizeString(trustProofBlocks.status) !== "ready") missingInputs.push("trustProofBlocks");
  return missingInputs;
}

export function createAppEntryTrustAndOrientationPanel({
  appLandingEntry = null,
  trustProofBlocks = null,
} = {}) {
  const normalizedEntry = normalizeObject(appLandingEntry);
  const normalizedTrust = normalizeObject(trustProofBlocks);
  const missingInputs = buildMissingInputs(normalizedEntry, normalizedTrust);

  if (missingInputs.length > 0) {
    return {
      entryOrientationPanel: {
        entryOrientationPanelId: `entry-orientation:${slugify(normalizedEntry?.appLandingEntryId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  return {
    entryOrientationPanel: {
      entryOrientationPanelId: `entry-orientation:${slugify(normalizedEntry.appLandingEntryId)}`,
      status: "ready",
      missingInputs: [],
      headline: normalizeString(normalizedEntry.heroTitle) ?? "Why trust Nexus",
      trustPoints: (Array.isArray(normalizedTrust.blocks) ? normalizedTrust.blocks : [])
        .slice(0, 3)
        .map((block) => normalizeString(block.title) ?? normalizeString(block.headline))
        .filter(Boolean),
      nextStepLabel: "Choose your next step",
    },
  };
}
