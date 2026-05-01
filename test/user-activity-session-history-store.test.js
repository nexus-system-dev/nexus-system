import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  createPersistentUserActivitySessionHistoryStore,
  createUserActivitySessionHistoryStore,
} from "../src/core/user-activity-session-history-store.js";

test("user activity/session history store deduplicates replayed signals and merges returning metadata", () => {
  const store = createUserActivitySessionHistoryStore();

  store.recordSignals({
    projectId: "giftwallet",
    userActivityEvent: {
      userActivityEventId: "user-activity:user-1:session-2:2026-02-10T10:00:00.000Z",
      userId: "user-1",
      sessionId: "session-2",
      activityType: "session-active",
      projectId: "giftwallet",
      workspaceId: "workspace-1",
      workspaceArea: "developer-workspace",
      currentSurface: "developer-workspace",
      currentTask: "growth",
      timestamp: "2026-02-10T10:00:00.000Z",
    },
    userSessionMetric: {
      userId: "user-1",
      sessionId: "session-2",
      status: "active",
      workspaceId: "workspace-1",
      projectId: "giftwallet",
      workspaceArea: "developer-workspace",
      currentSurface: "developer-workspace",
      currentTask: "growth",
      lastSeenAt: "2026-02-10T10:00:00.000Z",
      totalSessions: 2,
      isReturningUser: true,
      activeSessionCount: 1,
      activeUsers: [],
    },
    returningUserMetric: {
      returningUserMetricId: "returning-user:user-1:session-2:2026-02-10T10:00:00.000Z",
      userId: "user-1",
      sessionId: "session-2",
      previousSessionId: "session-1",
      currentLastSeenAt: "2026-02-10T10:00:00.000Z",
      previousLastSeenAt: "2026-02-01T10:00:00.000Z",
      isReturningUser: true,
    },
  });

  store.recordSignals({
    projectId: "giftwallet",
    userActivityEvent: {
      userActivityEventId: "user-activity:user-1:session-2:2026-02-10T10:00:00.000Z",
      userId: "user-1",
      sessionId: "session-2",
      timestamp: "2026-02-10T10:00:00.000Z",
    },
    userSessionMetric: {
      userId: "user-1",
      sessionId: "session-2",
      lastSeenAt: "2026-02-10T10:00:00.000Z",
    },
    returningUserMetric: {
      returningUserMetricId: "returning-user:user-1:session-2:2026-02-10T10:00:00.000Z",
      userId: "user-1",
      sessionId: "session-2",
      currentLastSeenAt: "2026-02-10T10:00:00.000Z",
      isReturningUser: true,
    },
  });

  const history = store.readProjectHistory("giftwallet");
  assert.equal(history.userActivityHistory.totalEvents, 1);
  assert.equal(history.userSessionHistory.totalEntries, 1);
  assert.equal(history.userSessionHistory.totalReturningSignals, 1);
  assert.equal(history.userSessionHistory.entries[0].isReturningUser, true);
  assert.equal(history.userSessionHistory.entries[0].previousSessionId, "session-1");
});

test("user activity/session history store survives restart continuity", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-user-history-store-"));
  const filePath = path.join(directory, "user-activity-session-history.ndjson");

  const firstStore = createPersistentUserActivitySessionHistoryStore({ filePath });
  firstStore.recordSignals({
    projectId: "giftwallet",
    userActivityEvent: {
      userActivityEventId: "user-activity:user-1:session-1:2026-02-01T10:00:00.000Z",
      userId: "user-1",
      sessionId: "session-1",
      timestamp: "2026-02-01T10:00:00.000Z",
      activityType: "session-active",
    },
    userSessionMetric: {
      userId: "user-1",
      sessionId: "session-1",
      lastSeenAt: "2026-02-01T10:00:00.000Z",
      totalSessions: 1,
      isReturningUser: false,
    },
    returningUserMetric: {
      returningUserMetricId: "returning-user:user-1:session-1:2026-02-01T10:00:00.000Z",
      userId: "user-1",
      sessionId: "session-1",
      currentLastSeenAt: "2026-02-01T10:00:00.000Z",
      isReturningUser: false,
    },
  });

  const restartedStore = createPersistentUserActivitySessionHistoryStore({ filePath });
  const history = restartedStore.readProjectHistory("giftwallet");
  assert.equal(history.userActivityHistory.totalEvents, 1);
  assert.equal(history.userSessionHistory.totalEntries, 1);
  assert.equal(history.userSessionHistory.entries[0].sessionId, "session-1");
});
