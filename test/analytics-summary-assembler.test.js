import { test } from "node:test";
import assert from "node:assert/strict";
import { createAnalyticsSummaryAssembler } from "../src/core/analytics-summary-assembler.js";

test("createAnalyticsSummaryAssembler returns valid summary for empty input", () => {
  const { analyticsSummary } = createAnalyticsSummaryAssembler({});
  assert.ok(analyticsSummary.summaryId);
  assert.equal(analyticsSummary.sourcesProvided, 0);
  assert.equal(analyticsSummary.meta.isComplete, false);
});

test("createAnalyticsSummaryAssembler aggregates all five sources", () => {
  const { analyticsSummary } = createAnalyticsSummaryAssembler({
    projectCreationSummary: { totalProjectsCreated: 10 },
    taskThroughputSummary: { totalTasksCompleted: 50 },
    productivitySummary: { totalTimeSavedMs: 3600000 },
    retentionSummary: { totalReturningUsers: 30 },
    revenueSummary: { totalRevenue: 5000 },
  });
  assert.equal(analyticsSummary.totalProjectsCreated, 10);
  assert.equal(analyticsSummary.totalTasksCompleted, 50);
  assert.equal(analyticsSummary.totalTimeSavedMs, 3600000);
  assert.equal(analyticsSummary.totalReturningUsers, 30);
  assert.equal(analyticsSummary.totalRevenue, 5000);
  assert.equal(analyticsSummary.sourcesProvided, 5);
  assert.equal(analyticsSummary.meta.isComplete, true);
});
