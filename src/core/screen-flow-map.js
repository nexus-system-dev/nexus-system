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

function normalizeTransitionMap(flow) {
  if (Array.isArray(flow?.transitionMap) && flow.transitionMap.length > 0) {
    const transitionDetails = new Map(
      (Array.isArray(flow?.transitions) ? flow.transitions : [])
        .filter((transition) => transition && typeof transition === "object")
        .map((transition) => [transition.transitionId ?? transition.fromStepId ?? transition.stepId ?? null, transition]),
    );

    return flow.transitionMap.map((entry) => {
      const transitionId = entry?.transitionId ?? entry?.fromStepId ?? entry?.stepId ?? null;
      const details = transitionId ? transitionDetails.get(transitionId) ?? {} : {};
      return {
        ...details,
        ...entry,
        transitionId,
      };
    });
  }

  if (Array.isArray(flow?.transitions)) {
    return flow.transitions.map((transition, index, transitions) => ({
      transitionId: transition.transitionId ?? transition.fromStepId ?? transition.stepId ?? null,
      nextTransitionId: transitions[index + 1]?.transitionId ?? transitions[index + 1]?.fromStepId ?? transitions[index + 1]?.stepId ?? null,
      branch: transition.branch ?? "success",
      isTerminal: index === transitions.length - 1,
      trigger: transition.trigger ?? null,
      actingComponent: transition.actingComponent ?? null,
      fromState: transition.fromState ?? null,
      toState: transition.toState ?? null,
    }));
  }

  return [];
}

function resolveTrigger(screen, transitionEntry) {
  return screen.trigger ?? transitionEntry?.trigger ?? "manual-navigation";
}

function inferNextAction(screen, transitionEntry) {
  if (transitionEntry?.nextTransitionId) {
    return `go-to:${transitionEntry.nextTransitionId}`;
  }

  if ((screen.branch ?? transitionEntry?.branch) === "approval") {
    return "request-approval-decision";
  }

  if (screen.flowType === "failure-recovery-continuity") {
    return "review-recovery-status";
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
    const transitionMap = normalizeTransitionMap(flow);
    const transitionEntry =
      transitionMap.find((entry) => entry.transitionId === (screen.transitionId ?? screen.stepId)) ??
      transitionMap.find((entry) => entry.transitionId === screen.stepId) ??
      null;

    return {
      screenId: screen.screenId,
      screenType: screen.screenType,
      journeyId: screen.journeyId,
      flowType: screen.flowType,
      stepId: screen.stepId,
      transitionId: screen.transitionId ?? screen.stepId ?? null,
      trigger: resolveTrigger(screen, transitionEntry),
      nextAction: inferNextAction(screen, transitionEntry),
      nextStepId: transitionEntry?.nextTransitionId ?? null,
      branch: screen.branch ?? transitionEntry?.branch ?? "success",
      actingComponent: screen.actingComponent ?? transitionEntry?.actingComponent ?? null,
      fromState: screen.fromState ?? transitionEntry?.fromState ?? null,
      toState: screen.toState ?? transitionEntry?.toState ?? null,
      isTerminal: Boolean(screen.isExitScreen ?? transitionEntry?.isTerminal),
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
