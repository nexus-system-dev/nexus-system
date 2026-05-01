function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function buildCompanionMode({ notificationPreferences, approvalStatus }) {
  const normalizedNotificationPreferences = normalizeObject(notificationPreferences);
  const normalizedApprovalStatus = normalizeObject(approvalStatus);

  if (normalizedApprovalStatus.requiresApproval === true || normalizedApprovalStatus.status === "pending") {
    return "active";
  }

  if (normalizedNotificationPreferences.frequency === "digest") {
    return "quiet";
  }

  return "assistive";
}

function buildPreferences({ notificationPreferences, approvalRecords, approvalStatus }) {
  const normalizedNotificationPreferences = normalizeObject(notificationPreferences);
  const normalizedApprovalStatus = normalizeObject(approvalStatus);
  const normalizedApprovalRecords = normalizeArray(approvalRecords);
  const preferences = [];

  if (normalizedNotificationPreferences.frequency) {
    preferences.push({
      preferenceId: "baseline-notification-frequency",
      label: normalizedNotificationPreferences.frequency === "digest" ? "quiet-mode" : "assistive-mode",
      category: "notification-frequency",
      influence: `Notification cadence is set to ${normalizedNotificationPreferences.frequency}.`,
      source: "notification-preferences",
      strength: normalizedNotificationPreferences.frequency === "digest" ? "high" : "medium",
    });
  }

  if (normalizedApprovalStatus.requiresApproval === true || normalizedApprovalStatus.status === "pending") {
    preferences.push({
      preferenceId: "baseline-approval-awareness",
      label: "approval-aware",
      category: "approval-state",
      influence: normalizedApprovalStatus.reason
        ?? "The current project state still requires explicit approval handling.",
      source: "approval-status",
      strength: "high",
    });
  } else if (normalizedApprovalRecords.length > 0) {
    preferences.push({
      preferenceId: "baseline-approval-history",
      label: "approval-history",
      category: "approval-history",
      influence: `Recent approval history includes ${normalizedApprovalRecords.length} recorded decision${normalizedApprovalRecords.length === 1 ? "" : "s"}.`,
      source: "approval-records",
      strength: "medium",
    });
  }

  return preferences;
}

export function createBaselineUserPreferenceProfileAssembler({
  userIdentity = null,
  notificationPreferences = null,
  approvalRecords = null,
  approvalStatus = null,
} = {}) {
  const normalizedUserIdentity = normalizeObject(userIdentity);
  const normalizedNotificationPreferences = normalizeObject(notificationPreferences);
  const normalizedApprovalRecords = normalizeArray(approvalRecords);
  const normalizedApprovalStatus = normalizeObject(approvalStatus);
  const preferences = buildPreferences({
    notificationPreferences: normalizedNotificationPreferences,
    approvalRecords: normalizedApprovalRecords,
    approvalStatus: normalizedApprovalStatus,
  });
  const companionMode = buildCompanionMode({
    notificationPreferences: normalizedNotificationPreferences,
    approvalStatus: normalizedApprovalStatus,
  });

  return {
    userPreferenceProfile: {
      profileId: `baseline-user-preferences:${normalizedUserIdentity.userId ?? "anonymous"}`,
      userId: normalizedUserIdentity.userId ?? null,
      companionMode,
      preferences,
      summary: {
        totalPreferences: preferences.length,
        hasApprovalAwarePreference: preferences.some((preference) => preference.label === "approval-aware"),
        notificationFrequency: normalizedNotificationPreferences.frequency ?? "realtime",
      },
    },
  };
}
