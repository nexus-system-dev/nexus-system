import test from "node:test";
import assert from "node:assert/strict";

import { defineUserActivityEventSchema } from "../src/core/user-activity-event-schema.js";

test("user activity event schema preserves explicit activity type and session fields", () => {
  const { userActivityEvent } = defineUserActivityEventSchema({
    userId: "user-1",
    sessionId: "session-1",
    activityType: "workspace-navigation",
    projectId: "giftwallet",
    workspaceId: "workspace-1",
    workspaceArea: "developer-workspace",
    currentSurface: "project-brain",
    currentTask: "map-journey",
    timestamp: "2026-01-01T10:00:00.000Z",
  });

  assert.deepEqual(userActivityEvent, {
    userActivityEventId: "user-activity:user-1:session-1:2026-01-01T10:00:00.000Z",
    userId: "user-1",
    sessionId: "session-1",
    activityType: "workspace-navigation",
    projectId: "giftwallet",
    workspaceId: "workspace-1",
    workspaceArea: "developer-workspace",
    currentSurface: "project-brain",
    currentTask: "map-journey",
    timestamp: "2026-01-01T10:00:00.000Z",
  });
});

test("user activity event schema derives Wave 2 activity type from session status when explicit type is absent", () => {
  const { userActivityEvent } = defineUserActivityEventSchema({
    sessionMetric: {
      userId: "user-2",
      sessionId: "session-2",
      status: "active",
      projectId: "giftwallet",
      workspaceId: "workspace-2",
      workspaceArea: "release-workspace",
      currentSurface: "release-workspace",
      currentTask: "ship-build",
      lastSeenAt: "2026-01-02T09:30:00.000Z",
    },
  });

  assert.deepEqual(userActivityEvent, {
    userActivityEventId: "user-activity:user-2:session-2:2026-01-02T09:30:00.000Z",
    userId: "user-2",
    sessionId: "session-2",
    activityType: "session-active",
    projectId: "giftwallet",
    workspaceId: "workspace-2",
    workspaceArea: "release-workspace",
    currentSurface: "release-workspace",
    currentTask: "ship-build",
    timestamp: "2026-01-02T09:30:00.000Z",
  });
});
