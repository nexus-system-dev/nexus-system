function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeCandidateActions(candidateActions = []) {
  return normalizeArray(candidateActions)
    .map((action) => normalizeObject(action))
    .map((action) => ({
      actionId: normalizeString(action.actionId),
      actionType: normalizeString(action.actionType),
    }))
    .filter((action) => action.actionId !== null && action.actionType !== null);
}

function resolveBudgetPressure(budgetDecision = null) {
  const decision = normalizeString(normalizeObject(budgetDecision).decision);

  if (decision === null) {
    return "unknown";
  }

  if (decision === "allowed") {
    return "none";
  }

  if (decision === "requires-escalation") {
    return "high";
  }

  if (decision === "blocked") {
    return "critical";
  }

  return "unknown";
}

function resolveActionState({ budgetDecision = null, decisionIntelligence = null }) {
  const normalizedBudgetDecision = normalizeObject(budgetDecision);
  const normalizedDecisionIntelligence = normalizeObject(decisionIntelligence);
  const budgetDecisionValue = normalizeString(normalizedBudgetDecision.decision);
  const requiresApproval =
    budgetDecisionValue === "requires-escalation"
    || normalizedDecisionIntelligence.summary?.requiresApproval === true
    || normalizedDecisionIntelligence.summary?.canAutoExecute === false;
  const costFeasible = budgetDecisionValue !== "blocked";

  return {
    costFeasible,
    requiresApproval,
    budgetDecisionValue,
  };
}

function buildReason({ costFeasible, requiresApproval }) {
  if (!costFeasible) {
    return {
      code: "ACTION_BLOCKED_BY_BUDGET",
      source: "cost-aware-action-selector",
      summary: "Action is blocked because the current budget decision blocks execution.",
    };
  }

  if (requiresApproval) {
    return {
      code: "ACTION_REQUIRES_APPROVAL",
      source: "cost-aware-action-selector",
      summary: "Action remains cost-feasible but requires approval before execution.",
    };
  }

  return {
    code: "ACTION_FEASIBLE_NOW",
    source: "cost-aware-action-selector",
    summary: "Action is executable now under the current budget and decision signals.",
  };
}

function resolveBucket({ costFeasible, requiresApproval }) {
  if (!costFeasible) {
    return "blocked";
  }

  if (requiresApproval) {
    return "requires-approval";
  }

  return "feasible-now";
}

function resolveSelectionBasis({ candidateActionsProvided, rankedCount, budgetDecision }) {
  const normalizedBudgetDecision = normalizeObject(budgetDecision);
  const hasKnownBudgetDecision = normalizeString(normalizedBudgetDecision.decision) !== null;

  if (!candidateActionsProvided && !hasKnownBudgetDecision) {
    return "missing-inputs";
  }

  if (rankedCount === 0) {
    return "no-candidates";
  }

  if (!hasKnownBudgetDecision) {
    return "signals-only";
  }

  return "complete";
}

export function createCostAwareActionSelector({
  candidateActions = null,
  budgetDecision = null,
  decisionIntelligence = null,
} = {}) {
  const candidateActionsProvided = Array.isArray(candidateActions);
  const normalizedActions = normalizeCandidateActions(candidateActions);
  const actionState = resolveActionState({ budgetDecision, decisionIntelligence });
  const budgetPressure = resolveBudgetPressure(budgetDecision);

  const bucketedActions = {
    "feasible-now": [],
    "requires-approval": [],
    blocked: [],
  };

  for (const action of normalizedActions) {
    const reason = buildReason(actionState);
    const rankedAction = {
      actionId: action.actionId,
      actionType: action.actionType,
      costFeasible: actionState.costFeasible,
      requiresApproval: actionState.requiresApproval,
      reason,
    };

    bucketedActions[resolveBucket(actionState)].push(rankedAction);
  }

  const rankedActions = [
    ...bucketedActions["feasible-now"],
    ...bucketedActions["requires-approval"],
    ...bucketedActions.blocked,
  ].map((action, index) => ({
    rank: index + 1,
    ...action,
  }));

  const selectedActionCandidate =
    rankedActions.find((action) => action.costFeasible === true && action.requiresApproval === false) ?? null;
  const selectedAction = selectedActionCandidate
    ? {
        actionId: selectedActionCandidate.actionId,
        actionType: selectedActionCandidate.actionType,
        costFeasible: selectedActionCandidate.costFeasible,
        requiresApproval: selectedActionCandidate.requiresApproval,
        reason: selectedActionCandidate.reason,
      }
    : null;
  const selectionBasis = resolveSelectionBasis({
    candidateActionsProvided,
    rankedCount: rankedActions.length,
    budgetDecision,
  });
  const feasibleCount = rankedActions.filter((action) => action.costFeasible === true).length;

  return {
    costAwareActionSelectionId: `cost-aware-action-selection:${normalizeString(normalizeObject(budgetDecision).decision) ?? "unknown"}:${normalizedActions.length}`,
    selectedAction,
    rankedActions,
    selectionBasis,
    budgetPressure,
    summary: {
      hasSelection: selectedAction !== null,
      rankedCount: rankedActions.length,
      feasibleCount,
      budgetPressureApplied: budgetPressure !== "none",
    },
  };
}
