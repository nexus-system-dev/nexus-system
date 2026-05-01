function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(productDeliveryModel, nexusWebsiteSchema) {
  const missingInputs = [];
  if (!productDeliveryModel || normalizeString(productDeliveryModel.status) !== "ready") {
    missingInputs.push("productDeliveryModel");
  }
  if (!nexusWebsiteSchema || normalizeString(nexusWebsiteSchema.status) !== "ready") {
    missingInputs.push("nexusWebsiteSchema");
  }
  return missingInputs;
}

export function createPublicSiteAndAppBoundaryModel({
  productDeliveryModel = null,
  nexusWebsiteSchema = null,
} = {}) {
  const normalizedModel = normalizeObject(productDeliveryModel);
  const normalizedWebsiteSchema = normalizeObject(nexusWebsiteSchema);
  const missingInputs = buildMissingInputs(normalizedModel, normalizedWebsiteSchema);

  if (missingInputs.length > 0) {
    return {
      siteAppBoundary: {
        siteAppBoundaryId: `site-app-boundary:${slugify(normalizedModel?.productDeliveryModelId)}`,
        status: "missing-inputs",
        missingInputs,
        publicRoutes: [],
        appRoutes: [],
        handoffPoints: [],
      },
    };
  }

  return {
    siteAppBoundary: {
      siteAppBoundaryId: `site-app-boundary:${slugify(normalizedModel.productDeliveryModelId)}`,
      status: "ready",
      missingInputs: [],
      publicRoutes: normalizedWebsiteSchema.pages?.map((page) => page.pageId) ?? [],
      appRoutes: ["/login", "/signup", "/app", "/onboarding"],
      trustBoundary: "marketing-site-to-authenticated-app",
      handoffPoints: ["cta:request-access", "cta:join-waitlist", "cta:start-project"],
    },
  };
}
