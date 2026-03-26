function normalizeUserIdentity(userIdentity) {
  return userIdentity && typeof userIdentity === "object" ? userIdentity : {};
}

function normalizePreferenceInput(preferenceInput) {
  return preferenceInput && typeof preferenceInput === "object" ? preferenceInput : {};
}

function normalizeChannels(preferenceInput) {
  if (Array.isArray(preferenceInput.channels) && preferenceInput.channels.length > 0) {
    return [...new Set(preferenceInput.channels.filter((item) => typeof item === "string" && item.trim()))];
  }

  return ["in-app", "email"];
}

function normalizeEventTypes(preferenceInput) {
  if (Array.isArray(preferenceInput.eventTypes) && preferenceInput.eventTypes.length > 0) {
    return [...new Set(preferenceInput.eventTypes.filter((item) => typeof item === "string" && item.trim()))];
  }

  return ["approval-required", "failure", "invite", "security", "success"];
}

export function createNotificationPreferenceSettings({
  userIdentity = null,
  preferenceInput = null,
} = {}) {
  const normalizedUserIdentity = normalizeUserIdentity(userIdentity);
  const normalizedPreferenceInput = normalizePreferenceInput(preferenceInput);
  const channels = normalizeChannels(normalizedPreferenceInput);
  const eventTypes = normalizeEventTypes(normalizedPreferenceInput);

  return {
    notificationPreferences: {
      userId: normalizedUserIdentity.userId ?? null,
      channels,
      eventTypes,
      frequency: normalizedPreferenceInput.frequency ?? "realtime",
      emailEnabled: normalizedPreferenceInput.emailEnabled ?? channels.includes("email"),
      inAppEnabled: normalizedPreferenceInput.inAppEnabled ?? channels.includes("in-app"),
      quietHours: normalizedPreferenceInput.quietHours ?? null,
      digestEnabled: normalizedPreferenceInput.digestEnabled ?? false,
      subjectPrefix: normalizedPreferenceInput.subjectPrefix ?? "Nexus",
    },
  };
}
