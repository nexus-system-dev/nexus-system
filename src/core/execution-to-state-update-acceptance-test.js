function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function findScenario(acceptanceScenario) {
  const scenarios = Array.isArray(acceptanceScenario?.scenarios) ? acceptanceScenario.scenarios : [];
  return scenarios.find((scenario) => scenario.scenarioKey === "execution-state-update") ?? null;
}

export function createExecutionToStateUpdateAcceptanceTest({
  acceptanceScenario = null,
  executionResult = null,
  storageRecord = null,
  projectExplanation = null,
} = {}) {
  const normalizedAcceptanceScenario = normalizeObject(acceptanceScenario);
  const normalizedExecutionResult = normalizeObject(executionResult);
  const normalizedStorageRecord = normalizeObject(storageRecord);
  const normalizedProjectExplanation = normalizeObject(projectExplanation);
  const scenario = findScenario(normalizedAcceptanceScenario);
  const executionCompleted = ["completed", "succeeded", "success"].includes(
    normalizedExecutionResult.status ?? "",
  );
  const hasArtifacts = Array.isArray(normalizedStorageRecord.artifacts)
    ? normalizedStorageRecord.artifacts.length > 0
    : false;
  const hasChangeExplanation = Boolean(
    normalizedProjectExplanation.change?.summary ?? normalizedProjectExplanation.change?.headline,
  );
  const passed = Boolean(scenario && executionCompleted && hasArtifacts && hasChangeExplanation);

  return {
    acceptanceResult: {
      acceptanceResultId: `acceptance:execution-state-update:${normalizedExecutionResult.executionResultId ?? "unknown"}`,
      scenarioKey: "execution-state-update",
      status: passed ? "passed" : "failed",
      expectedOutcome: scenario?.expectedOutcome ?? "Execution updates project state and explanation payload",
      observedOutcome: executionCompleted
        ? normalizedProjectExplanation.change?.summary ?? "Execution completed and project state changed"
        : "Execution did not complete successfully",
      checks: {
        scenarioResolved: Boolean(scenario),
        executionCompleted,
        hasArtifacts,
        hasChangeExplanation,
      },
      summary: {
        passed,
        requiredOutputs: scenario?.requiredOutputs ?? ["executionResult", "projectExplanation"],
      },
    },
  };
}
