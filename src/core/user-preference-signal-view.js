function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
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
    const strength = normalizedPreference.strength ?? "medium";

    return {
      signalId: normalizedPreference.preferenceId ?? `user-preference-${index + 1}`,
      label: normalizedPreference.label ?? normalizedPreference.category ?? `Preference ${index + 1}`,
      influence: normalizedPreference.influence ?? normalizedPreference.reason ?? null,
      source: normalizedPreference.source ?? "user-preference-profile",
      strength,
      tone: inferSignalTone(strength),
    };
  });
}

function buildApprovalSignals(approvalFeedbackMemory) {
  const feedbackItems = normalizeArray(approvalFeedbackMemory);

  return feedbackItems.map((feedback, index) => {
    const normalizedFeedback = normalizeObject(feedback);
    const status = normalizedFeedback.status ?? "unknown";
    const strength = status === "approved"
      ? "high"
      : status === "rejected"
        ? "medium"
        : "low";

    return {
      signalId: normalizedFeedback.approvalRecordId ?? `approval-feedback-${index + 1}`,
      label: normalizedFeedback.actionType
        ? `Past ${normalizedFeedback.actionType} decision`
        : `Approval feedback ${index + 1}`,
      influence: normalizedFeedback.summary
        ?? normalizedFeedback.reason
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
      signalViewId: `user-preference-signals:${normalizedProfile.profileId ?? "nexus"}`,
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
