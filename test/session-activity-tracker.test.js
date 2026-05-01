import test from "node:test";
import assert from "node:assert/strict";

import { createSessionActivityTracker } from "../src/core/session-activity-tracker.js";

test("session activity tracker increments total sessions for a returning user with a new session", () => {
  const { userSessionMetric } = createSessionActivityTracker({
    userActivityEvent: {
      userId: "user-1",
      sessionId: "session-2",
      activityType: "session-active",
      projectId: "giftwallet",
      workspaceId: "workspace-1",
      workspaceArea: "developer-workspace",
      currentSurface: "developer-workspace",
      currentTask: "review deploy",
      timestamp: "2026-01-02T10:00:00.000Z",
    },
    previousUserSessionMetric: {
      userId: "user-1",
      sessionId: "session-1",
      totalSessions: 1,
      activeUsers: [
        { userId: "user-1", sessionId: "session-2", status: "active", lastSeenAt: "2026-01-02T10:00:00.000Z" },
      ],
    },
  });

  assert.deepEqual(userSessionMetric, {
    userId: "user-1",
    sessionId: "session-2",
    status: "active",
    workspaceId: "workspace-1",
    projectId: "giftwallet",
    workspaceArea: "developer-workspace",
    currentSurface: "developer-workspace",
    currentTask: "review deploy",
    lastSeenAt: "2026-01-02T10:00:00.000Z",
    totalSessions: 2,
    isReturningUser: true,
    activeSessionCount: 1,
    activeUsers: [
      { userId: "user-1", sessionId: "session-2", status: "active", lastSeenAt: "2026-01-02T10:00:00.000Z" },
    ],
  });
});

test("session activity tracker keeps total sessions stable for repeated events in the same session", () => {
  const { userSessionMetric } = createSessionActivityTracker({
    userActivityEvent: {
      userId: "user-1",
      sessionId: "session-1",
      activityType: "session-idle",
      timestamp: "2026-01-02T10:05:00.000Z",
    },
    previousUserSessionMetric: {
      userId: "user-1",
      sessionId: "session-1",
      status: "active",
      totalSessions: 1,
    },
  });

  assert.equal(userSessionMetric.totalSessions, 1);
  assert.equal(userSessionMetric.isReturningUser, false);
  assert.equal(userSessionMetric.status, "idle");
  assert.equal(userSessionMetric.activeSessionCount, 0);
});
