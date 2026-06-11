function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cloneJson(value) {
  if (value === undefined) {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

function deriveProductModelName({ productSkeleton = {}, runtimeSkeletonTruth = {}, goal = "" } = {}) {
  const skeletonObjectName = normalizeString(productSkeleton?.dataObjects?.[0]?.name);
  if (skeletonObjectName) {
    return skeletonObjectName;
  }
  const text = `${normalizeString(goal)} ${normalizeString(runtimeSkeletonTruth?.title)} ${normalizeString(runtimeSkeletonTruth?.summary)}`;
  if (/לידים|ליד/u.test(text)) {
    return "ליד";
  }
  if (/הזמנות|הזמנה/u.test(text)) {
    return "הזמנה";
  }
  if (/לקוחות|לקוח/u.test(text)) {
    return "לקוח";
  }
  if (/משימות|משימה/u.test(text)) {
    return "משימה";
  }
  return "";
}

function buildContinuityProductSnapshot(project = {}) {
  const safeProject = normalizeObject(project);
  const productSkeleton = safeProject.productSkeletonAgentOutput ?? safeProject.context?.productSkeletonAgentOutput ?? safeProject.state?.productSkeletonAgentOutput;
  const runtimeSkeletonTruth = cloneJson(safeProject.runtimeSkeletonTruth ?? safeProject.context?.runtimeSkeletonTruth ?? safeProject.state?.runtimeSkeletonTruth);
  const productDomainSkeleton = cloneJson(safeProject.productDomainSkeleton ?? safeProject.context?.productDomainSkeleton ?? safeProject.state?.productDomainSkeleton);
  const modelName = deriveProductModelName({
    productSkeleton,
    runtimeSkeletonTruth,
    goal: safeProject.goal ?? safeProject.context?.goal ?? safeProject.state?.goal,
  });
  if (
    productDomainSkeleton
    && modelName
    && ["Record", "Product", "Item", "רשומה"].includes(normalizeString(productDomainSkeleton.models?.[0]?.name))
  ) {
    productDomainSkeleton.models[0].name = modelName;
  }
  return {
    projectId: normalizeString(safeProject.id),
    projectName: normalizeString(safeProject.name, "פרויקט Nexus"),
    goal: normalizeString(safeProject.goal),
    artifactExpectation: cloneJson(safeProject.artifactExpectation ?? safeProject.context?.artifactExpectation ?? safeProject.state?.artifactExpectation),
    productSkeletonAgentOutput: cloneJson(productSkeleton),
    runtimeSkeletonTruth,
    productDomainSkeleton,
    productOwnedBackendSkeleton: cloneJson(safeProject.productOwnedBackendSkeleton ?? safeProject.context?.productOwnedBackendSkeleton ?? safeProject.state?.productOwnedBackendSkeleton),
    skeletonChoiceTruth: cloneJson(safeProject.skeletonChoiceTruth ?? safeProject.context?.skeletonChoiceTruth ?? safeProject.state?.skeletonChoiceTruth),
  };
}

function hasPattern(message, patterns = []) {
  const normalized = normalizeString(message).toLowerCase();
  return patterns.some((pattern) => pattern.test(normalized));
}

function buildDecisionId(projectId = "project", now = new Date().toISOString()) {
  return `mutation-change:${normalizeString(projectId, "project")}:${Date.parse(now) || Date.now()}`;
}

function resolveChangeType({ buildAgentTurn = {}, message = "" } = {}) {
  const intent = normalizeString(buildAgentTurn.intent, "");
  if (intent === "product-truth-change") {
    return "product-truth";
  }
  if (intent === "visual-change" || intent === "visual-style-change") {
    return "visual";
  }
  if (intent === "release-request" || hasPattern(message, [/פרסם|לפרסם|שחרר|לשחרר|publish|deploy|release/])) {
    return "release";
  }
  if (hasPattern(message, [/וואטסאפ|whatsapp|תשלום|payment|ספק|provider/])) {
    return "risky";
  }
  if (hasPattern(message, [/אחראי|owner|סטטוס|status|מקור ליד|שדה|הוסף ליד|תוסיף ליד|תזכורת|reminder/])) {
    return "small";
  }
  return "understanding-correction";
}

function requiresApprovalForChange({ changeType = "", buildAgentTurn = {}, message = "" } = {}) {
  if (buildAgentTurn.requiresApproval === true) {
    return true;
  }
  if (["product-truth", "workflow", "audience", "data", "release", "risky"].includes(changeType)) {
    return changeType !== "small" && changeType !== "visual";
  }
  return hasPattern(message, [
    /הזמנות במקום לידים|לא לידים|actually.*orders|orders.*not leads/u,
    /הרשאות|permissions|תשלום|payment|פרסם|publish|deploy|וואטסאפ|whatsapp/u,
  ]);
}

function resolveAffectedAreas({ changeType = "", downstreamAction = {}, message = "" } = {}) {
  const screens = [];
  const workflows = [];
  const actions = [];
  const dataObjects = [];
  const design = [];
  const release = [];
  const history = ["mutation-history"];

  if (changeType === "visual") {
    screens.push(normalizeString(downstreamAction.payload?.affectedScreen, "מסך השלד"));
    design.push(normalizeString(downstreamAction.operationId, "visual-change"));
  }
  if (changeType === "small" || normalizeString(downstreamAction.operationId, "").startsWith("record.")) {
    screens.push("מסך העבודה");
    workflows.push("ניהול רשומות");
    actions.push(normalizeString(downstreamAction.operationId, "record-update"));
    dataObjects.push("רשומה");
  }
  if (changeType === "product-truth") {
    screens.push("מסך העבודה הראשי");
    workflows.push("הזרימה הראשונה");
    actions.push("הגדרת פעולות מחדש");
    dataObjects.push("אמת מוצר מרכזית");
  }
  if (changeType === "release" || changeType === "risky") {
    release.push("שחרור וספקים");
    actions.push("פעולה חיצונית");
  }
  if (hasPattern(message, [/תזכורת|reminder/])) {
    actions.push("תזכורת");
  }

  return {
    screens: [...new Set(screens)],
    workflows: [...new Set(workflows)],
    actions: [...new Set(actions)],
    dataObjects: [...new Set(dataObjects)],
    design: [...new Set(design)],
    release: [...new Set(release)],
    history,
  };
}

function resolveStatus({ requiresApproval = false, downstreamAction = {}, buildAgentTurn = {} } = {}) {
  if (requiresApproval) {
    return "pending-approval";
  }
  if (downstreamAction.shouldApply === true) {
    return "ready-to-apply";
  }
  if (buildAgentTurn.owner === "visual-build-agent") {
    return "routed-to-visual-agent";
  }
  return "needs-clarification";
}

export function createMutationChangeAgentDecision({
  project = {},
  message = "",
  buildAgentTurn = {},
  downstreamAction = {},
  requestedBy = "build-agent",
  now = new Date().toISOString(),
} = {}) {
  const safeProject = normalizeObject(project);
  const turn = normalizeObject(buildAgentTurn);
  const action = normalizeObject(downstreamAction);
  const userRequest = normalizeString(message, "");
  const changeType = resolveChangeType({ buildAgentTurn: turn, message: userRequest });
  const requiresApproval = requiresApprovalForChange({ changeType, buildAgentTurn: turn, message: userRequest });
  const affectedAreas = resolveAffectedAreas({ changeType, downstreamAction: action, message: userRequest });
  const requiresProductTruthMutation = changeType !== "visual" && changeType !== "release" && changeType !== "risky";
  const status = resolveStatus({ requiresApproval, downstreamAction: action, buildAgentTurn: turn });
  const operationId = normalizeString(action.operationId, "");

  return {
    taskId: "MUT-001",
    agentId: "mutation-change-agent",
    responseSource: "agent-envelope",
    mutationDecisionId: buildDecisionId(safeProject.id, now),
    projectId: normalizeString(safeProject.id, ""),
    runtimeSkeletonId: normalizeString(safeProject.runtimeSkeletonTruth?.runtimeSkeletonId, ""),
    productDomainSkeletonId: normalizeString(safeProject.productDomainSkeleton?.productDomainSkeletonId, ""),
    productOwnedBackendSkeletonId: normalizeString(safeProject.productOwnedBackendSkeleton?.productOwnedBackendSkeletonId, ""),
    buildAgentTurnDecisionId: normalizeString(turn.decisionId, ""),
    changeType,
    userRequest,
    operationId,
    actualChange: {
      added: operationId === "record.addField" ? [normalizeString(action.payload?.fieldName, "שדה חדש")] : [],
      removed: [],
      replaced: operationId ? [operationId] : [],
      unchanged: requiresApproval ? ["השלד נשאר ללא שינוי עד אישור"] : [],
    },
    affectedAreas,
    requiresApproval,
    approvalReason: requiresApproval
      ? "השינוי יכול להשפיע על כיוון המוצר, שחרור, ספקים או החלטות קודמות."
      : "",
    requiresAgent: [
      ...(turn.owner === "visual-build-agent" ? ["visual-build-agent"] : []),
      ...(requiresApproval ? ["history-continuity-agent"] : []),
      ...(changeType === "release" || changeType === "risky" ? ["release-agent"] : []),
    ],
    requiresCheckpoint: requiresApproval || changeType === "product-truth",
    requiresVerification: requiresProductTruthMutation || changeType === "visual",
    requiresProductTruthMutation,
    mayApplyAutomatically: !requiresApproval && action.shouldApply === true,
    status,
    historyRecord: {
      before: "אמת המוצר הקיימת נשמרה לפני החלטת השינוי.",
      after: requiresApproval
        ? "לא בוצע שינוי עד אישור המשתמש."
        : action.shouldApply
          ? "השינוי מוכן ליישום דרך מסלול השינוי המאושר."
          : "לא בוצע שינוי כי אין פעולה בטוחה ליישום.",
      why: userRequest,
      requestedBy,
      approvalStatus: requiresApproval ? "pending" : "not-required",
      rollbackAvailable: !requiresApproval && action.shouldApply === true,
      truthStatus: requiresApproval ? "temporary" : "new-truth",
    },
    userReply: requiresApproval
      ? "זה שינוי משמעותי. אני לא משנה את המוצר בשקט לפני אישור."
      : action.shouldApply
        ? "זה שינוי בטוח ומוגבל, ולכן אפשר ליישם אותו דרך אמת הפרויקט."
        : "אני צריך עוד הבהרה לפני שינוי אמיתי.",
    createdAt: now,
  };
}

export function finalizeMutationChangeAgentDecision({
  decision = {},
  downstreamResult = null,
  now = new Date().toISOString(),
} = {}) {
  const safeDecision = normalizeObject(decision);
  const result = normalizeObject(downstreamResult);
  if (!safeDecision.taskId) {
    return null;
  }
  const applied = result.status === "applied";
  const failed = result.status === "failed-safely";
  const finalStatus = safeDecision.requiresApproval
    ? "pending-approval"
    : applied
      ? "applied"
      : failed
        ? "failed-safely"
        : safeDecision.status;

  return {
    ...safeDecision,
    status: finalStatus,
    appliedMutationId: normalizeString(result.mutationId, ""),
    appliedOperationId: normalizeString(result.operationId, safeDecision.operationId),
    failureReason: failed ? normalizeString(result.error, "השינוי נכשל ללא שינוי אמת מוצר.") : "",
    historyRecord: {
      ...normalizeObject(safeDecision.historyRecord),
      after: applied
        ? normalizeString(result.visibleSummary, "השינוי בוצע ונשמר באמת הפרויקט.")
        : safeDecision.historyRecord?.after,
      approvalStatus: safeDecision.requiresApproval ? "pending" : "not-required",
      truthStatus: applied ? "new-truth" : safeDecision.historyRecord?.truthStatus,
    },
    completedAt: applied || failed ? now : "",
  };
}

export function appendMutationChangeHistory(project = {}, decision = {}) {
  const safeProject = normalizeObject(project);
  const safeDecision = normalizeObject(decision);
  if (!safeDecision.taskId) {
    return normalizeArray(safeProject.mutationChangeHistory);
  }
  return [
    ...normalizeArray(safeProject.mutationChangeHistory ?? safeProject.context?.mutationChangeHistory ?? safeProject.state?.mutationChangeHistory),
    {
      historyRecordId: `mutation-history:${safeDecision.mutationDecisionId}`,
      taskId: "MUT-001",
      mutationDecisionId: safeDecision.mutationDecisionId,
      projectId: safeDecision.projectId,
      changeType: safeDecision.changeType,
      status: safeDecision.status,
      requiresApproval: safeDecision.requiresApproval,
      requiresCheckpoint: safeDecision.requiresCheckpoint,
      requiresVerification: safeDecision.requiresVerification,
      affectedAreas: safeDecision.affectedAreas,
      historyRecord: safeDecision.historyRecord,
      productSnapshot: buildContinuityProductSnapshot(safeProject),
      userReply: safeDecision.userReply,
      recordedAt: safeDecision.completedAt || safeDecision.createdAt || new Date().toISOString(),
    },
  ];
}
