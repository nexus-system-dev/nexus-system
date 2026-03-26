import test from "node:test";
import assert from "node:assert/strict";

import { createWebhookExternalNotificationAdapter } from "../src/core/webhook-external-notification-adapter.js";

test("webhook external notification adapter queues webhook delivery when target exists", () => {
  const { externalDeliveryResult } = createWebhookExternalNotificationAdapter({
    notificationEvent: {
      notificationEventId: "notification-1",
      eventType: "failure",
      title: "Build failed",
      message: "The latest run failed",
      projectId: "giftwallet",
    },
    channelConfig: {
      channelType: "webhook",
      webhookUrl: "https://example.com/webhook",
      provider: "custom-webhook",
    },
  });

  assert.equal(externalDeliveryResult.deliveryStatus, "queued");
  assert.equal(externalDeliveryResult.deliveryChannel, "webhook");
  assert.equal(externalDeliveryResult.target, "https://example.com/webhook");
});

test("webhook external notification adapter reports missing target when config is incomplete", () => {
  const { externalDeliveryResult } = createWebhookExternalNotificationAdapter({
    notificationEvent: {
      notificationEventId: "notification-2",
      eventType: "security",
    },
    channelConfig: {
      channelType: "slack",
    },
  });

  assert.equal(externalDeliveryResult.deliveryStatus, "pending-target");
  assert.equal(externalDeliveryResult.reason, "Missing external channel target");
});
