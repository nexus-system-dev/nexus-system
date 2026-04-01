import test from "node:test";
import assert from "node:assert/strict";

import { createCostVisibilityApiModel } from "../src/core/cost-visibility-api-model.js";

function buildCostSummary(overrides = {}) {
  return {
    costSummaryId: "cost-summary:giftwallet",
    breakdown: {
      model: {
        quantity: 100,
        unit: "token",
        totalCost: 1,
        source: "manual",
      },
      workspace: {
        quantity: 2,
        unit: "workspace-minute",
        totalCost: 3,
        source: "platform-observability",
      },
      storage: {
        quantity: 2,
        unit: "gb-month",
        totalCost: 4,
        source: "file-artifact-storage-module",
      },
      build: {
        quantity: null,
        unit: "build-minute",
        totalCost: null,
        source: null,
      },
      providerOperation: {
        quantity: 1,
        unit: "operation",
        totalCost: 5,
        source: "manual",
      },
    },
    groupedByScope: {
      byProject: { giftwallet: 13 },
      byUser: { "user-1": 1 },
      byWorkspace: { "workspace-1": 7 },
    },
    totalEstimatedCost: 13,
    currency: "usd",
    currencyMismatch: false,
    period: {
      earliest: "2025-01-01T00:00:00.000Z",
      latest: "2025-01-01T03:00:00.000Z",
    },
    summary: {
      totalCost: 13,
      dimensionsWithCost: 4,
      dimensionsMissingCost: 1,
      totalDimensions: 5,
      hasBuildCost: false,
      hasProviderCost: true,
      summaryStatus: "complete",
      scopeCount: 3,
    },
    ...overrides,
  };
}

function buildBudgetDecision(overrides = {}) {
  return {
    decision: "allowed",
    allowed: true,
    remainingBudget: 12,
    currency: "usd",
    perSessionLimit: 25,
    reason: null,
    ...overrides,
  };
}

test("cost visibility api model returns null outputs when cost summary is missing", () => {
  const result = createCostVisibilityApiModel({
    costSummary: null,
    budgetDecision: null,
  });

  assert.equal(result.costVisibilityPayload, null);
  assert.equal(result.costDashboardModel, null);
});

test("cost visibility api model preserves breakdown and computes pct", () => {
  const { costVisibilityPayload } = createCostVisibilityApiModel({
    costSummary: buildCostSummary(),
    budgetDecision: buildBudgetDecision(),
  });

  assert.equal(costVisibilityPayload.breakdown.length, 5);
  assert.equal(costVisibilityPayload.breakdown[0].dimension, "model");
  assert.equal(costVisibilityPayload.breakdown[0].pct, 1 / 13);
  assert.equal(costVisibilityPayload.breakdown[3].pct, null);
});

test("cost visibility api model builds unsliced top cost drivers sorted by cost", () => {
  const { costVisibilityPayload } = createCostVisibilityApiModel({
    costSummary: buildCostSummary(),
    budgetDecision: buildBudgetDecision(),
  });

  assert.equal(costVisibilityPayload.topCostDrivers.length, 4);
  assert.deepEqual(
    costVisibilityPayload.topCostDrivers.map((entry) => [entry.rank, entry.dimension, entry.totalCost]),
    [
      [1, "providerOperation", 5],
      [2, "storage", 4],
      [3, "workspace", 3],
      [4, "model", 1],
    ],
  );
});

test("cost visibility api model handles missing budget decision safely", () => {
  const { costVisibilityPayload, costDashboardModel } = createCostVisibilityApiModel({
    costSummary: buildCostSummary(),
    budgetDecision: null,
  });

  assert.equal(costVisibilityPayload.budgetStatus.status, "unknown");
  assert.equal(costVisibilityPayload.budgetStatus.allowed, null);
  assert.equal(costVisibilityPayload.budgetStatus.hasWarning, false);
  assert.equal(costDashboardModel.alertBanner, null);
});

test("cost visibility api model creates alert banner when budget has warning", () => {
  const { costDashboardModel } = createCostVisibilityApiModel({
    costSummary: buildCostSummary(),
    budgetDecision: buildBudgetDecision({
      decision: "requires-escalation",
      allowed: false,
      reason: "Budget threshold exceeded",
    }),
  });

  assert.equal(costDashboardModel.alertBanner.componentType, "status-chip");
  assert.equal(costDashboardModel.alertBanner.status, "requires-escalation");
  assert.equal(costDashboardModel.alertBanner.message, "Budget threshold exceeded");
});

test("cost visibility api model keeps pct null when total cost is null", () => {
  const { costVisibilityPayload } = createCostVisibilityApiModel({
    costSummary: buildCostSummary({
      totalEstimatedCost: null,
      summary: {
        totalCost: null,
        summaryStatus: "partial",
      },
    }),
    budgetDecision: buildBudgetDecision(),
  });

  assert.equal(costVisibilityPayload.breakdown.every((entry) => entry.pct === null), true);
});

test("cost visibility api model preserves empty breakdown and safe defaults", () => {
  const { costVisibilityPayload, costDashboardModel } = createCostVisibilityApiModel({
    costSummary: buildCostSummary({
      breakdown: {},
      groupedByScope: {},
      period: {},
      totalEstimatedCost: null,
      currency: null,
      summary: {
        totalCost: null,
        summaryStatus: "partial",
      },
    }),
    budgetDecision: null,
  });

  assert.deepEqual(costVisibilityPayload.breakdown, []);
  assert.deepEqual(costVisibilityPayload.topCostDrivers, []);
  assert.equal(costVisibilityPayload.groupedByScope, null);
  assert.equal(costVisibilityPayload.period, null);
  assert.equal(costDashboardModel.breakdownTable.rows.length, 0);
});

test("cost visibility api model passes through grouped scope totals and period", () => {
  const { costVisibilityPayload } = createCostVisibilityApiModel({
    costSummary: buildCostSummary(),
    budgetDecision: buildBudgetDecision(),
  });

  assert.deepEqual(costVisibilityPayload.groupedByScope, {
    byProject: { giftwallet: 13 },
    byUser: { "user-1": 1 },
    byWorkspace: { "workspace-1": 7 },
  });
  assert.deepEqual(costVisibilityPayload.period, {
    earliest: "2025-01-01T00:00:00.000Z",
    latest: "2025-01-01T03:00:00.000Z",
  });
});

test("cost visibility api model tolerates currency mismatch without crashing", () => {
  const { costVisibilityPayload, costDashboardModel } = createCostVisibilityApiModel({
    costSummary: buildCostSummary({
      totalEstimatedCost: null,
      currency: null,
      currencyMismatch: true,
      summary: {
        totalCost: null,
        summaryStatus: "partial",
      },
    }),
    budgetDecision: buildBudgetDecision({
      decision: "requires-escalation",
      allowed: false,
      currency: null,
      reason: null,
    }),
  });

  assert.equal(costVisibilityPayload.currency, null);
  assert.equal(costVisibilityPayload.summaryStatus, "partial");
  assert.equal(costVisibilityPayload.breakdown.every((entry) => entry.pct === null), true);
  assert.equal(costDashboardModel.alertBanner?.message, "Budget issue detected");
});
