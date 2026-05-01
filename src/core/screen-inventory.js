function normalizeJourneyMap(journeyMap) {
  return journeyMap && typeof journeyMap === "object"
    ? {
        goals: Array.isArray(journeyMap.goals) ? journeyMap.goals : [],
        flows: Array.isArray(journeyMap.flows) ? journeyMap.flows : [],
      }
    : { goals: [], flows: [] };
}

function normalizeFlowSteps(flow) {
  if (Array.isArray(flow?.transitionMap) && flow.transitionMap.length > 0) {
    const transitionEntries = new Map(
      flow.transitionMap
        .filter((entry) => entry && typeof entry === "object")
        .map((entry) => [entry.transitionId ?? entry.stepId ?? null, entry]),
    );

    return (Array.isArray(flow?.transitions) ? flow.transitions : []).map((transition) => {
      const transitionId = transition?.transitionId ?? transition?.stepId ?? null;
      return {
        ...transition,
        ...(transitionId ? transitionEntries.get(transitionId) ?? {} : {}),
      };
    });
  }

  if (Array.isArray(flow?.transitions)) {
    return flow.transitions;
  }

  if (Array.isArray(flow?.steps)) {
    return flow.steps;
  }

  return [];
}

function createScreen({
  screenId,
  screenType,
  title,
  journeyId,
  flowType,
  stepId,
  transitionId,
  trigger,
  branch,
  actingComponent,
  fromState,
  toState,
  observableOutput,
  evidenceSource,
  isEntryScreen,
  isExitScreen,
}) {
  return {
    screenId,
    screenType,
    title,
    journeyId,
    flowType,
    stepId,
    transitionId,
    trigger,
    branch,
    actingComponent,
    fromState,
    toState,
    observableOutput,
    evidenceSource,
    isEntryScreen,
    isExitScreen,
  };
}

function inferScreenType(flowType, transition, index) {
  const transitionId = transition?.transitionId ?? transition?.stepId ?? "";
  const branch = transition?.branch ?? "success";

  if (flowType === "onboarding-initialization") {
    return branch === "failure" || index === 0 ? "wizard" : "detail";
  }

  if (flowType === "execution-state-advancement") {
    return transitionId.includes("observe-state") || transitionId.includes("record-result") ? "dashboard" : "workspace";
  }

  if (flowType === "approval-explanation-resolution") {
    return "detail";
  }

  if (flowType === "failure-recovery-continuity") {
    return "tracking";
  }

  if (flowType === "continuous-operation-reentry") {
    return transitionId.includes("live-status") ? "dashboard" : "workspace";
  }

  return "detail";
}

function formatTransitionTitle(transitionId) {
  if (typeof transitionId !== "string" || !transitionId.trim()) {
    return "Untitled screen";
  }

  const parts = transitionId.split(":").slice(1);
  const rawTitle = (parts.length ? parts.join(" ") : transitionId).replace(/-/g, " ");
  return rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
}

function inferTitle(transition) {
  return transition?.label ?? transition?.observableOutput ?? formatTransitionTitle(transition?.transitionId ?? transition?.stepId);
}

export function defineScreenInventory({
  journeyMap,
} = {}) {
  const normalizedJourneyMap = normalizeJourneyMap(journeyMap);
  const screens = normalizedJourneyMap.flows.flatMap((flow) =>
    normalizeFlowSteps(flow).map((transition, index, transitions) =>
      createScreen({
        screenId: `${flow.journeyId}:${transition.transitionId ?? transition.stepId ?? index + 1}`,
        screenType: inferScreenType(flow.flowType, transition, index),
        title: inferTitle(transition),
        journeyId: flow.journeyId,
        flowType: flow.flowType,
        stepId: transition.transitionId ?? transition.stepId ?? null,
        transitionId: transition.transitionId ?? null,
        trigger: transition.trigger ?? null,
        branch: transition.branch ?? "success",
        actingComponent: transition.actingComponent ?? null,
        fromState: transition.fromState ?? null,
        toState: transition.toState ?? null,
        observableOutput: transition.observableOutput ?? null,
        evidenceSource: transition.evidenceSource ?? null,
        isEntryScreen: index === 0,
        isExitScreen: typeof transition.isTerminal === "boolean" ? transition.isTerminal : index === transitions.length - 1,
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
        branchesCovered: [...new Set(screens.map((screen) => screen.branch))],
        journeyIds: [...new Set(screens.map((screen) => screen.journeyId))],
      },
    },
  };
}
