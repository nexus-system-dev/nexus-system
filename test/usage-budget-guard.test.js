import test from "node:test";
import assert from "node:assert/strict";

import { createUsageBudgetGuard } from "../src/core/usage-budget-guard.js";

function buildPolicy(overrides = {}) {
  return {
    spendThresholds: {
      perAction: 5,
      perSession: 10,
      perDay: 50,
      currency: "usd",
    },
    escalationRules: {
      onSpendThresholdExceeded: "require-approval",
    },
    ...overrides,
  };
}

function buildCostSummary(overrides = {}) {
  return {
    totalEstimatedCost: 4,
    currency: "usd",
    currencyMismatch: false,
    summary: {
      totalCost: 4,
      summaryStatus: "complete",
    },
    ...overrides,
  };
}

test("usage budget guard returns escalation on missing cost summary", () => {
  const { budgetDecision, approvalRequest } = createUsageBudgetGuard({
    costSummary: null,
    agentGovernancePolicy: buildPolicy(),
  });

  assert.equal(budgetDecision.decision, "requires-escalation");
  assert.equal(budgetDecision.source, "missing-inputs");
  assert.equal(budgetDecision.totalCost, null);
  assert.equal(budgetDecision.constraintSource, "policy-only");
  assert.equal(budgetDecision.hardLimitTriggered, false);
  assert.equal(budgetDecision.softLimitTriggered, true);
  assert.equal(approvalRequest.requestType, "budget-exceeded");
});

test("usage budget guard escalates on partial summary", () => {
  const { budgetDecision, approvalRequest } = createUsageBudgetGuard({
    costSummary: buildCostSummary({
      totalEstimatedCost: null,
      summary: {
        totalCost: null,
        summaryStatus: "partial",
      },
    }),
    agentGovernancePolicy: buildPolicy(),
  });

  assert.equal(budgetDecision.decision, "requires-escalation");
  assert.equal(budgetDecision.requiresEscalation, true);
  assert.equal(budgetDecision.constraintSource, "policy-only");
  assert.equal(budgetDecision.softLimitTriggered, true);
  assert.equal(approvalRequest.requiredAction, "approve-budget");
});

test("usage budget guard blocks when session threshold is exceeded and policy blocks", () => {
  const { budgetDecision, approvalRequest } = createUsageBudgetGuard({
    costSummary: buildCostSummary({
      totalEstimatedCost: 12,
      summary: {
        totalCost: 12,
        summaryStatus: "complete",
      },
    }),
    agentGovernancePolicy: buildPolicy({
      escalationRules: {
        onSpendThresholdExceeded: "block",
      },
    }),
  });

  assert.equal(budgetDecision.decision, "blocked");
  assert.equal(budgetDecision.allowed, false);
  assert.equal(budgetDecision.source, "policy-thresholds");
  assert.equal(budgetDecision.hardLimitTriggered, true);
  assert.equal(budgetDecision.softLimitTriggered, false);
  assert.equal(approvalRequest, null);
});

test("usage budget guard uses per-action fallback when per-session is null", () => {
  const { budgetDecision } = createUsageBudgetGuard({
    costSummary: buildCostSummary({
      totalEstimatedCost: 7,
      summary: {
        totalCost: 7,
        summaryStatus: "complete",
      },
    }),
    agentGovernancePolicy: buildPolicy({
      spendThresholds: {
        perAction: 5,
        perSession: null,
        perDay: 50,
        currency: "usd",
      },
    }),
  });

  assert.equal(budgetDecision.decision, "requires-escalation");
  assert.equal(budgetDecision.softLimitTriggered, true);
  assert.equal(
    budgetDecision.budgetChecks.some((check) => check.checkType === "per-action" && check.status === "requires-escalation"),
    true,
  );
});

test("usage budget guard escalates on currency mismatch and drops currency", () => {
  const { budgetDecision } = createUsageBudgetGuard({
    costSummary: buildCostSummary({
      currency: null,
      currencyMismatch: true,
      summary: {
        totalCost: 4,
        summaryStatus: "complete",
      },
    }),
    agentGovernancePolicy: buildPolicy(),
  });

  assert.equal(budgetDecision.decision, "requires-escalation");
  assert.equal(budgetDecision.currency, null);
  assert.equal(budgetDecision.currencyMismatch, true);
  assert.equal(budgetDecision.softLimitTriggered, true);
});

test("usage budget guard calculates remaining budget deterministically", () => {
  const { budgetDecision, approvalRequest } = createUsageBudgetGuard({
    costSummary: buildCostSummary({
      totalEstimatedCost: 4,
      summary: {
        totalCost: 4,
        summaryStatus: "complete",
      },
    }),
    agentGovernancePolicy: buildPolicy(),
  });

  assert.equal(budgetDecision.remainingBudget, 6);
  assert.equal(approvalRequest, null);
  assert.equal(
    budgetDecision.budgetChecks.every((check) =>
      ["per-session", "currency"].includes(check.checkType) || check.checkType === "per-action"
    ),
    true,
  );
});

test("usage budget guard upgrades constraint source when pricing metadata is usable", () => {
  const { budgetDecision } = createUsageBudgetGuard({
    costSummary: buildCostSummary(),
    agentGovernancePolicy: buildPolicy(),
    workspaceModel: {
      workspaceId: "workspace-1",
      visibility: "organization",
    },
    pricingMetadata: {
      currency: "usd",
      pricingModel: "tiered",
      tier: "pro",
    },
  });

  assert.equal(budgetDecision.decision, "allowed");
  assert.equal(budgetDecision.source, "pricing+policy");
  assert.equal(budgetDecision.constraintSource, "pricing+policy");
  assert.equal(budgetDecision.hardLimitTriggered, false);
  assert.equal(budgetDecision.softLimitTriggered, false);
  assert.match(budgetDecision.summary, /Constraint mode: pricing\+policy\./);
});
