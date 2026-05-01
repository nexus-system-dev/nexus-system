function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function resolveState({ learningInsights, decisionIntelligence, notificationPayload }) {
  const insights = normalizeArray(learningInsights.items);
  const decisionSummary = normalizeObject(decisionIntelligence.summary);
  const notificationType = normalizeString(notificationPayload.type, "unknown").toLowerCase();
  const notificationStatus = normalizeString(notificationPayload.status, null);

  if (notificationType === "failure" || notificationPayload.requiresApproval === true) {
    return "warning";
  }

  if (decisionSummary.requiresApproval) {
    return "warning";
  }

  if (insights.length > 0) {
    return "recommending";
  }

  if (decisionSummary.hasUncertainty || notificationStatus === "unknown") {
    return "analyzing";
  }

  if (notificationType === "success") {
    return "waiting";
  }

  return "observing";
}

function buildReasons({ state, learningInsights, decisionIntelligence, notificationPayload }) {
  const reasons = [];
  const insights = normalizeArray(learningInsights.items);
  const decisionSummary = normalizeObject(decisionIntelligence.summary);
  const notificationMessage = normalizeString(
    notificationPayload.message,
    "Execution requires attention before the AI companion can continue.",
  );
  const learningSummary = normalizeString(
    learningInsights.summary,
    "Learning insights are strong enough to support a recommendation.",
  );

  if (state === "warning") {
    reasons.push(notificationMessage);
  }

  if (state === "recommending") {
    reasons.push(learningSummary);
  }

  if (state === "analyzing") {
    reasons.push("The system still sees uncertainty and is analyzing before it recommends a move.");
  }

  if (decisionSummary.canAutoExecute) {
    reasons.push("Execution can continue automatically once the current recommendation is accepted.");
  }

  if (insights.length === 0 && reasons.length === 0) {
    reasons.push("The AI companion is watching the workspace without interrupting.");
  }

  return reasons;
}

function buildSummary({ state, learningInsights, decisionIntelligence, notificationPayload }) {
  const insights = normalizeArray(learningInsights.items);
  const decisionSummary = normalizeObject(decisionIntelligence.summary);
  const notificationType = normalizeString(notificationPayload.type, "unknown").toLowerCase();

  return {
    state,
    insightCount: insights.length,
    hasRecommendations: state === "recommending",
    requiresAttention: state === "warning",
    isPassive: state === "observing" || state === "waiting",
    canAutoExecute: decisionSummary.canAutoExecute === true,
    hasUncertainty: decisionSummary.hasUncertainty === true,
    latestNotificationType: notificationType,
  };
}

export function createCompanionStateModel({
  learningInsights = null,
  decisionIntelligence = null,
  notificationPayload = null,
} = {}) {
  const normalizedLearningInsights = normalizeObject(learningInsights);
  const normalizedDecisionIntelligence = normalizeObject(decisionIntelligence);
  const normalizedNotificationPayload = normalizeObject(notificationPayload);
  const state = resolveState({
    learningInsights: normalizedLearningInsights,
    decisionIntelligence: normalizedDecisionIntelligence,
    notificationPayload: normalizedNotificationPayload,
  });

  return {
    companionState: {
      stateId: `companion-state:${normalizeString(normalizedNotificationPayload.taskId, "project")}`,
      state,
      mode: state,
      reasons: buildReasons({
        state,
        learningInsights: normalizedLearningInsights,
        decisionIntelligence: normalizedDecisionIntelligence,
        notificationPayload: normalizedNotificationPayload,
      }),
      sourceSignals: {
        insightCount: normalizeArray(normalizedLearningInsights.items).length,
        requiresApproval: normalizedDecisionIntelligence.summary?.requiresApproval === true,
        hasUncertainty: normalizedDecisionIntelligence.summary?.hasUncertainty === true,
        notificationType: normalizeString(normalizedNotificationPayload.type, "unknown").toLowerCase(),
      },
      summary: buildSummary({
        state,
        learningInsights: normalizedLearningInsights,
        decisionIntelligence: normalizedDecisionIntelligence,
        notificationPayload: normalizedNotificationPayload,
      }),
    },
  };
}
