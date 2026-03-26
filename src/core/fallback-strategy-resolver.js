function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function buildStrategy({ strategyId, action, targetMode = null, reason, confidence = "medium" }) {
  return {
    strategyId,
    action,
    targetMode,
    reason,
    confidence,
  };
}

export function createFallbackStrategyResolver({
  failureRecoveryModel = null,
  executionModeDecision = null,
} = {}) {
  const normalizedFailureRecoveryModel = normalizeObject(failureRecoveryModel);
  const normalizedExecutionModeDecision = normalizeObject(executionModeDecision);
  const failureClass = normalizedFailureRecoveryModel.failureClass ?? "unknown-failure";
  const selectedMode = normalizedExecutionModeDecision.selectedMode ?? "agent";

  let primaryStrategy = buildStrategy({
    strategyId: "fallback-safe-mode",
    action: "switch-execution-mode",
    targetMode: "sandbox",
    reason: "Fallback defaults to a safer controlled execution mode",
  });

  if (failureClass === "approval-blocked") {
    primaryStrategy = buildStrategy({
      strategyId: "fallback-request-approval",
      action: "request-approval",
      reason: "Execution is blocked on approval and must escalate to the user",
      confidence: "high",
    });
  } else if (failureClass === "policy-blocked") {
    primaryStrategy = buildStrategy({
      strategyId: "fallback-downgrade-scope",
      action: "downgrade-scope",
      targetMode: "sandbox",
      reason: "Policy blocks the current path, so scope should be reduced before continuing",
      confidence: "high",
    });
  } else if (failureClass === "artifact-failure") {
    primaryStrategy = buildStrategy({
      strategyId: "fallback-validation-only",
      action: "switch-execution-mode",
      targetMode: "sandbox",
      reason: "Artifact failures should fall back to validation or safer rebuild paths",
      confidence: "medium",
    });
  } else if (selectedMode === "xcode") {
    primaryStrategy = buildStrategy({
      strategyId: "fallback-cloud-build",
      action: "switch-execution-mode",
      targetMode: "sandbox",
      reason: "Remote Mac flow failed, so the next safe step is to move back to a controlled cloud path",
      confidence: "medium",
    });
  } else if (selectedMode === "local-terminal") {
    primaryStrategy = buildStrategy({
      strategyId: "fallback-cloud-workspace",
      action: "switch-execution-mode",
      targetMode: "sandbox",
      reason: "Local bridge failed, so Nexus should continue from the primary cloud workspace",
      confidence: "high",
    });
  } else if (selectedMode === "temp-branch") {
    primaryStrategy = buildStrategy({
      strategyId: "fallback-agent-mode",
      action: "switch-execution-mode",
      targetMode: "agent",
      reason: "Branch execution failed, so retry via agent orchestration is safer",
      confidence: "medium",
    });
  }

  const alternatives = (normalizedFailureRecoveryModel.fallbackOptions ?? [])
    .filter((option) => option !== primaryStrategy.strategyId)
    .map((option, index) =>
      buildStrategy({
        strategyId: `fallback-option-${index + 1}`,
        action: option,
        targetMode:
          option.includes("cloud") ? "sandbox"
          : option.includes("approval") ? null
          : option.includes("safe") ? "sandbox"
          : null,
        reason: `Fallback option derived from failure recovery model: ${option}`,
        confidence: "low",
      }),
    );

  return {
    fallbackStrategy: {
      fallbackStrategyId: `fallback-strategy:${normalizedFailureRecoveryModel.recoveryId ?? "unknown"}`,
      failureClass,
      currentMode: selectedMode,
      primaryStrategy,
      alternatives,
      summary: {
        hasModeSwitch: Boolean(primaryStrategy.targetMode),
        requiresUserApproval: primaryStrategy.action === "request-approval",
        strategyCount: 1 + alternatives.length,
      },
    },
  };
}
