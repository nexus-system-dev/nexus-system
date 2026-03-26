import test from "node:test";
import assert from "node:assert/strict";

import { createInAppNotificationCenter } from "../src/core/in-app-notification-center.js";

test("in-app notification center returns inbox state for notification event", () => {
  const { notificationCenterState } = createInAppNotificationCenter({
    notificationEvent: {
      notificationEventId: "notification-1",
      eventType: "success",
      title: "Build complete",
      message: "The task completed successfully",
      nextAction: "continue",
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    userIdentity: {
      userId: "user-1",
    },
  });

  assert.equal(notificationCenterState.userId, "user-1");
  assert.equal(notificationCenterState.unreadCount, 1);
  assert.equal(notificationCenterState.inbox[0].actionLinks[0], "continue");
});

test("in-app notification center returns empty inbox when no event exists", () => {
  const { notificationCenterState } = createInAppNotificationCenter();

  assert.equal(notificationCenterState.unreadCount, 0);
  assert.equal(notificationCenterState.inbox.length, 0);
});
