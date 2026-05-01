function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}
function buildMissingInputs(launchRolloutPlan, launchContentCalendar) {
  const missingInputs = [];
  if (!launchRolloutPlan || normalizeString(launchRolloutPlan.status) !== "ready") missingInputs.push("launchRolloutPlan");
  if (!launchContentCalendar || normalizeString(launchContentCalendar.status) !== "ready") missingInputs.push("launchContentCalendar");
  return missingInputs;
}
export function createLaunchDraftPublishingPlan({ launchRolloutPlan = null, launchContentCalendar = null } = {}) {
  const rollout = normalizeObject(launchRolloutPlan);
  const calendar = normalizeObject(launchContentCalendar);
  const missingInputs = buildMissingInputs(rollout, calendar);
  if (missingInputs.length > 0) {
    return { launchPublishingPlan: { launchPublishingPlanId: `launch-publishing:${slugify(rollout?.launchRolloutPlanId)}`, status: "missing-inputs", missingInputs, drafts: [] } };
  }
  return {
    launchPublishingPlan: {
      launchPublishingPlanId: `launch-publishing:${slugify(rollout.launchRolloutPlanId)}`,
      status: "ready",
      missingInputs: [],
      drafts: (calendar.entries ?? []).map((entry, index) => ({ draftId: `draft:${index + 1}`, phase: entry.phase, scheduled: entry.phase !== "pre-launch" })),
    },
  };
}
