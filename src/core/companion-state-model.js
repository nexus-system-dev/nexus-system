function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveState({ learningInsights, decisionIntelligence, notificationPayload }) {
  const insights = normalizeArray(learningInsights.items);
  const decisionSummary = normalizeObject(decisionIntelligence.summary);

  if (notificationPayload.type === "failure" || notificationPayload.requiresApproval === true) {
    return "warning";
  }

  if (decisionSummary.requiresApproval) {
    return "warning";
  }

  if (insights.length > 0) {
    return "recommending";
  }

  if (decisionSummary.hasUncertainty || notificationPayload.status === "unknown") {
    return "analyzing";
  }

  if (notificationPayload.type === "success") {
    return "waiting";
  }

  return "observing";
}

function buildReasons({ state, learningInsights, decisionIntelligence, notificationPayload }) {
  const reasons = [];
  const insights = normalizeArray(learningInsights.items);
  const decisionSummary = normalizeObject(decisionIntelligence.summary);

  if (state === "warning") {
    reasons.push(notificationPayload.message ?? "Execution requires attention before the AI companion can continue.");
  }

  if (state === "recommending") {
    reasons.push(learningInsights.summary ?? "Learning insights are strong enough to support a recommendation.");
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

  return {
    state,
    insightCount: insights.length,
    hasRecommendations: state === "recommending",
    requiresAttention: state === "warning",
    isPassive: state === "observing" || state === "waiting",
    canAutoExecute: decisionSummary.canAutoExecute === true,
    hasUncertainty: decisionSummary.hasUncertainty === true,
    latestNotificationType: notificationPayload.type ?? "unknown",
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
      stateId: `companion-state:${normalizedNotificationPayload.taskId ?? "project"}`,
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
        notificationType: normalizedNotificationPayload.type ?? "unknown",
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
