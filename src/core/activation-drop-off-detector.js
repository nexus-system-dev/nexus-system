function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(activationMilestones) {
  const missingInputs = [];
  if (!activationMilestones || normalizeString(activationMilestones.status) !== "ready") {
    missingInputs.push("activationMilestones");
  }
  return missingInputs;
}

export function createActivationDropOffDetector({
  activationMilestones = null,
  userActivityEvent = null,
} = {}) {
  const normalizedMilestones = normalizeObject(activationMilestones);
  const normalizedActivity = normalizeObject(userActivityEvent);
  const missingInputs = buildMissingInputs(normalizedMilestones);

  if (missingInputs.length > 0) {
    return {
      activationDropOffs: {
        activationDropOffsId: `activation-drop-offs:${slugify(normalizedMilestones?.activationMilestonesId)}`,
        status: "missing-inputs",
        missingInputs,
        entries: [],
      },
    };
  }

  const stalledMilestone = normalizedMilestones.milestones?.find((entry) => entry.reached === false) ?? null;

  return {
    activationDropOffs: {
      activationDropOffsId: `activation-drop-offs:${slugify(normalizedMilestones.activationMilestonesId)}`,
      status: "ready",
      missingInputs: [],
      entries: stalledMilestone
        ? [{
            dropOffId: `drop-off:${stalledMilestone.milestoneId}`,
            milestone: stalledMilestone.milestone,
            reason: normalizeString(normalizedActivity?.activityType) === "session-idle" ? "session-idle" : "missing-first-value",
          }]
        : [],
    },
  };
}
