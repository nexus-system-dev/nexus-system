function normalizeUserJourneys(userJourneys) {
  const journeys = Array.isArray(userJourneys?.journeys) ? userJourneys.journeys : [];
  return {
    goals: Array.isArray(userJourneys?.goals) ? userJourneys.goals : [],
    journeys,
  };
}

function inferFlowType(journeyId) {
  if (journeyId === "journey-onboarding") {
    return "onboarding";
  }

  if (journeyId === "journey-execution") {
    return "execution";
  }

  if (journeyId === "journey-release") {
    return "tracking";
  }

  if (journeyId === "journey-growth") {
    return "project-creation";
  }

  return "general";
}

function buildTransitions(steps) {
  return steps.map((step, index) => ({
    fromStepId: step.stepId,
    toStepId: steps[index + 1]?.stepId ?? null,
    isTerminal: index === steps.length - 1,
  }));
}

export function createJourneyMap({
  userJourneys,
} = {}) {
  const normalized = normalizeUserJourneys(userJourneys);
  const flows = normalized.journeys.map((journey) => ({
    journeyId: journey.journeyId,
    flowType: inferFlowType(journey.journeyId),
    name: journey.name,
    intent: journey.intent,
    entryStepId: journey.steps?.[0]?.stepId ?? null,
    steps: Array.isArray(journey.steps) ? journey.steps : [],
    transitions: buildTransitions(Array.isArray(journey.steps) ? journey.steps : []),
  }));

  return {
    journeyMap: {
      goals: normalized.goals,
      flows,
      summary: {
        totalJourneys: flows.length,
        totalSteps: flows.reduce((total, flow) => total + flow.steps.length, 0),
        flowTypes: [...new Set(flows.map((flow) => flow.flowType))],
      },
    },
  };
}
