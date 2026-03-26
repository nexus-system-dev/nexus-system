function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function buildAction(actionId, actionType, label, requiresUserAction = false) {
  return {
    actionId,
    actionType,
    label,
    requiresUserAction,
  };
}

function inferActions(scoredBottleneck, replanTrigger) {
  const blockerType = scoredBottleneck.blockerType ?? "none";
  const actions = [];

  if (blockerType === "approval-blocker") {
    actions.push(buildAction("unblock-approval", "approval", "Open approval request", true));
  } else if (blockerType === "policy-blocker") {
    actions.push(buildAction("unblock-policy-path", "policy-change", "Switch to an allowed execution path", true));
  } else if (blockerType === "credential-blocker") {
    actions.push(buildAction("unblock-credential", "credential-fix", "Provide an approved credential", true));
  } else if (blockerType === "release-blocker") {
    actions.push(buildAction("unblock-release", "release-fix", "Resolve release validation blockers"));
  } else if (blockerType === "failed-task") {
    actions.push(buildAction("unblock-retry-task", "retry-task", "Retry or recover the failed task"));
  } else if (blockerType === "graph-blocker") {
    actions.push(buildAction("unblock-dependencies", "dependency-unblock", "Complete upstream dependencies"));
  } else if (blockerType === "health-blocker") {
    actions.push(buildAction("unblock-runtime", "runtime-fix", "Restore runtime health"));
  }

  if (normalizeObject(replanTrigger).shouldReplan === true) {
    actions.push(buildAction("unblock-replan", "replan", "Replan the dependency path"));
  }

  return actions;
}

export function createUnblockPathGenerator({
  scoredBottleneck = null,
  replanTrigger = null,
} = {}) {
  const normalizedScoredBottleneck = normalizeObject(scoredBottleneck);
  const normalizedReplanTrigger = normalizeObject(replanTrigger);
  const nextActions = inferActions(normalizedScoredBottleneck, normalizedReplanTrigger);

  return {
    unblockPlan: {
      unblockPlanId: `unblock-plan:${normalizedScoredBottleneck.scoredBottleneckId ?? "unknown"}`,
      bottleneckId: normalizedScoredBottleneck.bottleneckId ?? null,
      blockerType: normalizedScoredBottleneck.blockerType ?? "none",
      nextActions,
      requiresReplan: normalizedReplanTrigger.shouldReplan === true,
      summary: {
        actionCount: nextActions.length,
        priorityBand: normalizedScoredBottleneck.summary?.priorityBand ?? "low",
        requiresUserAction: nextActions.some((action) => action.requiresUserAction),
      },
    },
  };
}
