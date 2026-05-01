function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}
function buildMissingInputs(launchRolloutPlan, launchPublishingPlan) {
  const missingInputs = [];
  if (!launchRolloutPlan || normalizeString(launchRolloutPlan.status) !== "ready") missingInputs.push("launchRolloutPlan");
  if (!launchPublishingPlan || normalizeString(launchPublishingPlan.status) !== "ready") missingInputs.push("launchPublishingPlan");
  return missingInputs;
}
export function createPromotionExecutionPlanner({ launchRolloutPlan = null, launchPublishingPlan = null } = {}) {
  const rollout = normalizeObject(launchRolloutPlan);
  const publishing = normalizeObject(launchPublishingPlan);
  const missingInputs = buildMissingInputs(rollout, publishing);
  if (missingInputs.length > 0) {
    return { promotionExecutionPlan: { promotionExecutionPlanId: `promotion-execution:${slugify(rollout?.launchRolloutPlanId)}`, status: "missing-inputs", missingInputs, steps: [] } };
  }
  return {
    promotionExecutionPlan: {
      promotionExecutionPlanId: `promotion-execution:${slugify(rollout.launchRolloutPlanId)}`,
      status: "ready",
      missingInputs: [],
      steps: (publishing.drafts ?? []).map((draft, index) => ({ stepId: `step:${index + 1}`, draftId: draft.draftId, channel: rollout.channels?.[index % rollout.channels.length]?.channel ?? "website" })),
    },
  };
}
