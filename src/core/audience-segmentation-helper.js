function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return (normalizeString(value) ?? "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function classifyAudienceLabel(label) {
  const normalizedLabel = normalizeString(label)?.toLowerCase() ?? "";

  if (normalizedLabel.includes("indie")) {
    return { segmentType: "indie-builders", defaultLabel: "Indie builders" };
  }
  if (normalizedLabel.includes("agenc")) {
    return { segmentType: "agencies", defaultLabel: "Agencies" };
  }
  if (normalizedLabel.includes("founder")) {
    return { segmentType: "founders", defaultLabel: "Founders" };
  }
  if (normalizedLabel.includes("operator")) {
    return { segmentType: "operators", defaultLabel: "Operators" };
  }
  if (normalizedLabel.includes("product team")) {
    return { segmentType: "product-teams", defaultLabel: "Product teams" };
  }
  if (normalizedLabel.includes("product")) {
    return { segmentType: "product-operators", defaultLabel: "Product operators" };
  }

  return { segmentType: "general", defaultLabel: normalizeString(label) ?? "General audience" };
}

function registerSegment(collection, label, source) {
  const normalizedLabel = normalizeString(label);
  if (!normalizedLabel) {
    return;
  }

  const classified = classifyAudienceLabel(normalizedLabel);
  const segmentId = `audience-segment:${classified.segmentType}`;
  if (collection.has(segmentId)) {
    return;
  }

  collection.set(segmentId, {
    segmentId,
    segmentType: classified.segmentType,
    label: normalizedLabel,
    source,
  });
}

export function deriveAudienceSegments({
  nexusPositioning = null,
  businessContext = null,
  projectIdentity = null,
} = {}) {
  const normalizedPositioning = normalizeObject(nexusPositioning);
  const normalizedBusinessContext = normalizeObject(businessContext);
  const normalizedProjectIdentity = normalizeObject(projectIdentity);
  const segments = new Map();

  registerSegment(segments, normalizedPositioning?.audience, "nexusPositioning.audience");
  registerSegment(segments, normalizedBusinessContext?.targetAudience, "businessContext.targetAudience");
  registerSegment(segments, normalizedProjectIdentity?.audience, "projectIdentity.audience");

  if (segments.size === 0 && normalizeString(normalizedPositioning?.problem)) {
    const fallbackLabel = `${normalizeString(normalizedPositioning?.audience) ?? "General"} audience`;
    registerSegment(segments, fallbackLabel, "fallback");
  }

  return {
    audienceSegmentsId: `audience-segments:${slugify(
      normalizedPositioning?.nexusPositioningId ?? normalizedBusinessContext?.targetAudience ?? normalizedProjectIdentity?.audience ?? "unknown",
    )}`,
    segments: [...segments.values()],
  };
}
