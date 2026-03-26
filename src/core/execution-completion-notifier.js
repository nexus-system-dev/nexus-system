function inferNotificationType(executionResult = {}) {
  if (executionResult.status === "failed") {
    return "failure";
  }

  if (executionResult.requiresUserAction) {
    return "user-intervention-required";
  }

  return "success";
}

export function createExecutionCompletionNotifier({
  executionResult = null,
  decisionIntelligence = null,
} = {}) {
  const type = inferNotificationType(executionResult ?? {});
  const requiresApproval = Boolean(decisionIntelligence?.summary?.requiresApproval);

  return {
    notificationPayload: {
      type,
      status: executionResult?.status ?? "unknown",
      taskId: executionResult?.taskId ?? null,
      message:
        type === "failure"
          ? executionResult?.reason ?? "המשימה נכשלה"
          : type === "user-intervention-required"
            ? "נדרשת התערבות משתמש כדי להמשיך"
            : "המשימה הושלמה בהצלחה",
      requiresApproval,
      nextAction:
        type === "failure"
          ? "investigate"
          : type === "user-intervention-required"
            ? "request-user-input"
            : "continue",
    },
  };
}
