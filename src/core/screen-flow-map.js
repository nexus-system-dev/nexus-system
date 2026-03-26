function normalizeJourneyMap(journeyMap) {
  return journeyMap && typeof journeyMap === "object"
    ? { flows: Array.isArray(journeyMap.flows) ? journeyMap.flows : [] }
    : { flows: [] };
}

function normalizeScreenInventory(screenInventory) {
  return screenInventory && typeof screenInventory === "object"
    ? { screens: Array.isArray(screenInventory.screens) ? screenInventory.screens : [] }
    : { screens: [] };
}

function inferTrigger(flowType) {
  if (flowType === "onboarding") {
    return "project-created";
  }

  if (flowType === "execution") {
    return "task-selected";
  }

  if (flowType === "tracking") {
    return "release-started";
  }

  if (flowType === "project-creation") {
    return "growth-workflow-opened";
  }

  return "manual-navigation";
}

function inferNextAction(transition, flowType) {
  if (transition?.toStepId) {
    return `go-to:${transition.toStepId}`;
  }

  if (flowType === "tracking") {
    return "review-status";
  }

  return "complete-flow";
}

export function createScreenToFlowMapping({
  screenInventory,
  journeyMap,
} = {}) {
  const normalizedScreenInventory = normalizeScreenInventory(screenInventory);
  const normalizedJourneyMap = normalizeJourneyMap(journeyMap);
  const flowIndex = new Map(normalizedJourneyMap.flows.map((flow) => [flow.journeyId, flow]));
  const mappings = normalizedScreenInventory.screens.map((screen) => {
    const flow = flowIndex.get(screen.journeyId) ?? null;
    const transition = flow?.transitions?.find((entry) => entry.fromStepId === screen.stepId) ?? null;

    return {
      screenId: screen.screenId,
      screenType: screen.screenType,
      journeyId: screen.journeyId,
      flowType: screen.flowType,
      stepId: screen.stepId,
      trigger: inferTrigger(screen.flowType),
      nextAction: inferNextAction(transition, screen.flowType),
      nextStepId: transition?.toStepId ?? null,
      isTerminal: Boolean(transition?.isTerminal),
    };
  });

  return {
    screenFlowMap: {
      mappings,
      summary: {
        totalMappings: mappings.length,
        triggers: [...new Set(mappings.map((mapping) => mapping.trigger))],
        terminalScreens: mappings.filter((mapping) => mapping.isTerminal).map((mapping) => mapping.screenId),
      },
    },
  };
}
