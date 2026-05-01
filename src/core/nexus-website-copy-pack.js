function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(nexusWebsiteSchema, landingPageIa, messagingFramework, objectionMap, faqMap, productCtaStrategy) {
  const missingInputs = [];

  if (!nexusWebsiteSchema || normalizeString(nexusWebsiteSchema.status) !== "ready") {
    missingInputs.push("nexusWebsiteSchema");
  }
  if (!landingPageIa || normalizeString(landingPageIa.status) !== "ready") {
    missingInputs.push("landingPageIa");
  }
  if (!messagingFramework || normalizeString(messagingFramework.status) !== "ready") {
    missingInputs.push("messagingFramework");
  }
  if (!objectionMap || normalizeString(objectionMap.status) !== "ready") {
    missingInputs.push("objectionMap");
  }
  if (!faqMap || normalizeString(faqMap.status) !== "ready") {
    missingInputs.push("faqMap");
  }
  if (!productCtaStrategy || normalizeString(productCtaStrategy.status) !== "ready") {
    missingInputs.push("productCtaStrategy");
  }

  return missingInputs;
}

function buildSectionCopy(section, messagingFramework, objectionMap, productCtaStrategy) {
  const normalizedSection = normalizeObject(section);
  const headline = normalizeString(messagingFramework?.headline) ?? "Nexus";
  const subheadline = normalizeString(messagingFramework?.subheadline) ?? "Governed execution for product work.";
  const firstObjection = objectionMap?.entries?.[0];
  const primaryCta = productCtaStrategy?.primaryCta ?? null;

  switch (normalizedSection?.sectionId) {
    case "section:hero":
      return {
        sectionId: normalizedSection.sectionId,
        title: headline,
        body: subheadline,
        ctaLabel: primaryCta?.label ?? null,
      };
    case "section:problem":
      return {
        sectionId: normalizedSection.sectionId,
        title: normalizedSection.title,
        body: subheadline,
        ctaLabel: null,
      };
    case "section:value-props":
      return {
        sectionId: normalizedSection.sectionId,
        title: normalizedSection.title,
        body: Array.isArray(messagingFramework?.valueProps)
          ? messagingFramework.valueProps.map((entry) => entry.label).join(" • ")
          : headline,
        ctaLabel: primaryCta?.label ?? null,
      };
    case "section:proof":
      return {
        sectionId: normalizedSection.sectionId,
        title: normalizedSection.title,
        body: normalizeString(firstObjection?.response) ?? headline,
        ctaLabel: null,
      };
    default:
      return {
        sectionId: normalizedSection?.sectionId ?? "section:unknown",
        title: normalizedSection?.title ?? "Start the path",
        body: headline,
        ctaLabel: primaryCta?.label ?? null,
      };
  }
}

export function createNexusWebsiteCopyPack({
  nexusWebsiteSchema = null,
  landingPageIa = null,
  messagingFramework = null,
  objectionMap = null,
  faqMap = null,
  productCtaStrategy = null,
} = {}) {
  const normalizedWebsiteSchema = normalizeObject(nexusWebsiteSchema);
  const normalizedLandingPageIa = normalizeObject(landingPageIa);
  const normalizedMessagingFramework = normalizeObject(messagingFramework);
  const normalizedObjectionMap = normalizeObject(objectionMap);
  const normalizedFaqMap = normalizeObject(faqMap);
  const normalizedProductCtaStrategy = normalizeObject(productCtaStrategy);
  const missingInputs = buildMissingInputs(
    normalizedWebsiteSchema,
    normalizedLandingPageIa,
    normalizedMessagingFramework,
    normalizedObjectionMap,
    normalizedFaqMap,
    normalizedProductCtaStrategy,
  );

  if (missingInputs.length > 0) {
    return {
      websiteCopyPack: {
        websiteCopyPackId: `website-copy-pack:${slugify(normalizedWebsiteSchema?.nexusWebsiteSchemaId)}`,
        status: "missing-inputs",
        missingInputs,
        pageCopy: [],
        faqEntries: [],
      },
    };
  }

  const pageCopy = Array.isArray(normalizedLandingPageIa.sections)
    ? normalizedLandingPageIa.sections.map((section) => buildSectionCopy(
      section,
      normalizedMessagingFramework,
      normalizedObjectionMap,
      normalizedProductCtaStrategy,
    ))
    : [];

  return {
    websiteCopyPack: {
      websiteCopyPackId: `website-copy-pack:${slugify(normalizedWebsiteSchema.nexusWebsiteSchemaId)}`,
      status: "ready",
      missingInputs: [],
      pageCopy,
      faqEntries: Array.isArray(normalizedFaqMap.entries) ? normalizedFaqMap.entries : [],
      primaryCta: normalizedProductCtaStrategy.primaryCta ?? null,
    },
  };
}
