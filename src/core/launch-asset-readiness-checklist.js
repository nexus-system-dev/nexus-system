function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}
function buildMissingInputs(launchRolloutPlan, productProofPlan) {
  const missingInputs = [];
  if (!launchRolloutPlan || normalizeString(launchRolloutPlan.status) !== "ready") missingInputs.push("launchRolloutPlan");
  if (!productProofPlan || normalizeString(productProofPlan.status) !== "ready") missingInputs.push("productProofPlan");
  return missingInputs;
}
export function createLaunchAssetReadinessChecklist({ launchRolloutPlan = null, productProofPlan = null } = {}) {
  const rollout = normalizeObject(launchRolloutPlan);
  const proof = normalizeObject(productProofPlan);
  const missingInputs = buildMissingInputs(rollout, proof);
  if (missingInputs.length > 0) {
    return { launchReadinessChecklist: { launchReadinessChecklistId: `launch-readiness:${slugify(rollout?.launchRolloutPlanId)}`, status: "missing-inputs", missingInputs, items: [] } };
  }
  return {
    launchReadinessChecklist: {
      launchReadinessChecklistId: `launch-readiness:${slugify(rollout.launchRolloutPlanId)}`,
      status: "ready",
      missingInputs: [],
      items: [
        { itemId: "channels-ready", ready: (rollout.channels?.length ?? 0) > 0 },
        { itemId: "proof-assets-ready", ready: (proof.assets?.length ?? 0) > 0 },
      ],
    },
  };
}
