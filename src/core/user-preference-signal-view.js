function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function inferSignalTone(strength) {
  if (strength === "high") {
    return "stable";
  }
  if (strength === "medium") {
    return "emerging";
  }
  return "tentative";
}

function buildProfileSignals(userPreferenceProfile) {
  const normalizedProfile = normalizeObject(userPreferenceProfile);
  const preferences = normalizeArray(normalizedProfile.preferences);

  return preferences.map((preference, index) => {
    const normalizedPreference = normalizeObject(preference);
    const strength = normalizeString(normalizedPreference.strength) ?? "medium";

    return {
      signalId: normalizeString(normalizedPreference.preferenceId) ?? `user-preference-${index + 1}`,
      label:
        normalizeString(normalizedPreference.label)
        ?? normalizeString(normalizedPreference.category)
        ?? `Preference ${index + 1}`,
      influence: normalizeString(normalizedPreference.influence) ?? normalizeString(normalizedPreference.reason),
      source: normalizeString(normalizedPreference.source) ?? "user-preference-profile",
      strength,
      tone: inferSignalTone(strength),
    };
  });
}

function buildApprovalSignals(approvalFeedbackMemory) {
  const feedbackItems = normalizeArray(approvalFeedbackMemory);

  return feedbackItems.map((feedback, index) => {
    const normalizedFeedback = normalizeObject(feedback);
    const status = normalizeString(normalizedFeedback.status) ?? "unknown";
    const strength = status === "approved"
      ? "high"
      : status === "rejected"
        ? "medium"
        : "low";

    return {
      signalId: normalizeString(normalizedFeedback.approvalRecordId) ?? `approval-feedback-${index + 1}`,
      label: normalizeString(normalizedFeedback.actionType)
        ? `Past ${normalizeString(normalizedFeedback.actionType)} decision`
        : `Approval feedback ${index + 1}`,
      influence: normalizeString(normalizedFeedback.summary)
        ?? normalizeString(normalizedFeedback.reason)
        ?? `Recent ${status} approval feedback is still shaping the current recommendation.`,
      source: "approval-feedback-memory",
      strength,
      tone: inferSignalTone(strength),
    };
  });
}

export function createUserPreferenceSignalView({
  userPreferenceProfile = null,
  approvalFeedbackMemory = null,
} = {}) {
  const normalizedProfile = normalizeObject(userPreferenceProfile);
  const profileSignals = buildProfileSignals(normalizedProfile);
  const approvalSignals = buildApprovalSignals(approvalFeedbackMemory);
  const signals = [...profileSignals, ...approvalSignals];

  return {
    userPreferenceSignals: {
      signalViewId: `user-preference-signals:${normalizeString(normalizedProfile.profileId) ?? "nexus"}`,
      signals,
      summary: {
        totalSignals: signals.length,
        profileSignals: profileSignals.length,
        approvalSignals: approvalSignals.length,
        hasStablePreference: signals.some((signal) => signal.strength === "high"),
      },
    },
  };
}
