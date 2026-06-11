function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function buildStep(stepId, label, status, description) {
  return {
    stepId,
    label,
    status,
    description,
  };
}

function resolveFlowStatus(decision = {}) {
  if (decision.status === "applied") {
    return "applied";
  }
  if (decision.status === "approved-applied") {
    return "applied";
  }
  if (decision.status === "rejected") {
    return "rejected";
  }
  if (decision.status === "canceled") {
    return "canceled";
  }
  if (decision.status === "pending-approval") {
    return "pending-approval";
  }
  if (decision.status === "failed-safely") {
    return "failed-safely";
  }
  if (decision.taskId) {
    return "decision-ready";
  }
  return "empty";
}

function resolveUserFacingSummary({ decision = {}, buildMutationTruth = {} } = {}) {
  if (!decision.taskId) {
    return "אין שינוי פעיל כרגע.";
  }
  if (decision.status === "applied") {
    return "השינוי עבר דרך החלטת שינוי, נשמר, ונרשם להמשך.";
  }
  if (decision.status === "approved-applied") {
    return "השינוי אושר, הוחל, ונרשם להמשך.";
  }
  if (decision.status === "rejected") {
    return "השינוי נדחה, ולכן המוצר נשאר ללא שינוי.";
  }
  if (decision.status === "canceled") {
    return "השינוי בוטל, ולכן המוצר נשאר ללא שינוי.";
  }
  if (decision.status === "pending-approval") {
    return "השינוי משמעותי ולכן ממתין לאישור לפני שינוי המוצר.";
  }
  if (decision.status === "failed-safely") {
    return "השינוי לא נסגר כהצלחה, ולכן המוצר לא שונה.";
  }
  if (buildMutationTruth.status === "applied") {
    return "יש שינוי שנשמר באמת הפרויקט.";
  }
  return "הבקשה נבדקה לפני שינוי.";
}

function buildFlowSteps({ decision = {}, buildMutationTruth = {} } = {}) {
  const hasDecision = decision.taskId === "MUT-001";
  const isApplied = decision.status === "applied";
  const isApprovedApplied = decision.status === "approved-applied";
  const isRejected = decision.status === "rejected";
  const isCanceled = decision.status === "canceled";
  const isPendingApproval = decision.status === "pending-approval";
  const isFailed = decision.status === "failed-safely";
  const hasMutation = buildMutationTruth.status === "applied";

  return [
    buildStep(
      "request",
      "בקשה",
      hasDecision ? "done" : "waiting",
      hasDecision ? "הבקשה נכנסה למסלול שינוי." : "עדיין אין בקשת שינוי פעילה.",
    ),
    buildStep(
      "decision",
      "החלטה",
      hasDecision ? "done" : "waiting",
      hasDecision ? "נבדק אם זה שינוי קטן או שינוי שמצריך אישור." : "נדרש ניתוח שינוי.",
    ),
    buildStep(
      "approval",
      "אישור",
      isPendingApproval
        ? "waiting"
        : isApprovedApplied
          ? "done"
          : isRejected || isCanceled
            ? "blocked"
        : decision.requiresApproval
          ? "blocked"
          : hasDecision
            ? "skipped"
            : "waiting",
      isPendingApproval
        ? "המוצר לא משתנה עד שהמשתמש מאשר."
        : isApprovedApplied
          ? "המשתמש אישר את השינוי."
          : isRejected
            ? "המשתמש דחה את השינוי."
            : isCanceled
              ? "השינוי בוטל לפני יישום."
        : decision.requiresApproval
          ? "השינוי חסום עד אישור."
          : "לא נדרש אישור לשינוי הזה.",
    ),
    buildStep(
      "apply",
      "יישום",
      isPendingApproval ? "blocked" : isApplied || isApprovedApplied || hasMutation ? "done" : isFailed ? "failed" : "waiting",
      isPendingApproval
        ? "היישום ממתין לאישור."
        : isApplied || isApprovedApplied || hasMutation
          ? "השינוי הוחל ונשמר."
          : isFailed
          ? "היישום נכשל בלי לשנות אמת מוצר."
          : "עוד אין שינוי להחיל.",
    ),
    buildStep(
      "history",
      "רישום",
      normalizeArray(decision.historyRecord ? [decision.historyRecord] : []).length > 0 ? "done" : "waiting",
      decision.historyRecord ? "נוצר רישום מוצרי שמסביר מה קרה." : "עוד אין רישום שינוי.",
    ),
  ];
}

export function buildCanonicalMutationFlowShell({
  project = {},
  mutationChangeDecision = null,
  mutationChangeHistory = null,
  buildMutationTruth = null,
  buildMutationHistory = null,
} = {}) {
  const safeProject = normalizeObject(project);
  const decision = normalizeObject(
    mutationChangeDecision
      ?? safeProject.mutationChangeDecision
      ?? safeProject.context?.mutationChangeDecision
      ?? safeProject.state?.mutationChangeDecision,
  );
  const mutationTruth = normalizeObject(
    buildMutationTruth
      ?? safeProject.buildMutationTruth
      ?? safeProject.context?.buildMutationTruth
      ?? safeProject.state?.buildMutationTruth,
  );
  const history = normalizeArray(
    mutationChangeHistory
      ?? safeProject.mutationChangeHistory
      ?? safeProject.context?.mutationChangeHistory
      ?? safeProject.state?.mutationChangeHistory,
  );
  const buildHistory = normalizeArray(
    buildMutationHistory
      ?? safeProject.buildMutationHistory
      ?? safeProject.context?.buildMutationHistory
      ?? safeProject.state?.buildMutationHistory,
  );
  const status = resolveFlowStatus(decision);

  return {
    taskId: "EXP-002",
    ownerTaskId: "MUT-001",
    projectId: normalizeString(safeProject.id, ""),
    status,
    changeType: normalizeString(decision.changeType, ""),
    requiresApproval: decision.requiresApproval === true,
    requiresProductTruthMutation: decision.requiresProductTruthMutation === true,
    mayApplyAutomatically: decision.mayApplyAutomatically === true,
    userFacingSummary: resolveUserFacingSummary({ decision, buildMutationTruth: mutationTruth }),
    activeMutationDecisionId: normalizeString(decision.mutationDecisionId, ""),
    activeBuildMutationId: normalizeString(decision.appliedMutationId, normalizeString(mutationTruth.lastMutationId, "")),
    historyCount: history.length,
    buildMutationHistoryCount: buildHistory.length,
    steps: buildFlowSteps({ decision, buildMutationTruth: mutationTruth }),
    boundary: "הזרימה מציגה מצב שינוי. אישור עמוק, שחזור, בדיקה ושחרור שייכים למשימות ההמשך.",
  };
}
