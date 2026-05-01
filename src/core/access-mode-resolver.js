function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(productDeliveryModel) {
  const missingInputs = [];
  if (!productDeliveryModel || normalizeString(productDeliveryModel.status) !== "ready") {
    missingInputs.push("productDeliveryModel");
  }
  return missingInputs;
}

function resolveMode({ productDeliveryModel, launchStage, waitlistRecord, accessRequest }) {
  const explicitStage = normalizeString(launchStage)?.toLowerCase();
  const effectiveStage = explicitStage ?? normalizeString(productDeliveryModel?.launchStage)?.toLowerCase();

  if (normalizeString(waitlistRecord?.status) === "captured") {
    return "waitlist";
  }
  if (normalizeString(accessRequest?.status) === "submitted") {
    return "request-access";
  }
  if (effectiveStage === "ga" || effectiveStage === "launch") {
    return "open-access";
  }
  if (effectiveStage === "beta") {
    return "waitlist";
  }
  return normalizeString(productDeliveryModel?.defaultAccessMode) ?? "request-access";
}

export function createAccessModeResolver({
  productDeliveryModel = null,
  launchStage = null,
  visitorContext = null,
  waitlistRecord = null,
  accessRequest = null,
} = {}) {
  const normalizedModel = normalizeObject(productDeliveryModel);
  const normalizedVisitorContext = normalizeObject(visitorContext);
  const normalizedWaitlistRecord = normalizeObject(waitlistRecord);
  const normalizedAccessRequest = normalizeObject(accessRequest);
  const missingInputs = buildMissingInputs(normalizedModel);

  if (missingInputs.length > 0) {
    return {
      accessModeDecision: {
        accessModeDecisionId: `access-mode:${slugify(normalizedModel?.productDeliveryModelId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  const mode = resolveMode({
    productDeliveryModel: normalizedModel,
    launchStage,
    waitlistRecord: normalizedWaitlistRecord,
    accessRequest: normalizedAccessRequest,
  });

  return {
    accessModeDecision: {
      accessModeDecisionId: `access-mode:${slugify(normalizedModel.productDeliveryModelId)}`,
      status: "ready",
      missingInputs: [],
      mode,
      channelIntent: normalizeString(normalizedVisitorContext?.channelIntent) ?? "product-evaluation",
      preferredRoute: mode === "open-access" ? "signup" : mode,
    },
  };
}
