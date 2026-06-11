function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function buildApprovalRequestId(mutationDecisionId = "", projectId = "project") {
  return `build-approval:${normalizeString(projectId, "project")}:${normalizeString(mutationDecisionId, Date.now())}`;
}

function resolveTargetDirection(message = "") {
  const normalized = normalizeString(message, "").toLowerCase();
  if (/הזמנות|orders|order/u.test(normalized)) {
    return {
      directionId: "orders",
      label: "ניהול הזמנות",
      replaces: "ניהול לידים",
      productType: "internal tool for order follow up",
      primaryObjectSingular: "הזמנה",
      primaryObjectPlural: "הזמנות",
      fields: ["שם לקוח", "סטטוס", "אחראי", "תזכורת", "צעד הבא", "מקור הזמנה"],
      sampleRecords: [
        {
          id: "order-1",
          name: "הזמנה 1001",
          status: "פתוחה",
          owner: "נועה",
          reminder: "מחר 09:00",
          nextStep: "אישור פרטי הזמנה",
          "שם לקוח": "מיכל לוי",
          "מקור הזמנה": "טלפון",
        },
        {
          id: "order-2",
          name: "הזמנה 1002",
          status: "בטיפול",
          owner: "דנה",
          reminder: "היום 16:00",
          nextStep: "בדיקת מלאי",
          "שם לקוח": "יוסי כהן",
          "מקור הזמנה": "אתר",
        },
      ],
    };
  }

  return {
    directionId: "product-direction",
    label: "כיוון מוצר חדש",
    replaces: "הכיוון הקיים",
    productType: "updated product direction",
    primaryObjectSingular: "פריט",
    primaryObjectPlural: "פריטים",
    fields: ["שם", "סטטוס", "אחראי", "צעד הבא"],
    sampleRecords: [],
  };
}

export function buildBuildApprovalFlow({
  project = {},
  mutationChangeDecision = null,
  existingFlow = null,
  now = new Date().toISOString(),
} = {}) {
  const safeProject = normalizeObject(project);
  const decision = normalizeObject(
    mutationChangeDecision
      ?? safeProject.mutationChangeDecision
      ?? safeProject.context?.mutationChangeDecision
      ?? safeProject.state?.mutationChangeDecision,
  );
  const existing = normalizeObject(
    existingFlow
      ?? safeProject.buildApprovalFlow
      ?? safeProject.context?.buildApprovalFlow
      ?? safeProject.state?.buildApprovalFlow,
  );

  if (existing.taskId === "BUILD-APPROVAL-001" && existing.mutationDecisionId === decision.mutationDecisionId) {
    return existing;
  }

  if (decision.taskId !== "MUT-001" || decision.requiresApproval !== true || decision.status !== "pending-approval") {
    return existing.taskId === "BUILD-APPROVAL-001" ? existing : null;
  }

  const targetDirection = resolveTargetDirection(decision.userRequest);
  const approvalRequestId = buildApprovalRequestId(decision.mutationDecisionId, safeProject.id);

  return {
    taskId: "BUILD-APPROVAL-001",
    bridgeTaskId: "BLD-AGT-001",
    ownerTaskId: "MUT-001",
    status: "pending-approval",
    decisionStatus: "pending",
    projectId: normalizeString(safeProject.id, ""),
    approvalRequestId,
    mutationDecisionId: normalizeString(decision.mutationDecisionId, ""),
    userRequest: normalizeString(decision.userRequest, ""),
    backedByMutationTruth: true,
    currentTruthUnchanged: true,
    targetDirection,
    impactSummary: {
      title: `שינוי כיוון אל ${targetDirection.label}`,
      before: targetDirection.replaces,
      after: targetDirection.label,
      willChange: [
        "שם המוצר וההגדרה שלו",
        "המודל של הרשומות",
        "השדות והדוגמאות בשלד",
        "היסטוריית השינוי ונקודת החזרה",
      ],
      willKeep: [
        "זהות הפרויקט",
        "היסטוריית הבקשות",
        "גבול שאין פרסום או ספק חיצוני בלי אישור נפרד",
      ],
      rejectionImpact: "אם תדחה, השלד והאמת הקיימת נשארים כמו שהם.",
    },
    allowedDecisions: ["approve", "reject", "cancel"],
    userFacingSummary: "זה שינוי כיוון משמעותי. נקסוס ממתינה לאישור לפני שינוי השלד.",
    createdAt: now,
    decidedAt: "",
  };
}

export function decideBuildApprovalFlow({
  approvalFlow = {},
  action = "",
  now = new Date().toISOString(),
} = {}) {
  const flow = normalizeObject(approvalFlow);
  const normalizedAction = normalizeString(action, "").toLowerCase();
  if (flow.taskId !== "BUILD-APPROVAL-001") {
    return null;
  }

  if (!["approve", "reject", "cancel"].includes(normalizedAction)) {
    return {
      ...flow,
      status: "pending-approval",
      decisionStatus: "pending",
      lastError: "unsupported-approval-action",
    };
  }

  if (normalizedAction === "approve") {
    return {
      ...flow,
      status: "approved-applied",
      decisionStatus: "approved",
      currentTruthUnchanged: false,
      userFacingSummary: `אושר. נקסוס משנה עכשיו את השלד לכיוון ${flow.targetDirection?.label ?? "החדש"} ושומרת את ההחלטה.`,
      decidedAt: now,
      lastError: "",
    };
  }

  return {
    ...flow,
    status: normalizedAction === "reject" ? "rejected" : "canceled",
    decisionStatus: normalizedAction === "reject" ? "rejected" : "canceled",
    currentTruthUnchanged: true,
    userFacingSummary: normalizedAction === "reject"
      ? "נדחה. נקסוס לא שינתה את השלד או את אמת המוצר."
      : "בוטל. נקסוס משאירה את הכיוון הקיים ללא שינוי.",
    decidedAt: now,
    lastError: "",
  };
}

export function buildApprovedProductDirectionPatch({ approvalFlow = {} } = {}) {
  const flow = normalizeObject(approvalFlow);
  const target = normalizeObject(flow.targetDirection);
  if (flow.taskId !== "BUILD-APPROVAL-001" || flow.decisionStatus !== "approved") {
    return null;
  }

  return {
    directionId: normalizeString(target.directionId, "product-direction"),
    label: normalizeString(target.label, "כיוון מוצר חדש"),
    productType: normalizeString(target.productType, "updated product direction"),
    primaryObjectSingular: normalizeString(target.primaryObjectSingular, "פריט"),
    primaryObjectPlural: normalizeString(target.primaryObjectPlural, "פריטים"),
    fields: normalizeArray(target.fields),
    sampleRecords: normalizeArray(target.sampleRecords),
  };
}
