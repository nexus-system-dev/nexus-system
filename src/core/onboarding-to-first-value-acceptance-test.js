function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function findScenario(acceptanceScenario) {
  const scenarios = Array.isArray(acceptanceScenario?.scenarios) ? acceptanceScenario.scenarios : [];
  return scenarios.find((scenario) => scenario.scenarioKey === "onboarding-first-value") ?? null;
}

export function createOnboardingToFirstValueAcceptanceTest({
  acceptanceScenario = null,
  firstValueOutput = null,
} = {}) {
  const normalizedAcceptanceScenario = normalizeObject(acceptanceScenario);
  const normalizedFirstValueOutput = normalizeObject(firstValueOutput);
  const scenario = findScenario(normalizedAcceptanceScenario);
  const hasVisibleOutcome = Boolean(normalizedFirstValueOutput.summary?.feelsReal);
  const hasPreview = Boolean(normalizedFirstValueOutput.preview?.headline);
  const passed = Boolean(scenario && hasVisibleOutcome && hasPreview);

  return {
    acceptanceResult: {
      acceptanceResultId: `acceptance:onboarding-first-value:${normalizedFirstValueOutput.outputId ?? "unknown"}`,
      scenarioKey: "onboarding-first-value",
      status: passed ? "passed" : "failed",
      expectedOutcome: scenario?.expectedOutcome ?? "User gets a first visible result",
      observedOutcome: hasVisibleOutcome
        ? normalizedFirstValueOutput.preview?.headline ?? "First value output is available"
        : "No visible first value output was produced",
      checks: {
        scenarioResolved: Boolean(scenario),
        hasVisibleOutcome,
        hasPreview,
      },
      summary: {
        passed,
        requiredOutputs: scenario?.requiredOutputs ?? ["firstValueOutput"],
      },
    },
  };
}
