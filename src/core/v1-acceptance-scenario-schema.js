function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

const REQUIRED_SCENARIOS = [
  {
    scenarioKey: "onboarding-first-value",
    flowType: "onboarding",
    requiredOutputs: ["firstValueOutput", "firstValueSummary"],
  },
  {
    scenarioKey: "execution-state-update",
    flowType: "execution",
    requiredOutputs: ["executionResult", "projectExplanation"],
  },
  {
    scenarioKey: "approval-explanation",
    flowType: "execution",
    requiredOutputs: ["approvalExplanation", "projectExplanation"],
  },
  {
    scenarioKey: "failure-recovery",
    flowType: "execution",
    requiredOutputs: ["recoveryOptionsPayload", "failureExplanation"],
  },
  {
    scenarioKey: "workspace-continuity",
    flowType: "tracking",
    requiredOutputs: ["workspaceNavigationModel"],
  },
];

function createScenarioDefinition(baseScenario, productFlows, expectedOutcomes) {
  const matchingFlow = productFlows.find((flow) => flow.flowType === baseScenario.flowType) ?? null;
  const matchingOutcome = expectedOutcomes.find((item) => item.scenarioKey === baseScenario.scenarioKey) ?? null;

  return {
    scenarioKey: baseScenario.scenarioKey,
    flowType: baseScenario.flowType,
    journeyId: matchingFlow?.journeyId ?? null,
    entryStepId: matchingFlow?.entryStepId ?? null,
    requiredOutputs: baseScenario.requiredOutputs,
    expectedOutcome:
      matchingOutcome?.expectedOutcome
      ?? matchingFlow?.intent
      ?? `${baseScenario.scenarioKey} should complete successfully`,
    successCriteria:
      normalizeArray(matchingOutcome?.successCriteria).length > 0
        ? normalizeArray(matchingOutcome.successCriteria)
        : baseScenario.requiredOutputs,
  };
}

export function defineV1AcceptanceScenarioSchema({
  productFlows = [],
  expectedOutcomes = [],
} = {}) {
  const normalizedProductFlows = normalizeArray(productFlows);
  const normalizedExpectedOutcomes = normalizeArray(expectedOutcomes).map((item) => normalizeObject(item));
  const scenarios = REQUIRED_SCENARIOS.map((scenario) =>
    createScenarioDefinition(scenario, normalizedProductFlows, normalizedExpectedOutcomes)
  );

  return {
    acceptanceScenario: {
      acceptanceScenarioId: "v1-acceptance-scenarios",
      version: "v1",
      scenarios,
      summary: {
        totalScenarios: scenarios.length,
        coveredFlowTypes: [...new Set(scenarios.map((scenario) => scenario.flowType))],
      },
    },
  };
}
