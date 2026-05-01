function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(nexusWebsiteSchema, messagingFramework) {
  const missingInputs = [];

  if (!nexusWebsiteSchema || normalizeString(nexusWebsiteSchema.status) !== "ready") {
    missingInputs.push("nexusWebsiteSchema");
  }

  if (!messagingFramework || normalizeString(messagingFramework.status) !== "ready") {
    missingInputs.push("messagingFramework");
  }

  return missingInputs;
}

function buildSection(sectionId, title, intent, ctaAnchor = null) {
  return {
    sectionId,
    title,
    intent,
    ctaAnchor,
  };
}

export function createLandingPageInformationArchitecture({
  nexusWebsiteSchema = null,
  messagingFramework = null,
} = {}) {
  const normalizedWebsiteSchema = normalizeObject(nexusWebsiteSchema);
  const normalizedMessagingFramework = normalizeObject(messagingFramework);
  const missingInputs = buildMissingInputs(normalizedWebsiteSchema, normalizedMessagingFramework);

  if (missingInputs.length > 0) {
    return {
      landingPageIa: {
        landingPageIaId: `landing-page-ia:${slugify(normalizedWebsiteSchema?.nexusWebsiteSchemaId)}`,
        status: "missing-inputs",
        missingInputs,
        sections: [],
      },
    };
  }

  const headline = normalizeString(normalizedMessagingFramework.headline);
  const primaryCta = normalizedWebsiteSchema.pages?.[0]?.primaryCta ?? null;

  return {
    landingPageIa: {
      landingPageIaId: `landing-page-ia:${slugify(normalizedWebsiteSchema.nexusWebsiteSchemaId)}`,
      status: "ready",
      missingInputs: [],
      sections: [
        buildSection("section:hero", headline ?? "Nexus", "State the product promise and expose the primary CTA immediately.", primaryCta?.ctaId ?? null),
        buildSection("section:problem", "Why teams stall", "Name the planning-to-execution gap in concrete terms."),
        buildSection("section:value-props", "How Nexus helps", "Translate value props into a scannable landing structure.", primaryCta?.ctaId ?? null),
        buildSection("section:proof", "Proof and trust", "Reserve evidence and credibility blocks for high-intent visitors."),
        buildSection("section:conversion", "Start the path", "Close the page with the top activation CTA.", primaryCta?.ctaId ?? null),
      ],
    },
  };
}
