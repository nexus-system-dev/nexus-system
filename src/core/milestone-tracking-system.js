function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function createMilestoneTrackingSystem({
  projectId = null,
  goalProgressState = null,
  activationMilestones = null,
  firstValueOutput = null,
} = {}) {
  const goalProgress = normalizeObject(goalProgressState);
  const milestonesState = normalizeObject(activationMilestones);
  const milestones = normalizeArray(milestonesState.milestones);
  const firstValue = normalizeObject(firstValueOutput);
  const completedMilestones = milestones.filter((entry) => entry.reached === true);
  const remainingMilestones = milestones.filter((entry) => entry.reached !== true);
  const completionPercent = milestones.length > 0
    ? Math.round((completedMilestones.length / milestones.length) * 100)
    : normalizeNumber(goalProgress.progressPercent, 0);

  return {
    milestoneTracking: {
      milestoneTrackingId: `milestone-tracking:${normalizeString(projectId, "unknown-project")}`,
      projectId: normalizeString(projectId),
      status: remainingMilestones.length === 0 ? "complete" : "tracking",
      completedMilestones,
      remainingMilestones,
      nextMilestone: remainingMilestones[0]?.milestone ?? goalProgress.nextMilestone ?? null,
      completionPercent,
      hasVisibleOutcome: Boolean(firstValue.summary?.hasVisibleOutcome ?? firstValue.hasVisibleOutcome),
    },
  };
}
