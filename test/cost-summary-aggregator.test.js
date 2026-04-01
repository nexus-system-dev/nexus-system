import test from "node:test";
import assert from "node:assert/strict";

import { createCostSummaryAggregator } from "../src/core/cost-summary-aggregator.js";

function buildAiMetric(overrides = {}) {
  return {
    usageType: "model",
    quantity: 100,
    unit: "token",
    totalCost: 1,
    source: "manual",
    currency: "usd",
    recordedAt: "2025-01-01T00:00:00.000Z",
    projectScope: { projectId: "giftwallet" },
    userScope: { userId: "user-1" },
    workflowScope: { workflowId: "wf-1" },
    ...overrides,
  };
}

function buildWorkspaceMetric(overrides = {}) {
  return {
    usageType: "workspace",
    quantity: 2,
    unit: "workspace-minute",
    totalCost: 3,
    source: "platform-observability",
    currency: "usd",
    recordedAt: "2025-01-01T01:00:00.000Z",
    projectId: "giftwallet",
    workspaceId: "workspace-1",
    ...overrides,
  };
}

function buildStorageMetric(overrides = {}) {
  return {
    usageType: "storage",
    quantity: 2,
    unit: "gb-month",
    totalCost: 4,
    source: "file-artifact-storage-module",
    currency: "usd",
    recordedAt: "2025-01-01T02:00:00.000Z",
    projectId: "giftwallet",
    workspaceId: "workspace-1",
    ...overrides,
  };
}

function buildProviderMetric(overrides = {}) {
  return {
    usageType: "provider-operation",
    quantity: 1,
    unit: "operation",
    totalCost: 5,
    sourceType: "manual",
    currency: "usd",
    recordedAt: "2025-01-01T03:00:00.000Z",
    scopeType: "project",
    scopeId: "giftwallet",
    ...overrides,
  };
}

test("cost summary aggregator returns complete when all core dimensions have totalCost", () => {
  const { costSummary } = createCostSummaryAggregator({
    aiUsageMetric: buildAiMetric(),
    workspaceComputeMetric: buildWorkspaceMetric(),
    storageCostMetric: buildStorageMetric(),
  });

  assert.equal(costSummary.summary.summaryStatus, "complete");
  assert.equal(costSummary.totalEstimatedCost, 8);
  assert.equal(costSummary.currency, "usd");
  assert.equal(costSummary.currencyMismatch, false);
  assert.equal(costSummary.summary.hasBuildCost, false);
  assert.equal(costSummary.summary.hasProviderCost, false);
});

test("cost summary aggregator returns partial when a core metric is missing or missing cost", () => {
  const { costSummary } = createCostSummaryAggregator({
    aiUsageMetric: buildAiMetric(),
    workspaceComputeMetric: buildWorkspaceMetric({ totalCost: null }),
    storageCostMetric: null,
  });

  assert.equal(costSummary.summary.summaryStatus, "partial");
  assert.equal(costSummary.breakdown.workspace.totalCost, null);
  assert.equal(costSummary.breakdown.build.unit, "build-minute");
  assert.equal(costSummary.breakdown.build.totalCost, null);
});

test("cost summary aggregator returns missing-inputs when all core metrics are absent", () => {
  const { costSummary } = createCostSummaryAggregator();

  assert.equal(costSummary.summary.summaryStatus, "missing-inputs");
  assert.equal(costSummary.totalEstimatedCost, 0);
  assert.equal(costSummary.currency, "usd");
});

test("cost summary aggregator uses provider cost only from platform cost metric", () => {
  const { costSummary } = createCostSummaryAggregator({
    platformCostMetric: buildProviderMetric(),
    aiUsageMetric: buildAiMetric({
      usageType: "provider-operation",
      totalCost: 999,
    }),
    workspaceComputeMetric: buildWorkspaceMetric(),
    storageCostMetric: buildStorageMetric(),
  });

  assert.equal(costSummary.breakdown.providerOperation.totalCost, 5);
  assert.equal(costSummary.summary.hasProviderCost, true);
});

test("cost summary aggregator marks currency mismatch and drops totalEstimatedCost", () => {
  const { costSummary } = createCostSummaryAggregator({
    aiUsageMetric: buildAiMetric({ currency: "usd" }),
    workspaceComputeMetric: buildWorkspaceMetric({ currency: "eur" }),
    storageCostMetric: buildStorageMetric({ currency: "usd" }),
  });

  assert.equal(costSummary.currencyMismatch, true);
  assert.equal(costSummary.currency, null);
  assert.equal(costSummary.totalEstimatedCost, null);
  assert.equal(costSummary.summary.summaryStatus, "partial");
});

test("cost summary aggregator groups totals by scope and resolves period", () => {
  const { costSummary } = createCostSummaryAggregator({
    aiUsageMetric: buildAiMetric(),
    workspaceComputeMetric: buildWorkspaceMetric(),
    storageCostMetric: buildStorageMetric(),
    platformCostMetric: buildProviderMetric(),
  });

  assert.equal(costSummary.groupedByScope.byProject.giftwallet, 13);
  assert.equal(costSummary.groupedByScope.byUser["user-1"], 1);
  assert.equal(costSummary.groupedByScope.byWorkspace["workspace-1"], 7);
  assert.equal(costSummary.period.earliest, "2025-01-01T00:00:00.000Z");
  assert.equal(costSummary.period.latest, "2025-01-01T03:00:00.000Z");
});
