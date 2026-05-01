function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(messagingFramework, productCtaStrategy) {
  const missingInputs = [];

  if (!messagingFramework || normalizeString(messagingFramework.status) !== "ready") {
    missingInputs.push("messagingFramework");
  }

  if (!productCtaStrategy || normalizeString(productCtaStrategy.status) !== "ready") {
    missingInputs.push("productCtaStrategy");
  }

  return missingInputs;
}

function buildPage(pageId, title, purpose, primaryCta = null) {
  return {
    pageId,
    title,
    purpose,
    primaryCta,
  };
}

export function defineNexusWebsiteSchema({
  messagingFramework = null,
  productCtaStrategy = null,
} = {}) {
  const normalizedMessagingFramework = normalizeObject(messagingFramework);
  const normalizedCtaStrategy = normalizeObject(productCtaStrategy);
  const missingInputs = buildMissingInputs(normalizedMessagingFramework, normalizedCtaStrategy);

  if (missingInputs.length > 0) {
    return {
      nexusWebsiteSchema: {
        nexusWebsiteSchemaId: `website-schema:${slugify(normalizedMessagingFramework?.messagingFrameworkId)}`,
        status: "missing-inputs",
        missingInputs,
        pages: [],
      },
    };
  }

  const primaryCta = normalizedCtaStrategy.primaryCta ?? null;
  const secondaryCta = Array.isArray(normalizedCtaStrategy.secondaryCtas)
    ? normalizedCtaStrategy.secondaryCtas[0] ?? null
    : null;

  return {
    nexusWebsiteSchema: {
      nexusWebsiteSchemaId: `website-schema:${slugify(normalizedMessagingFramework.messagingFrameworkId)}`,
      status: "ready",
      missingInputs: [],
      pages: [
        buildPage("page:home", "Home", "Explain the Nexus promise and route visitors into activation.", primaryCta),
        buildPage("page:product", "Product", "Show how governed execution works and what users get from the operating flow.", primaryCta),
        buildPage("page:pricing", "Pricing", "Frame access expectations, plans, and upgrade paths.", secondaryCta ?? primaryCta),
        buildPage("page:faq", "FAQ", "Resolve trust and adoption questions before conversion.", secondaryCta ?? primaryCta),
        buildPage("page:conversion", "Conversion", "Bridge visitors into signup, waitlist, or demo action.", primaryCta),
      ],
    },
  };
}
