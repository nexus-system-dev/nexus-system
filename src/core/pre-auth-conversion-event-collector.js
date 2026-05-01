function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(firstTouchAttribution, landingAuthHandoff) {
  const missingInputs = [];
  if (!firstTouchAttribution || normalizeString(firstTouchAttribution.status) !== "ready") {
    missingInputs.push("firstTouchAttribution");
  }
  if (!landingAuthHandoff || normalizeString(landingAuthHandoff.status) !== "ready") {
    missingInputs.push("landingAuthHandoff");
  }
  return missingInputs;
}

export function createPreAuthConversionEventCollector({
  firstTouchAttribution = null,
  landingAuthHandoff = null,
} = {}) {
  const normalizedAttribution = normalizeObject(firstTouchAttribution);
  const normalizedHandoff = normalizeObject(landingAuthHandoff);
  const missingInputs = buildMissingInputs(normalizedAttribution, normalizedHandoff);

  if (missingInputs.length > 0) {
    return {
      preAuthConversionEvents: {
        preAuthConversionEventsId: `pre-auth-conversion:${slugify(normalizedAttribution?.firstTouchAttributionId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  return {
    preAuthConversionEvents: {
      preAuthConversionEventsId: `pre-auth-conversion:${slugify(normalizedAttribution.firstTouchAttributionId)}`,
      status: "ready",
      missingInputs: [],
      events: [
        {
          eventId: "pre-auth-event:landing-view",
          eventType: "landing-view",
          source: normalizedAttribution.source,
        },
        {
          eventId: "pre-auth-event:auth-handoff",
          eventType: "auth-handoff-start",
          destinationRoute: normalizeString(normalizedHandoff.destinationRoute) ?? "/signup",
        },
      ],
    },
  };
}
