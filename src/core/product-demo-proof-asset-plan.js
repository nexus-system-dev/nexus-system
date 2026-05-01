function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(websiteCopyPack, activationMilestones) {
  const missingInputs = [];
  if (!websiteCopyPack || normalizeString(websiteCopyPack.status) !== "ready") {
    missingInputs.push("websiteCopyPack");
  }
  if (!activationMilestones || normalizeString(activationMilestones.status) !== "ready") {
    missingInputs.push("activationMilestones");
  }
  return missingInputs;
}

export function createProductDemoAndProofAssetPlan({
  websiteCopyPack = null,
  activationMilestones = null,
} = {}) {
  const normalizedCopyPack = normalizeObject(websiteCopyPack);
  const normalizedMilestones = normalizeObject(activationMilestones);
  const missingInputs = buildMissingInputs(normalizedCopyPack, normalizedMilestones);

  if (missingInputs.length > 0) {
    return {
      productProofPlan: {
        productProofPlanId: `product-proof-plan:${slugify(normalizedCopyPack?.websiteCopyPackId)}`,
        status: "missing-inputs",
        missingInputs,
        assets: [],
      },
    };
  }

  return {
    productProofPlan: {
      productProofPlanId: `product-proof-plan:${slugify(normalizedCopyPack.websiteCopyPackId)}`,
      status: "ready",
      missingInputs: [],
      assets: [
        { assetId: "proof:demo-video", source: normalizedCopyPack.pageCopy?.[0]?.headline ?? "demo" },
        { assetId: "proof:first-value", source: normalizedMilestones.milestones?.find((m) => m.milestone === "first-visible-result")?.milestone ?? "first-visible-result" },
      ],
    },
  };
}
