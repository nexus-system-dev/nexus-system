function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(preAuthConversionEvents, websiteActivationFunnel) {
  const missingInputs = [];
  if (!preAuthConversionEvents || normalizeString(preAuthConversionEvents.status) !== "ready") {
    missingInputs.push("preAuthConversionEvents");
  }
  if (!websiteActivationFunnel || normalizeString(websiteActivationFunnel.status) !== "ready") {
    missingInputs.push("websiteActivationFunnel");
  }
  return missingInputs;
}

export function createConversionAnalyticsModel({
  preAuthConversionEvents = null,
  websiteActivationFunnel = null,
} = {}) {
  const normalizedEvents = normalizeObject(preAuthConversionEvents);
  const normalizedFunnel = normalizeObject(websiteActivationFunnel);
  const missingInputs = buildMissingInputs(normalizedEvents, normalizedFunnel);

  if (missingInputs.length > 0) {
    return {
      conversionAnalytics: {
        conversionAnalyticsId: `conversion-analytics:${slugify(normalizedEvents?.preAuthConversionEventsId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  return {
    conversionAnalytics: {
      conversionAnalyticsId: `conversion-analytics:${slugify(normalizedEvents.preAuthConversionEventsId)}`,
      status: "ready",
      missingInputs: [],
      totalPreAuthEvents: Array.isArray(normalizedEvents.events) ? normalizedEvents.events.length : 0,
      funnelStatus: normalizeString(normalizedFunnel.status) ?? "ready",
      dropOffReason: "not-enough-first-value-data",
    },
  };
}
