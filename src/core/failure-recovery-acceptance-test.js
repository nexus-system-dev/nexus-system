function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function findScenario(acceptanceScenario) {
  const scenarios = Array.isArray(acceptanceScenario?.scenarios) ? acceptanceScenario.scenarios : [];
  return scenarios.find((scenario) => scenario.scenarioKey === "failure-recovery") ?? null;
}

export function createFailureRecoveryAcceptanceTest({
  acceptanceScenario = null,
  recoveryDecision = null,
  recoveryOptionsPayload = null,
  failureExplanation = null,
} = {}) {
  const normalizedAcceptanceScenario = normalizeObject(acceptanceScenario);
  const normalizedRecoveryDecision = normalizeObject(recoveryDecision);
  const normalizedRecoveryOptionsPayload = normalizeObject(recoveryOptionsPayload);
  const normalizedFailureExplanation = normalizeObject(failureExplanation);
  const scenario = findScenario(normalizedAcceptanceScenario);
  const hasRecoveryPath = Boolean(normalizedRecoveryDecision.decisionType);
  const hasUserOptions = Boolean(normalizedRecoveryOptionsPayload.headline);
  const hasFailureReason = Boolean(
    normalizedFailureExplanation.likelyCause ?? normalizedFailureExplanation.summary,
  );
  const passed = Boolean(scenario && hasRecoveryPath && hasUserOptions && hasFailureReason);

  return {
    acceptanceResult: {
      acceptanceResultId: `acceptance:failure-recovery:${normalizedRecoveryDecision.recoveryDecisionId ?? "unknown"}`,
      scenarioKey: "failure-recovery",
      status: passed ? "passed" : "failed",
      expectedOutcome: scenario?.expectedOutcome ?? "Failure leads to recovery options",
      observedOutcome: hasRecoveryPath
        ? normalizedRecoveryOptionsPayload.headline ?? "Recovery path was generated for the failure"
        : "No recovery path was produced",
      checks: {
        scenarioResolved: Boolean(scenario),
        hasRecoveryPath,
        hasUserOptions,
        hasFailureReason,
      },
      summary: {
        passed,
        requiredOutputs: scenario?.requiredOutputs ?? ["recoveryOptionsPayload", "failureExplanation"],
      },
    },
  };
}
