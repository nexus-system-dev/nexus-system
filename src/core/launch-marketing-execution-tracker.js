function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}
function buildMissingInputs(promotionExecutionPlan, launchFeedbackSummary) {
  const missingInputs = [];
  if (!promotionExecutionPlan || normalizeString(promotionExecutionPlan.status) !== "ready") missingInputs.push("promotionExecutionPlan");
  if (!launchFeedbackSummary || normalizeString(launchFeedbackSummary.status) !== "ready") missingInputs.push("launchFeedbackSummary");
  return missingInputs;
}
export function createLaunchMarketingExecutionTracker({ promotionExecutionPlan = null, launchFeedbackSummary = null } = {}) {
  const plan = normalizeObject(promotionExecutionPlan);
  const feedback = normalizeObject(launchFeedbackSummary);
  const missingInputs = buildMissingInputs(plan, feedback);
  if (missingInputs.length > 0) {
    return { launchMarketingExecution: { launchMarketingExecutionId: `launch-marketing:${slugify(plan?.promotionExecutionPlanId)}`, status: "missing-inputs", missingInputs, publishedCount: 0 } };
  }
  return {
    launchMarketingExecution: {
      launchMarketingExecutionId: `launch-marketing:${slugify(plan.promotionExecutionPlanId)}`,
      status: "ready",
      missingInputs: [],
      publishedCount: plan.steps?.length ?? 0,
      feedbackClusterCount: feedback.clusters?.length ?? 0,
    },
  };
}
