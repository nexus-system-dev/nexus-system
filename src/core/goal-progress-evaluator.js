function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function createGoalProgressEvaluator({
  projectId = null,
  goal = null,
  outcomeFeedbackState = null,
  progressState = null,
  actionSuccessScore = null,
} = {}) {
  const feedback = normalizeObject(outcomeFeedbackState);
  const progress = normalizeObject(progressState);
  const success = normalizeObject(actionSuccessScore);
  const progressPercent = Math.max(
    normalizeNumber(progress.progressPercent ?? progress.percent, 0),
    Math.round(normalizeNumber(success.score, 0) * 100),
  );
  const goalHealth = feedback.status === "attention-required" ? "at-risk" : "on-track";

  return {
    goalProgressState: {
      goalProgressStateId: `goal-progress:${normalizeString(projectId, "unknown-project")}`,
      projectId: normalizeString(projectId),
      goal: normalizeString(goal),
      status: goalHealth === "at-risk" ? "needs-adjustment" : "advancing",
      goalHealth,
      progressPercent,
      confidence: normalizeNumber(success.score, 0.25),
      currentPhase: normalizeString(progress.status, "pending"),
      nextMilestone: progressPercent >= 70 ? "stabilize-system" : "unlock-next-visible-outcome",
    },
  };
}
