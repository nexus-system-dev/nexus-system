import test from "node:test";
import assert from "node:assert/strict";

import { createCostAwareActionSelector } from "../src/core/cost-aware-action-selector.js";

function buildCandidateActions() {
  return [
    {
      actionId: "action-1",
      actionType: "run-tests",
    },
    {
      actionId: "action-2",
      actionType: "deploy-artifact",
    },
    {
      actionId: "action-3",
      actionType: "request-approval",
    },
  ];
}

function buildBudgetDecision(overrides = {}) {
  return {
    decision: "allowed",
    ...overrides,
  };
}

function buildDecisionIntelligence(overrides = {}) {
  return {
    summary: {
      canAutoExecute: true,
      requiresApproval: false,
      ...overrides.summary,
    },
  };
}

test("cost aware action selector returns missing-inputs when candidates and budget are absent", () => {
  const selection = createCostAwareActionSelector({
    candidateActions: null,
    budgetDecision: null,
    decisionIntelligence: null,
  });

  assert.equal(selection.selectionBasis, "missing-inputs");
  assert.equal(selection.budgetPressure, "unknown");
  assert.equal(selection.selectedAction, null);
  assert.deepEqual(selection.rankedActions, []);
  assert.equal(selection.summary.hasSelection, false);
});

test("cost aware action selector picks the first feasible-now action in stable order", () => {
  const selection = createCostAwareActionSelector({
    candidateActions: buildCandidateActions(),
    budgetDecision: buildBudgetDecision({ decision: "allowed" }),
    decisionIntelligence: buildDecisionIntelligence(),
  });

  assert.equal(selection.selectionBasis, "complete");
  assert.equal(selection.budgetPressure, "none");
  assert.equal(selection.selectedAction?.actionId, "action-1");
  assert.deepEqual(
    selection.rankedActions.map((action) => [action.rank, action.actionId, action.reason.code]),
    [
      [1, "action-1", "ACTION_FEASIBLE_NOW"],
      [2, "action-2", "ACTION_FEASIBLE_NOW"],
      [3, "action-3", "ACTION_FEASIBLE_NOW"],
    ],
  );
});

test("cost aware action selector marks all actions as requires approval when budget escalates", () => {
  const selection = createCostAwareActionSelector({
    candidateActions: buildCandidateActions(),
    budgetDecision: buildBudgetDecision({ decision: "requires-escalation" }),
    decisionIntelligence: buildDecisionIntelligence(),
  });

  assert.equal(selection.selectedAction, null);
  assert.equal(selection.budgetPressure, "high");
  assert.equal(selection.summary.feasibleCount, 3);
  assert.equal(selection.rankedActions.every((action) => action.requiresApproval === true), true);
  assert.equal(selection.rankedActions[0].reason.source, "cost-aware-action-selector");
});

test("cost aware action selector blocks all actions when budget blocks execution", () => {
  const selection = createCostAwareActionSelector({
    candidateActions: buildCandidateActions(),
    budgetDecision: buildBudgetDecision({ decision: "blocked" }),
    decisionIntelligence: buildDecisionIntelligence(),
  });

  assert.equal(selection.selectedAction, null);
  assert.equal(selection.budgetPressure, "critical");
  assert.equal(selection.summary.feasibleCount, 0);
  assert.equal(selection.rankedActions.every((action) => action.costFeasible === false), true);
  assert.equal(selection.rankedActions[0].reason.code, "ACTION_BLOCKED_BY_BUDGET");
});

test("cost aware action selector uses signals-only when budget decision is missing", () => {
  const selection = createCostAwareActionSelector({
    candidateActions: buildCandidateActions(),
    budgetDecision: null,
    decisionIntelligence: buildDecisionIntelligence({
      summary: {
        canAutoExecute: false,
        requiresApproval: true,
      },
    }),
  });

  assert.equal(selection.selectionBasis, "signals-only");
  assert.equal(selection.budgetPressure, "unknown");
  assert.equal(selection.selectedAction, null);
  assert.equal(selection.rankedActions.every((action) => action.costFeasible === true), true);
  assert.equal(selection.rankedActions.every((action) => action.requiresApproval === true), true);
});

test("cost aware action selector returns no-candidates when action list is empty", () => {
  const selection = createCostAwareActionSelector({
    candidateActions: [],
    budgetDecision: buildBudgetDecision({ decision: "allowed" }),
    decisionIntelligence: buildDecisionIntelligence(),
  });

  assert.equal(selection.selectionBasis, "no-candidates");
  assert.equal(selection.selectedAction, null);
  assert.deepEqual(selection.rankedActions, []);
  assert.equal(selection.summary.rankedCount, 0);
});
