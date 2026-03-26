import test from "node:test";
import assert from "node:assert/strict";

import { defineNotificationEventSchema } from "../src/core/notification-event-schema.js";

test("notification event schema returns canonical notification event", () => {
  const { notificationEvent } = defineNotificationEventSchema({
    eventType: "success",
    eventPayload: {
      status: "completed",
      message: "Task completed successfully",
      projectId: "giftwallet",
      taskId: "task-1",
    },
  });

  assert.equal(notificationEvent.eventType, "success");
  assert.equal(notificationEvent.status, "completed");
  assert.equal(notificationEvent.projectId, "giftwallet");
  assert.equal(notificationEvent.channels[0], "in-app");
});

test("notification event schema falls back to generic notification event", () => {
  const { notificationEvent } = defineNotificationEventSchema();

  assert.equal(notificationEvent.eventType, "generic-notification");
  assert.equal(notificationEvent.status, "pending");
  assert.equal(notificationEvent.message, "Notification event created");
});
