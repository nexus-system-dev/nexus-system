import test from "node:test";
import assert from "node:assert/strict";

import { createEmailNotificationDeliveryModule } from "../src/core/email-notification-delivery-module.js";

test("email notification delivery module queues email when recipient is available", () => {
  const { emailDeliveryResult } = createEmailNotificationDeliveryModule({
    notificationEvent: {
      notificationEventId: "notification-1",
      eventType: "approval-required",
      title: "Approval needed",
      projectId: "giftwallet",
      channels: ["in-app", "email"],
      userEmail: "owner@example.com",
    },
    deliveryPreferences: {
      priority: "high",
    },
  });

  assert.equal(emailDeliveryResult.deliveryStatus, "queued");
  assert.equal(emailDeliveryResult.recipient, "owner@example.com");
  assert.equal(emailDeliveryResult.templateId, "approval-request");
  assert.equal(emailDeliveryResult.metadata.priority, "high");
});

test("email notification delivery module suppresses email when disabled", () => {
  const { emailDeliveryResult } = createEmailNotificationDeliveryModule({
    notificationEvent: {
      notificationEventId: "notification-2",
      eventType: "failure",
      channels: ["email"],
    },
    deliveryPreferences: {
      emailEnabled: false,
      email: "owner@example.com",
    },
  });

  assert.equal(emailDeliveryResult.deliveryStatus, "suppressed");
  assert.equal(emailDeliveryResult.reason, "Email delivery disabled by preferences");
});
