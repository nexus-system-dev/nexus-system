function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(activationDropOffs) {
  const missingInputs = [];
  if (!activationDropOffs || normalizeString(activationDropOffs.status) !== "ready") {
    missingInputs.push("activationDropOffs");
  }
  return missingInputs;
}

export function createReEngagementTriggerPlanner({
  activationDropOffs = null,
  notificationPreferences = null,
} = {}) {
  const normalizedDropOffs = normalizeObject(activationDropOffs);
  const normalizedPreferences = normalizeObject(notificationPreferences);
  const missingInputs = buildMissingInputs(normalizedDropOffs);

  if (missingInputs.length > 0) {
    return {
      reEngagementPlan: {
        reEngagementPlanId: `re-engagement:${slugify(normalizedDropOffs?.activationDropOffsId)}`,
        status: "missing-inputs",
        missingInputs,
        actions: [],
      },
    };
  }

  return {
    reEngagementPlan: {
      reEngagementPlanId: `re-engagement:${slugify(normalizedDropOffs.activationDropOffsId)}`,
      status: "ready",
      missingInputs: [],
      actions: normalizedDropOffs.entries.map((entry, index) => ({
        actionId: `re-engage:${index + 1}`,
        channel: normalizedPreferences?.email?.enabled === false ? "in-app" : "email",
        reason: entry.reason,
        delayHours: 24,
      })),
    },
  };
}
