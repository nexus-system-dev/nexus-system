import { deriveAudienceSegments } from "./audience-segmentation-helper.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function buildMissingInputs(messagingFramework) {
  const missingInputs = [];

  if (!messagingFramework || normalizeString(messagingFramework.status) !== "ready") {
    missingInputs.push("messagingFramework");
  }

  return missingInputs;
}

function buildSegmentHeadline(segment, framework) {
  const headline = normalizeString(framework?.headline);
  if (!headline) {
    return null;
  }

  if (segment.segmentType === "general") {
    return headline;
  }

  return `${headline} for ${segment.label}`;
}

function buildSegmentSubheadline(segment, framework, positioning) {
  const subheadline = normalizeString(framework?.subheadline);
  const promise = normalizeString(positioning?.promise);

  return subheadline ?? promise ?? `Nexus messaging for ${segment.label}`;
}

function buildVariants(segments, framework, positioning) {
  return segments.map((segment, index) => ({
    variantId: `messaging-variant:${segment.segmentType}:${index + 1}`,
    segmentId: segment.segmentId,
    segmentType: segment.segmentType,
    audienceLabel: segment.label,
    headline: buildSegmentHeadline(segment, framework),
    subheadline: buildSegmentSubheadline(segment, framework, positioning),
    valueProps: Array.isArray(framework?.valueProps) ? framework.valueProps : [],
    ctaAngles: Array.isArray(framework?.ctaAngles) ? framework.ctaAngles : [],
  }));
}

export function createAudienceSpecificMessagingVariants({
  coreMessagingFramework = null,
  nexusPositioning = null,
  businessContext = null,
  projectIdentity = null,
} = {}) {
  const normalizedFramework = normalizeObject(coreMessagingFramework);
  const normalizedPositioning = normalizeObject(nexusPositioning);
  const missingInputs = buildMissingInputs(normalizedFramework);
  const { audienceSegmentsId, segments } = deriveAudienceSegments({
    nexusPositioning: normalizedPositioning,
    businessContext,
    projectIdentity,
  });

  return {
    messagingVariants: {
      messagingVariantsId: `messaging-variants:${normalizeString(normalizedFramework?.messagingFrameworkId) ?? "unknown"}`,
      status: missingInputs.length === 0 ? "ready" : "missing-inputs",
      missingInputs,
      audienceSegmentsId,
      segments,
      variants: missingInputs.length === 0 ? buildVariants(segments, normalizedFramework, normalizedPositioning) : [],
    },
  };
}
