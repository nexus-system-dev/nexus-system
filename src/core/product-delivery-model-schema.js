function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function resolveLaunchStage(stage) {
  const normalizedStage = normalizeString(stage)?.toLowerCase();
  if (normalizedStage && ["idea", "build", "mvp", "beta", "launch", "ga"].includes(normalizedStage)) {
    return normalizedStage;
  }
  return "mvp";
}

function resolveDefaultAccessMode(launchStage) {
  if (launchStage === "ga" || launchStage === "launch") {
    return "open-access";
  }
  if (launchStage === "beta") {
    return "waitlist";
  }
  return "request-access";
}

export function defineProductDeliveryModelSchema({
  businessContext = null,
  distributionConstraints = null,
  nexusWebsiteSchema = null,
} = {}) {
  const normalizedBusinessContext = normalizeObject(businessContext);
  const normalizedConstraints = Array.isArray(distributionConstraints) ? distributionConstraints : [];
  const normalizedWebsiteSchema = normalizeObject(nexusWebsiteSchema);
  const launchStage = resolveLaunchStage(normalizedBusinessContext?.gtmStage);
  const defaultAccessMode = resolveDefaultAccessMode(launchStage);

  return {
    productDeliveryModel: {
      productDeliveryModelId: `product-delivery-model:${slugify(normalizedWebsiteSchema?.websiteSchemaId ?? launchStage)}`,
      status: "ready",
      missingInputs: [],
      deliverySurface: "web-first",
      launchStage,
      defaultAccessMode,
      publicSiteEnabled: true,
      appEnabled: true,
      supportedClients: ["web-app", "future-cli", "future-desktop-wrapper"],
      distributionConstraints: normalizedConstraints.map((constraint) => normalizeString(constraint)).filter(Boolean),
    },
  };
}
