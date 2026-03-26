function normalizeJourneyMap(journeyMap) {
  return journeyMap && typeof journeyMap === "object"
    ? {
        goals: Array.isArray(journeyMap.goals) ? journeyMap.goals : [],
        flows: Array.isArray(journeyMap.flows) ? journeyMap.flows : [],
      }
    : { goals: [], flows: [] };
}

function createScreen({ screenId, screenType, title, journeyId, flowType, stepId }) {
  return {
    screenId,
    screenType,
    title,
    journeyId,
    flowType,
    stepId,
  };
}

function inferScreenType(flowType, stepId) {
  if (flowType === "onboarding") {
    return stepId === "capture-intake" ? "wizard" : "detail";
  }

  if (flowType === "execution") {
    return stepId === "track-progress" ? "dashboard" : "detail";
  }

  if (flowType === "tracking") {
    return "tracking";
  }

  if (flowType === "project-creation") {
    return stepId === "track-kpis" ? "dashboard" : "workspace";
  }

  return "detail";
}

function inferTitle(step) {
  return step?.label ?? step?.stepId ?? "Untitled screen";
}

export function defineScreenInventory({
  journeyMap,
} = {}) {
  const normalizedJourneyMap = normalizeJourneyMap(journeyMap);
  const screens = normalizedJourneyMap.flows.flatMap((flow) =>
    (flow.steps ?? []).map((step, index) =>
      createScreen({
        screenId: `${flow.journeyId}:${step.stepId ?? index + 1}`,
        screenType: inferScreenType(flow.flowType, step.stepId),
        title: inferTitle(step),
        journeyId: flow.journeyId,
        flowType: flow.flowType,
        stepId: step.stepId ?? null,
      }),
    ),
  );

  return {
    screenInventory: {
      goals: normalizedJourneyMap.goals,
      screens,
      summary: {
        totalScreens: screens.length,
        screenTypes: [...new Set(screens.map((screen) => screen.screenType))],
        flowsCovered: [...new Set(screens.map((screen) => screen.flowType))],
      },
    },
  };
}
