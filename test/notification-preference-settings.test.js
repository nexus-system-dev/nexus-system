import test from "node:test";
import assert from "node:assert/strict";

import { createNotificationPreferenceSettings } from "../src/core/notification-preference-settings.js";

test("notification preference settings return canonical user preferences", () => {
  const { notificationPreferences } = createNotificationPreferenceSettings({
    userIdentity: {
      userId: "user-1",
    },
    preferenceInput: {
      channels: ["in-app", "email", "email"],
      eventTypes: ["failure", "security"],
      frequency: "digest",
      digestEnabled: true,
      subjectPrefix: "[Nexus]",
    },
  });

  assert.equal(notificationPreferences.userId, "user-1");
  assert.deepEqual(notificationPreferences.channels, ["in-app", "email"]);
  assert.deepEqual(notificationPreferences.eventTypes, ["failure", "security"]);
  assert.equal(notificationPreferences.frequency, "digest");
  assert.equal(notificationPreferences.digestEnabled, true);
});

test("notification preference settings fall back to realtime defaults", () => {
  const { notificationPreferences } = createNotificationPreferenceSettings();

  assert.equal(notificationPreferences.frequency, "realtime");
  assert.equal(notificationPreferences.emailEnabled, true);
  assert.equal(notificationPreferences.inAppEnabled, true);
});
