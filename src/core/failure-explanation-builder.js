function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function humanizeLikelyCause(cause, activeBottleneck) {
  if (activeBottleneck.blockerType === "approval-blocker") {
    return "כמה הגדרות מפתח עדיין מחכות לאישור שלך.";
  }

  if (activeBottleneck.blockerType === "release-blocker") {
    return "יש בעיות וולידציה שצריך לפתור לפני שאפשר לשחרר.";
  }

  if (typeof cause !== "string" || cause.length === 0) {
    return "עדיין חסר לנו מידע מלא על הסיבה המדויקת.";
  }

  return cause
    .replace("build-output", "תוצרי הבנייה")
    .replace("scheduler-partial", "מצב תכנון חלקי");
}

function inferLikelyCause(failureSummary, taskResult, activeBottleneck) {
  return failureSummary.primaryReason
    ?? taskResult.reason
    ?? taskResult.output
    ?? activeBottleneck.reason
    ?? "No likely cause is available yet";
}

function inferBlockedWhat(taskResult, activeBottleneck) {
  if (activeBottleneck.blockerType === "approval-blocker") {
    return "הביצוע ממתין לאישור שלך לפני שאפשר להמשיך.";
  }

  if (activeBottleneck.blockerType === "policy-blocker") {
    return "המערכת עצרה את הביצוע בגלל מדיניות ההגנה הפעילה.";
  }

  if (activeBottleneck.blockerType === "credential-blocker") {
    return "חסר חיבור מאושר כדי להשלים את השלב הזה.";
  }

  if (activeBottleneck.blockerType === "release-blocker") {
    return "השחרור נעצר עד שנפתור את הבעיות שהתגלו בבדיקה.";
  }

  if (taskResult.taskId) {
    return `Task ${taskResult.taskId} failed`;
  }

  return "A project step failed";
}

function inferNextFix(failureSummary, activeBottleneck) {
  if (activeBottleneck.blockerType === "approval-blocker") {
    return "לאשר את ההגדרות שמחכות לך כדי לפתוח את החסם.";
  }

  if (activeBottleneck.blockerType === "policy-blocker") {
    return "לבחור מסלול פעולה שמותר לפי המדיניות.";
  }

  if (activeBottleneck.blockerType === "credential-blocker") {
    return "לחבר הרשאה מאושרת או לתקן את הגישה הקיימת.";
  }

  if (activeBottleneck.blockerType === "failed-task") {
    return "לנסות שוב את השלב האחרון או לעבור למסלול ההתאוששות שהוצע.";
  }

  if (normalizeArray(failureSummary.categories).includes("artifact")) {
    return "לבדוק את שלב הבנייה ולוודא שהתוצרים נוצרו כמו שצריך.";
  }

  return "לעבור על מה שנשבר ולהמשיך עם מסלול ההתאוששות הבטוח ביותר.";
}

export function createFailureExplanationBuilder({
  failureSummary = null,
  taskResult = null,
  activeBottleneck = null,
} = {}) {
  const normalizedFailureSummary = normalizeObject(failureSummary);
  const normalizedTaskResult = normalizeObject(taskResult);
  const normalizedActiveBottleneck = normalizeObject(activeBottleneck);

  return {
    failureExplanation: {
      explanationId: `failure-explanation:${normalizedTaskResult.taskId ?? normalizedActiveBottleneck.bottleneckId ?? "unknown"}`,
      failedTaskId: normalizedTaskResult.taskId ?? null,
      failureStatus: normalizedFailureSummary.status ?? "clear",
      failedWhat: inferBlockedWhat(
        normalizedTaskResult,
        normalizedActiveBottleneck,
      ),
      likelyCause: humanizeLikelyCause(
        inferLikelyCause(
          normalizedFailureSummary,
          normalizedTaskResult,
          normalizedActiveBottleneck,
        ),
        normalizedActiveBottleneck,
      ),
      nextFix: inferNextFix(normalizedFailureSummary, normalizedActiveBottleneck),
      summary: {
        categoryCount: normalizeArray(normalizedFailureSummary.categories).length,
        blockerType: normalizedActiveBottleneck.blockerType ?? "none",
        hasConcreteTask: Boolean(normalizedTaskResult.taskId),
      },
    },
  };
}
