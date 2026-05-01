function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(nexusContentStrategy) {
  const missingInputs = [];
  if (!nexusContentStrategy || normalizeString(nexusContentStrategy.status) !== "ready") {
    missingInputs.push("nexusContentStrategy");
  }
  return missingInputs;
}

export function createLaunchContentCalendar({
  nexusContentStrategy = null,
  businessContext = null,
} = {}) {
  const normalizedStrategy = normalizeObject(nexusContentStrategy);
  const normalizedBusinessContext = normalizeObject(businessContext);
  const missingInputs = buildMissingInputs(normalizedStrategy);

  if (missingInputs.length > 0) {
    return {
      launchContentCalendar: {
        launchContentCalendarId: `launch-content-calendar:${slugify(normalizedStrategy?.nexusContentStrategyId)}`,
        status: "missing-inputs",
        missingInputs,
        entries: [],
      },
    };
  }

  const launchWindow = normalizeString(normalizedBusinessContext?.gtmStage) ?? "launch";

  return {
    launchContentCalendar: {
      launchContentCalendarId: `launch-content-calendar:${slugify(normalizedStrategy.nexusContentStrategyId)}`,
      status: "ready",
      missingInputs: [],
      entries: [
        { entryId: "calendar:prelaunch", phase: "pre-launch", format: "founder-update" },
        { entryId: "calendar:launch", phase: launchWindow, format: "launch-post" },
        { entryId: "calendar:proof", phase: "post-launch", format: "proof-snapshot" },
      ],
    },
  };
}
