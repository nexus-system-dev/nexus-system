function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function humanizeDecision(decisionType) {
  switch (decisionType) {
    case "retry":
      return "ננסה שוב באופן מבוקר";
    case "fallback":
      return "נעבור למסלול חלופי";
    case "rollback":
      return "נחזיר חלקים לאחור";
    case "ask-user":
      return "נדרשת החלטה שלך";
    default:
      return "נדרשת החלטת התאוששות";
  }
}

function summarizeRollback(rollbackPlan) {
  const summary = normalizeObject(rollbackPlan.summary);
  const scope = normalizeObject(rollbackPlan.scope);

  return {
    rollbackMode: rollbackPlan.rollbackMode ?? "none",
    totalTargets: summary.totalTargets ?? 0,
    hasExternalEffects: summary.hasExternalEffects ?? false,
    restoredAreas: [
      ...(normalizeArray(scope.files).length > 0 ? ["files"] : []),
      ...(normalizeArray(scope.state).length > 0 ? ["state"] : []),
      ...(normalizeArray(scope.deploy).length > 0 ? ["deploy"] : []),
      ...(normalizeArray(scope.releaseDrafts).length > 0 ? ["release"] : []),
      ...(normalizeArray(scope.providerSideEffects).length > 0 ? ["provider"] : []),
    ],
  };
}

export function createUserFacingRecoveryOptionsAssembler({
  failureRecoveryModel = null,
  recoveryDecision = null,
  recoveryActions = [],
  rollbackPlan = null,
} = {}) {
  const normalizedFailureRecoveryModel = normalizeObject(failureRecoveryModel);
  const normalizedRecoveryDecision = normalizeObject(recoveryDecision);
  const normalizedRollbackPlan = normalizeObject(rollbackPlan);
  const normalizedRecoveryActions = normalizeArray(recoveryActions);

  const decisionType = normalizedRecoveryDecision.decisionType ?? "ask-user";
  const prompts = normalizeArray(normalizedFailureRecoveryModel.userRecoveryPrompts);

  return {
    recoveryOptionsPayload: {
      payloadId: `recovery-options:${normalizedFailureRecoveryModel.recoveryId ?? normalizedRecoveryDecision.decisionId ?? "unknown"}`,
      headline: humanizeDecision(decisionType),
      brokenState: {
        failureClass: normalizedFailureRecoveryModel.failureClass ?? "unknown-failure",
        retryability: normalizedFailureRecoveryModel.retryability ?? "manual-only",
        reason: normalizedRecoveryDecision.reason ?? null,
      },
      attemptedRecovery: {
        decisionType,
        requiresUserDecision: normalizedRecoveryDecision.requiresUserDecision === true,
        actions: normalizedRecoveryActions.map((action) => ({
          actionId: action.actionId ?? null,
          actionType: action.actionType ?? null,
          mode: action.mode ?? null,
          requiresUserInput: action.requiresUserInput === true,
        })),
      },
      rollbackStatus: summarizeRollback(normalizedRollbackPlan),
      nextOptions: [
        ...prompts.map((prompt, index) => ({
          optionId: `recovery-prompt-${index + 1}`,
          optionType: "prompt",
          label: prompt,
        })),
        ...normalizedRecoveryActions.map((action, index) => ({
          optionId: action.actionId ?? `recovery-action-${index + 1}`,
          optionType: action.actionType ?? "unknown",
          label: action.actionType ?? "continue",
        })),
      ],
      summary: {
        hasRollback: normalizedRollbackPlan.rollbackMode === "targeted",
        optionCount: prompts.length + normalizedRecoveryActions.length,
        requiresUserDecision: normalizedRecoveryDecision.requiresUserDecision === true,
      },
    },
  };
}
