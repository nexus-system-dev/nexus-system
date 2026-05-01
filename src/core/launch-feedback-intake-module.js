function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}
function buildMissingInputs(launchPublishingPlan) {
  const missingInputs = [];
  if (!launchPublishingPlan || normalizeString(launchPublishingPlan.status) !== "ready") missingInputs.push("launchPublishingPlan");
  return missingInputs;
}
export function createLaunchFeedbackIntakeModule({ launchPublishingPlan = null, feedbackSignals = null } = {}) {
  const plan = normalizeObject(launchPublishingPlan);
  const signals = Array.isArray(feedbackSignals) ? feedbackSignals : [];
  const missingInputs = buildMissingInputs(plan);
  if (missingInputs.length > 0) {
    return { launchFeedbackSummary: { launchFeedbackSummaryId: `launch-feedback:${slugify(plan?.launchPublishingPlanId)}`, status: "missing-inputs", missingInputs, clusters: [] } };
  }
  return {
    launchFeedbackSummary: {
      launchFeedbackSummaryId: `launch-feedback:${slugify(plan.launchPublishingPlanId)}`,
      status: "ready",
      missingInputs: [],
      clusters: signals.length > 0 ? signals.map((signal, index) => ({ clusterId: `feedback:${index + 1}`, topic: normalizeString(signal.topic) ?? "general" })) : [{ clusterId: "feedback:1", topic: "launch-interest" }],
    },
  };
}
