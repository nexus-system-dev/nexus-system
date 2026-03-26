function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function classifyFailureClass({ executionResult, failureSummary }) {
  const categories = normalizeArray(failureSummary.categories);
  const status = executionResult.status ?? "unknown";
  const primaryReason = String(failureSummary.primaryReason ?? executionResult.reason ?? "").toLowerCase();

  if (categories.includes("approval")) {
    return "approval-blocked";
  }

  if (categories.includes("policy")) {
    return "policy-blocked";
  }

  if (categories.includes("artifact") || primaryReason.includes("artifact") || primaryReason.includes("build")) {
    return "artifact-failure";
  }

  if (categories.includes("metadata")) {
    return "configuration-failure";
  }

  if (status === "failed") {
    return "execution-failure";
  }

  if (status === "unknown") {
    return "unknown-failure";
  }

  return "clear";
}

function inferRetryability(failureClass) {
  if (["execution-failure", "unknown-failure", "artifact-failure"].includes(failureClass)) {
    return "retryable";
  }

  if (["approval-blocked", "policy-blocked"].includes(failureClass)) {
    return "manual-only";
  }

  return "not-needed";
}

function buildFallbackOptions(failureClass) {
  if (failureClass === "execution-failure") {
    return ["retry-last-command", "switch-to-cloud-workspace"];
  }

  if (failureClass === "artifact-failure") {
    return ["rebuild-artifacts", "run-validation-only"];
  }

  if (failureClass === "approval-blocked" || failureClass === "policy-blocked") {
    return ["request-approval", "downgrade-scope"];
  }

  if (failureClass === "unknown-failure") {
    return ["retry-safe-mode", "collect-diagnostics"];
  }

  return [];
}

function buildRollbackScope(failureClass, executionResult) {
  if (["execution-failure", "artifact-failure"].includes(failureClass)) {
    return {
      scope: "workspace",
      target: executionResult.taskId ?? executionResult.requestId ?? null,
      requiresUserConfirmation: true,
    };
  }

  if (failureClass === "policy-blocked") {
    return {
      scope: "none",
      target: null,
      requiresUserConfirmation: false,
    };
  }

  return {
    scope: "project-state",
    target: executionResult.taskId ?? null,
    requiresUserConfirmation: false,
  };
}

function buildUserRecoveryPrompts(failureClass, failureSummary) {
  if (failureClass === "approval-blocked") {
    return [
      "צריך אישור כדי להמשיך. לפתוח בקשת approval עכשיו?",
      "אפשר גם לצמצם scope ולעבוד במצב בטוח יותר.",
    ];
  }

  if (failureClass === "policy-blocked") {
    return [
      "ה־policy חסם את הפעולה. לבדוק את כללי האבטחה או לשנות את המסלול?",
    ];
  }

  if (failureClass === "artifact-failure") {
    return [
      "ה־artifact לא נבנה כמו שצריך. להריץ build מחדש או לעבור ל־validation בלבד?",
    ];
  }

  if (failureClass === "execution-failure" || failureClass === "unknown-failure") {
    return [
      "ההרצה נכשלה. לנסות שוב באותו mode או לעבור למסלול בטוח יותר?",
      failureSummary.primaryReason ? `סיבת הכשל הראשית: ${failureSummary.primaryReason}` : "אין עדיין סיבה חד־משמעית לכשל.",
    ];
  }

  return [];
}

export function defineFailureRecoverySchema({
  executionResult = null,
  failureSummary = null,
} = {}) {
  const normalizedExecutionResult = normalizeObject(executionResult);
  const normalizedFailureSummary = normalizeObject(failureSummary);
  const failureClass = classifyFailureClass({
    executionResult: normalizedExecutionResult,
    failureSummary: normalizedFailureSummary,
  });
  const retryability = inferRetryability(failureClass);
  const fallbackOptions = buildFallbackOptions(failureClass);
  const rollbackScope = buildRollbackScope(failureClass, normalizedExecutionResult);
  const userRecoveryPrompts = buildUserRecoveryPrompts(failureClass, normalizedFailureSummary);

  return {
    failureRecoveryModel: {
      recoveryId: `failure-recovery:${normalizedExecutionResult.taskId ?? normalizedExecutionResult.requestId ?? "unknown"}`,
      failureClass,
      retryability,
      fallbackOptions,
      rollbackScope,
      userRecoveryPrompts,
      summary: {
        requiresIntervention: retryability === "manual-only" || userRecoveryPrompts.length > 0,
        canRetry: retryability === "retryable",
        hasRollbackPath: rollbackScope.scope !== "none",
      },
    },
  };
}
