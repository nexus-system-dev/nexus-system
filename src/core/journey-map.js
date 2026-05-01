function normalizeUserJourneys(userJourneys) {
  const journeys = Array.isArray(userJourneys?.journeys) ? userJourneys.journeys : [];
  return {
    goals: Array.isArray(userJourneys?.goals) ? userJourneys.goals : [],
    journeys,
  };
}

function inferFlowType(journeyId) {
  const mapping = {
    "journey-onboarding-initialization": "onboarding-initialization",
    "journey-execution-state-advancement": "execution-state-advancement",
    "journey-approval-explanation-resolution": "approval-explanation-resolution",
    "journey-failure-recovery-continuity": "failure-recovery-continuity",
    "journey-continuous-operation-reentry": "continuous-operation-reentry",
  };

  return mapping[journeyId] ?? "general";
}

function resolveNextTransitionId(currentTransition, transitions) {
  const currentToState = currentTransition?.toState ?? null;

  if (!currentToState) {
    return null;
  }

  const nextTransition = transitions.find((candidate) => candidate?.fromState === currentToState) ?? null;
  return nextTransition?.transitionId ?? null;
}

function buildTransitions(transitions) {
  return transitions.map((transition, index) => ({
    transitionId: transition.transitionId,
    fromState: transition.fromState,
    toState: transition.toState,
    nextTransitionId: resolveNextTransitionId(transition, transitions),
    branch: transition.branch ?? "success",
    isTerminal: resolveNextTransitionId(transition, transitions) === null,
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
    entryStepId: journey.transitions?.[0]?.transitionId ?? null,
    entryPoints: Array.isArray(journey.entryPoints) ? journey.entryPoints : [],
    initialSystemState: journey.initialSystemState ?? {},
    transitions: Array.isArray(journey.transitions) ? journey.transitions : [],
    branches: journey.branches ?? {},
    exitStates: Array.isArray(journey.exitStates) ? journey.exitStates : [],
    reEntryPoints: Array.isArray(journey.reEntryPoints) ? journey.reEntryPoints : [],
    crossJourneyConnections: Array.isArray(journey.crossJourneyConnections) ? journey.crossJourneyConnections : [],
    stateMappings: Array.isArray(journey.stateMappings) ? journey.stateMappings : [],
    steps: Array.isArray(journey.transitions) ? journey.transitions : [],
    transitionMap: buildTransitions(Array.isArray(journey.transitions) ? journey.transitions : []),
  }));

  return {
    journeyMap: {
      goals: normalized.goals,
      flows,
      summary: {
        totalJourneys: flows.length,
        totalSteps: flows.reduce((total, flow) => total + flow.transitions.length, 0),
        flowTypes: [...new Set(flows.map((flow) => flow.flowType))],
        entryPoints: flows.flatMap((flow) => flow.entryPoints),
      },
    },
  };
}
