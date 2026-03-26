function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeTaskResult(taskResult) {
  const normalized = normalizeObject(taskResult);
  return {
    taskId: normalized.taskId ?? null,
    status: normalized.status ?? "unknown",
    reason: normalized.reason ?? null,
  };
}

function normalizeActiveBottleneck(activeBottleneck) {
  const normalized = normalizeObject(activeBottleneck);
  return {
    bottleneckId: normalized.bottleneckId ?? null,
    blockerType: normalized.blockerType ?? "none",
    isBlocking: normalized.summary?.isBlocking === true,
  };
}

function inferStatus(taskResult, unblockPlan, activeBottleneck) {
  if (
    activeBottleneck.isBlocking
    && activeBottleneck.bottleneckId != null
    && activeBottleneck.bottleneckId === unblockPlan.bottleneckId
  ) {
    return unblockPlan.nextActions.length > 0 ? "pending-unblock" : "blocked";
  }

  if (taskResult.status === "completed") {
    return "cleared";
  }

  if (taskResult.status === "failed") {
    return unblockPlan.nextActions.length > 0 ? "active" : "blocked";
  }

  if (unblockPlan.nextActions.length > 0) {
    return "pending-unblock";
  }

  return "clear";
}

export function createBottleneckStateUpdater({
  unblockPlan = null,
  taskResult = null,
  activeBottleneck = null,
} = {}) {
  const normalizedUnblockPlan = normalizeObject(unblockPlan);
  const normalizedTaskResult = normalizeTaskResult(taskResult);
  const normalizedActiveBottleneck = normalizeActiveBottleneck(activeBottleneck);
  const nextActions = Array.isArray(normalizedUnblockPlan.nextActions)
    ? normalizedUnblockPlan.nextActions
    : [];
  const status = inferStatus(normalizedTaskResult, {
    ...normalizedUnblockPlan,
    nextActions,
  }, normalizedActiveBottleneck);

  return {
    updatedBottleneckState: {
      updatedBottleneckStateId: `updated-bottleneck:${normalizedUnblockPlan.unblockPlanId ?? "unknown"}`,
      bottleneckId: normalizedUnblockPlan.bottleneckId ?? null,
      blockerType: normalizedUnblockPlan.blockerType ?? "none",
      status,
      lastTaskResult: normalizedTaskResult.status === "unknown"
        ? null
        : normalizedTaskResult,
      remainingActions: status === "cleared" ? [] : nextActions,
      summary: {
        isBlocked: status === "active" || status === "blocked" || status === "pending-unblock",
        nextActionCount: status === "cleared" ? 0 : nextActions.length,
        requiresReplan: normalizedUnblockPlan.requiresReplan === true,
      },
    },
  };
}
