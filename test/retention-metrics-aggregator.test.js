import test from "node:test";
import assert from "node:assert/strict";

import { createRetentionMetricsAggregator } from "../src/core/retention-metrics-aggregator.js";

test("retention metrics aggregator summarizes narrow Wave 2 retention signals", () => {
  const { retentionSummary } = createRetentionMetricsAggregator({
    returningUserMetrics: [
      {
        userId: "user-1",
        sessionId: "session-2",
        previousSessionId: "session-1",
        currentLastSeenAt: "2026-01-09T10:00:00.000Z",
        previousLastSeenAt: "2026-01-02T10:00:00.000Z",
        isReturningUser: true,
      },
      {
        userId: "user-2",
        sessionId: "session-5",
        previousSessionId: null,
        currentLastSeenAt: "2026-01-09T12:00:00.000Z",
        previousLastSeenAt: null,
        isReturningUser: false,
      },
    ],
  });

  assert.deepEqual(retentionSummary, {
    totalReturningUsers: 1,
    totalNonReturningUsers: 1,
    repeatUsageCount: 1,
    byDay: {
      "2026-01-09": {
        totalReturningUsers: 1,
        totalNonReturningUsers: 1,
        repeatUsageCount: 1,
      },
    },
  });
});

test("retention metrics aggregator accepts a single returning user metric and excludes invalid day values", () => {
  const { retentionSummary } = createRetentionMetricsAggregator({
    returningUserMetric: {
      userId: "user-3",
      sessionId: "session-8",
      previousSessionId: "session-7",
      currentLastSeenAt: "not-a-date",
      previousLastSeenAt: null,
      isReturningUser: false,
    },
  });

  assert.deepEqual(retentionSummary, {
    totalReturningUsers: 0,
    totalNonReturningUsers: 1,
    repeatUsageCount: 1,
    byDay: {},
  });
});
