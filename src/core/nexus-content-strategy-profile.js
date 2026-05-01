function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(nexusPositioning, messagingVariants) {
  const missingInputs = [];
  if (!nexusPositioning || normalizeString(nexusPositioning.status) !== "ready") {
    missingInputs.push("nexusPositioning");
  }
  if (!messagingVariants || normalizeString(messagingVariants.status) !== "ready") {
    missingInputs.push("messagingVariants");
  }
  return missingInputs;
}

export function createNexusContentStrategyProfile({
  nexusPositioning = null,
  messagingVariants = null,
} = {}) {
  const normalizedPositioning = normalizeObject(nexusPositioning);
  const normalizedVariants = normalizeObject(messagingVariants);
  const missingInputs = buildMissingInputs(normalizedPositioning, normalizedVariants);

  if (missingInputs.length > 0) {
    return {
      nexusContentStrategy: {
        nexusContentStrategyId: `nexus-content-strategy:${slugify(normalizedPositioning?.nexusPositioningId)}`,
        status: "missing-inputs",
        missingInputs,
        pillars: [],
      },
    };
  }

  return {
    nexusContentStrategy: {
      nexusContentStrategyId: `nexus-content-strategy:${slugify(normalizedPositioning.nexusPositioningId)}`,
      status: "ready",
      missingInputs: [],
      founderVoice: "direct-and-governed",
      channelFit: ["website", "email", "social", "community"],
      pillars: [
        normalizedPositioning.problem,
        normalizedPositioning.promise,
        normalizedPositioning.differentiation?.[0] ?? "governed execution",
      ].filter(Boolean),
      segments: normalizedVariants.segments ?? [],
    },
  };
}
