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

function resolvePriority({ learningInsights, gatingDecision, notificationPayload }) {
  const normalizedLearningInsights = normalizeObject(learningInsights);
  const normalizedGatingDecision = normalizeObject(gatingDecision);
  const normalizedNotificationPayload = normalizeObject(notificationPayload);
  const insightCount = normalizeArray(normalizedLearningInsights.items).length;
  const notificationType = normalizeString(normalizedNotificationPayload.type, "unknown").toLowerCase();

  if (notificationType === "failure") {
    return "critical";
  }

  if (normalizedGatingDecision.isBlocked === true || normalizedNotificationPayload.requiresApproval === true) {
    return "warning";
  }

  if (insightCount > 0) {
    return "recommendation";
  }

  return "advisory";
}

function buildSummary(priority, learningInsights, gatingDecision, notificationPayload) {
  const normalizedLearningInsights = normalizeObject(learningInsights);
  const normalizedGatingDecision = normalizeObject(gatingDecision);
  const normalizedNotificationPayload = normalizeObject(notificationPayload);

  return {
    priority,
    blocked: normalizedGatingDecision.isBlocked === true,
    requiresApproval: normalizedNotificationPayload.requiresApproval === true,
    insightCount: normalizeArray(normalizedLearningInsights.items).length,
    notificationType: normalizeString(normalizedNotificationPayload.type, "unknown").toLowerCase(),
  };
}

export function createCompanionMessagePriorityResolver({
  learningInsights = null,
  gatingDecision = null,
  notificationPayload = null,
} = {}) {
  const normalizedLearningInsights = normalizeObject(learningInsights);
  const normalizedGatingDecision = normalizeObject(gatingDecision);
  const normalizedNotificationPayload = normalizeObject(notificationPayload);
  const priority = resolvePriority({
    learningInsights: normalizedLearningInsights,
    gatingDecision: normalizedGatingDecision,
    notificationPayload: normalizedNotificationPayload,
  });

  return {
    companionMessagePriority: {
      priorityId: `companion-message-priority:${normalizeString(normalizedNotificationPayload.taskId, "project")}`,
      priority,
      label: priority,
      reasons: [
        normalizeString(
          normalizedNotificationPayload.message,
          normalizeString(
            normalizedLearningInsights.summary,
            "No companion message priority reasoning is available yet.",
          ),
        ),
      ],
      summary: buildSummary(
        priority,
        normalizedLearningInsights,
        normalizedGatingDecision,
        normalizedNotificationPayload,
      ),
    },
  };
}
