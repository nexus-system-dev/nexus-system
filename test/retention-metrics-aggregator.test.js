import test from "node:test";
import assert from "node:assert/strict";

import { createRetentionMetricsAggregator } from "../src/core/retention-metrics-aggregator.js";

test("retention metrics aggregator summarizes true retention from durable user session history", () => {
  const { retentionSummary } = createRetentionMetricsAggregator({
    projectId: "giftwallet",
    userSessionHistory: {
      userSessionHistoryId: "user-session-history:giftwallet",
      entries: [
        {
          userId: "user-1",
          sessionId: "session-2",
          previousSessionId: "session-1",
          lastSeenAt: "2026-01-09T10:00:00.000Z",
          previousLastSeenAt: "2026-01-02T10:00:00.000Z",
          isReturningUser: true,
        },
        {
          userId: "user-2",
          sessionId: "session-5",
          previousSessionId: null,
          lastSeenAt: "2026-01-09T12:00:00.000Z",
          previousLastSeenAt: null,
          isReturningUser: false,
        },
      ],
    },
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
    retentionMetricsId: "retention-metrics:giftwallet",
    status: "ready",
    totalSessions: 2,
    totalReturningUsers: 1,
    totalNonReturningUsers: 1,
    repeatUsageCount: 1,
    retentionRate: 50,
    byDay: {
      "2026-01-09": {
        totalReturningUsers: 1,
        totalNonReturningUsers: 1,
        repeatUsageCount: 1,
      },
    },
    byUser: {
      "user-1": {
        totalSessions: 1,
        returningSessions: 1,
        nonReturningSessions: 0,
        repeatUsageCount: 1,
        latestTimestamp: "2026-01-09T10:00:00.000Z",
      },
      "user-2": {
        totalSessions: 1,
        returningSessions: 0,
        nonReturningSessions: 1,
        repeatUsageCount: 0,
        latestTimestamp: "2026-01-09T12:00:00.000Z",
      },
    },
    source: "user-session-history:giftwallet",
  });
});

test("retention metrics aggregator accepts a single returning user metric and excludes invalid day values", () => {
  const { retentionSummary } = createRetentionMetricsAggregator({
    projectId: "giftwallet",
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
    retentionMetricsId: "retention-metrics:giftwallet",
    status: "ready",
    totalSessions: 1,
    totalReturningUsers: 0,
    totalNonReturningUsers: 1,
    repeatUsageCount: 1,
    retentionRate: 0,
    byDay: {},
    byUser: {
      "user-3": {
        totalSessions: 1,
        returningSessions: 0,
        nonReturningSessions: 1,
        repeatUsageCount: 1,
        latestTimestamp: null,
      },
    },
    source: "returning-user-metrics",
  });
});
