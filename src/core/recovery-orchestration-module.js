function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildAction({ actionId, actionType, target = null, mode = null, requiresUserInput = false, metadata = null }) {
  return {
    actionId,
    actionType,
    target,
    mode,
    requiresUserInput,
    metadata,
  };
}

export function createRecoveryOrchestrationModule({
  retryPolicy = null,
  fallbackStrategy = null,
  rollbackPlan = null,
} = {}) {
  const normalizedRetryPolicy = normalizeObject(retryPolicy);
  const normalizedFallbackStrategy = normalizeObject(fallbackStrategy);
  const normalizedRollbackPlan = normalizeObject(rollbackPlan);

  let recoveryDecision = {
    decisionId: `recovery-decision:${normalizedRetryPolicy.retryPolicyId ?? normalizedFallbackStrategy.fallbackStrategyId ?? normalizedRollbackPlan.rollbackPlanId ?? "unknown"}`,
    decisionType: "ask-user",
    reason: "Recovery needs explicit user direction",
    requiresUserDecision: true,
    summary: {
      actionCount: 0,
      hasRollback: normalizedRollbackPlan.rollbackMode === "targeted",
      hasFallback: Boolean(normalizedFallbackStrategy.primaryStrategy?.action),
      hasRetry: normalizedRetryPolicy.shouldRetry === true,
    },
  };

  let recoveryActions = [];

  if (normalizedRetryPolicy.shouldRetry === true) {
    recoveryDecision = {
      ...recoveryDecision,
      decisionType: "retry",
      reason: "Failure is retryable and retry policy is available",
      requiresUserDecision: false,
    };
    recoveryActions = [
      buildAction({
        actionId: "recovery-retry",
        actionType: "retry",
        target: normalizedRetryPolicy.taskType ?? null,
        mode: normalizedRetryPolicy.schedulerHint?.queue ?? null,
        metadata: {
          maxAttempts: normalizedRetryPolicy.maxAttempts ?? 0,
          strategy: normalizedRetryPolicy.strategy ?? "no-retry",
          retryDelaysMs: normalizeArray(normalizedRetryPolicy.retryDelaysMs),
        },
      }),
    ];
  } else if (normalizedFallbackStrategy.primaryStrategy?.action) {
    recoveryDecision = {
      ...recoveryDecision,
      decisionType: normalizedFallbackStrategy.primaryStrategy.action === "request-approval" ? "ask-user" : "fallback",
      reason: normalizedFallbackStrategy.primaryStrategy.reason ?? "Fallback strategy is available",
      requiresUserDecision: normalizedFallbackStrategy.primaryStrategy.action === "request-approval",
    };
    recoveryActions = [
      buildAction({
        actionId: normalizedFallbackStrategy.primaryStrategy.strategyId ?? "recovery-fallback",
        actionType: normalizedFallbackStrategy.primaryStrategy.action,
        target: normalizedFallbackStrategy.currentMode ?? null,
        mode: normalizedFallbackStrategy.primaryStrategy.targetMode ?? null,
        requiresUserInput: normalizedFallbackStrategy.primaryStrategy.action === "request-approval",
        metadata: {
          confidence: normalizedFallbackStrategy.primaryStrategy.confidence ?? "medium",
          alternatives: normalizeArray(normalizedFallbackStrategy.alternatives),
        },
      }),
    ];
  } else if (normalizedRollbackPlan.rollbackMode === "targeted") {
    recoveryDecision = {
      ...recoveryDecision,
      decisionType: "rollback",
      reason: "Rollback plan exists and no retry or fallback path is preferred",
      requiresUserDecision: normalizedRollbackPlan.requiresConfirmation === true,
    };
    recoveryActions = [
      buildAction({
        actionId: normalizedRollbackPlan.rollbackPlanId ?? "recovery-rollback",
        actionType: "rollback",
        target: "project-state",
        requiresUserInput: normalizedRollbackPlan.requiresConfirmation === true,
        metadata: {
          scope: normalizedRollbackPlan.scope ?? {},
          totalTargets: normalizedRollbackPlan.summary?.totalTargets ?? 0,
        },
      }),
    ];
  }

  recoveryDecision.summary = {
    actionCount: recoveryActions.length,
    hasRollback: normalizedRollbackPlan.rollbackMode === "targeted",
    hasFallback: Boolean(normalizedFallbackStrategy.primaryStrategy?.action),
    hasRetry: normalizedRetryPolicy.shouldRetry === true,
  };

  return {
    recoveryDecision,
    recoveryActions,
  };
}
