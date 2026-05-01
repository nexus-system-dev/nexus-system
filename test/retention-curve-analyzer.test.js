import test from "node:test";
import assert from "node:assert/strict";

import { createRetentionCurveAnalyzer } from "../src/core/retention-curve-analyzer.js";

test("retention curve analyzer builds ordered day curves and user curves from retention summary", () => {
  const { retentionCurveAnalysis } = createRetentionCurveAnalyzer({
    projectId: "giftwallet",
    retentionSummary: {
      status: "ready",
      byDay: {
        "2026-01-03": {
          totalReturningUsers: 2,
          totalNonReturningUsers: 2,
          repeatUsageCount: 1,
        },
        "2026-01-01": {
          totalReturningUsers: 1,
          totalNonReturningUsers: 3,
          repeatUsageCount: 1,
        },
      },
      byUser: {
        "user-1": {
          totalSessions: 3,
          returningSessions: 2,
          nonReturningSessions: 1,
          repeatUsageCount: 2,
          latestTimestamp: "2026-01-03T10:00:00.000Z",
        },
        "user-2": {
          totalSessions: 2,
          returningSessions: 0,
          nonReturningSessions: 2,
          repeatUsageCount: 0,
          latestTimestamp: "2026-01-02T10:00:00.000Z",
        },
      },
    },
  });

  assert.equal(retentionCurveAnalysis.status, "ready");
  assert.deepEqual(retentionCurveAnalysis.dayCurve, [
    {
      day: "2026-01-01",
      totalSessions: 4,
      returningUsers: 1,
      nonReturningUsers: 3,
      repeatUsageCount: 1,
      retentionRate: 25,
    },
    {
      day: "2026-01-03",
      totalSessions: 4,
      returningUsers: 2,
      nonReturningUsers: 2,
      repeatUsageCount: 1,
      retentionRate: 50,
    },
  ]);
  assert.deepEqual(retentionCurveAnalysis.userCurves, [
    {
      userId: "user-1",
      totalSessions: 3,
      returningSessions: 2,
      nonReturningSessions: 1,
      repeatUsageCount: 2,
      retentionRate: 67,
      latestTimestamp: "2026-01-03T10:00:00.000Z",
    },
    {
      userId: "user-2",
      totalSessions: 2,
      returningSessions: 0,
      nonReturningSessions: 2,
      repeatUsageCount: 0,
      retentionRate: 0,
      latestTimestamp: "2026-01-02T10:00:00.000Z",
    },
  ]);
  assert.equal(retentionCurveAnalysis.trend, "improving");
  assert.deepEqual(retentionCurveAnalysis.summary, {
    totalCurvePoints: 2,
    totalUsersTracked: 2,
    bestDay: "2026-01-03",
    worstDay: "2026-01-01",
  });
});

test("retention curve analyzer reports missing-inputs when retention summary is not ready", () => {
  const { retentionCurveAnalysis } = createRetentionCurveAnalyzer({
    projectId: "giftwallet",
    retentionSummary: null,
  });

  assert.equal(retentionCurveAnalysis.status, "missing-inputs");
  assert.deepEqual(retentionCurveAnalysis.dayCurve, []);
  assert.deepEqual(retentionCurveAnalysis.userCurves, []);
  assert.equal(retentionCurveAnalysis.trend, "stable");
});
