function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function humanizeAction(action) {
  const map = {
    "open-approval-request": "לפתוח בקשת אישור",
    "approve-request": "לאשר את ההגדרות כדי להתקדם",
    "wait-for-approval": "להמתין לאישור",
    "switch-to-safe-path": "לעבור למסלול בטוח יותר",
    "retry-task": "לנסות שוב את השלב האחרון",
    "fallback-path": "לעבור למסלול חלופי",
    "defer-task": "לדחות את השלב הזה כרגע",
    "continue-current-path": "להמשיך במסלול הנוכחי",
    "fix-release-validation": "לתקן את בעיות הוולידציה של השחרור",
  };

  return map[action] ?? action;
}

function humanizeReason(reason, activeBottleneck) {
  if (activeBottleneck.blockerType === "approval-blocker") {
    return "צריך את האישור שלך לפני שאפשר להמשיך בבטחה.";
  }

  if (activeBottleneck.blockerType === "release-blocker") {
    return "יש בעיית שחרור שצריך לפתור לפני שאפשר להתקדם.";
  }

  if (activeBottleneck.blockerType === "failed-task") {
    return "השלב האחרון לא הושלם, ולכן עדיף לטפל בו לפני שמתקדמים.";
  }

  return reason ?? "זה הצעד שהכי יקדם את הפרויקט כרגע.";
}

function findWhyThisTaskType(explanationSchema) {
  return normalizeArray(explanationSchema.explanationTypes)
    .find((item) => item?.explanationType === "why-this-task") ?? null;
}

function inferAlternatives(activeBottleneck, schedulerDecision) {
  const normalizedSchedulerDecision = normalizeObject(schedulerDecision);
  const alternatives = normalizeArray(normalizedSchedulerDecision.alternatives);

  if (alternatives.length > 0) {
    return alternatives;
  }

  if (activeBottleneck.blockerType === "approval-blocker") {
    return ["wait-for-approval", "switch-to-safe-path"];
  }

  if (activeBottleneck.blockerType === "failed-task") {
    return ["retry-task", "fallback-path"];
  }

  return ["defer-task"];
}

export function createNextActionExplanationBuilder({
  explanationSchema = null,
  activeBottleneck = null,
  schedulerDecision = null,
} = {}) {
  const normalizedExplanationSchema = normalizeObject(explanationSchema);
  const normalizedActiveBottleneck = normalizeObject(activeBottleneck);
  const normalizedSchedulerDecision = normalizeObject(schedulerDecision);
  const whyThisTask = findWhyThisTaskType(normalizedExplanationSchema);
  const selectedAction = normalizedSchedulerDecision.selectedAction
    ?? normalizedSchedulerDecision.taskId
    ?? normalizedSchedulerDecision.nextTask
    ?? normalizedActiveBottleneck.unblockConditions?.[0]
    ?? "continue-current-path";
  const alternatives = inferAlternatives(normalizedActiveBottleneck, normalizedSchedulerDecision);
  const reason = humanizeReason(
    whyThisTask?.summary ?? normalizedActiveBottleneck.reason,
    normalizedActiveBottleneck,
  );

  return {
    nextActionExplanation: {
      explanationId: `next-action-explanation:${normalizedActiveBottleneck.bottleneckId ?? "unknown"}`,
      selectedAction,
      reason,
      blockerType: normalizedActiveBottleneck.blockerType ?? "none",
      alternatives,
      userFacingAction: humanizeAction(selectedAction),
      userFacingAlternatives: alternatives.map(humanizeAction),
      summary: {
        isPreferred: true,
        alternativeCount: alternatives.length,
        schedulerSource: normalizedSchedulerDecision.source ?? "scheduler-partial",
      },
    },
  };
}
