import { test } from "node:test";
import assert from "node:assert/strict";
import { createAnalyticsApi } from "../src/core/analytics-api.js";

test("createAnalyticsApi returns valid api for empty input", () => {
  const { analyticsApi, analyticsPayload } = createAnalyticsApi({});
  assert.ok(analyticsApi.apiId);
  assert.equal(analyticsApi.endpointCount, 6);
  assert.ok(analyticsPayload.payloadId);
});

test("createAnalyticsApi includes all standard endpoints", () => {
  const { analyticsApi } = createAnalyticsApi({});
  const paths = analyticsApi.endpoints.map((e) => e.path);
  assert.ok(paths.includes("/analytics/summary"));
  assert.ok(paths.includes("/analytics/projects"));
  assert.ok(paths.includes("/analytics/retention"));
  assert.ok(paths.includes("/analytics/revenue"));
});

test("createAnalyticsApi embeds analytics summary in payload", () => {
  const { analyticsPayload } = createAnalyticsApi({
    analyticsSummary: { summaryId: "s-1", totalProjectsCreated: 5 },
    timeRange: { granularity: "monthly" },
  });
  assert.equal(analyticsPayload.summary.totalProjectsCreated, 5);
  assert.equal(analyticsPayload.timeRange.granularity, "monthly");
});
