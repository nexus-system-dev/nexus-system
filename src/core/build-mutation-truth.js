import { applyProductDomainOperation } from "./product-domain-skeleton.js";
import { applyProductOwnedBackendMutation } from "./product-owned-backend-skeleton.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function resolveDefaultOperation(productDomainSkeleton = {}) {
  return normalizeArray(productDomainSkeleton.operations)[0]?.id ?? "";
}

function resolveDomainFields(productDomainSkeleton = {}) {
  return normalizeArray(productDomainSkeleton.models?.[0]?.fields)
    .map((field) => normalizeString(field?.name, ""))
    .filter(Boolean);
}

function isMissingOwner(value = "") {
  const owner = normalizeString(value, "");
  return owner === "ללא אחראי" || owner === "לא משויך" || owner === "טרם שויך";
}

function normalizeMutationPayload(operationId = "", payload = {}) {
  const normalizedPayload = normalizeObject(payload);
  if (operationId !== "record.create") {
    return normalizedPayload;
  }

  const requestedName = normalizeString(
    normalizedPayload.name,
    normalizeString(normalizedPayload.label, normalizeString(normalizedPayload.title, "")),
  );
  return requestedName ? { ...normalizedPayload, name: requestedName } : normalizedPayload;
}

function refreshRuntimeTruthFromDomain(runtimeSkeletonTruth = {}, productDomainSkeleton = {}) {
  const fields = resolveDomainFields(productDomainSkeleton);
  const records = normalizeArray(productDomainSkeleton.state?.records);
  if (!fields.length) {
    return runtimeSkeletonTruth;
  }

  const nextRuntime = {
    ...runtimeSkeletonTruth,
    fields,
  };

  if (runtimeSkeletonTruth.shellFamily === "workspace-state-shell" || runtimeSkeletonTruth.shellFamily === "product-workflow-shell") {
    const firstItem = normalizeArray(runtimeSkeletonTruth.primaryItems)[0] ?? "פריט ראשון";
    const secondItem = normalizeArray(runtimeSkeletonTruth.primaryItems)[1] ?? "פריט שני";
    const thirdItem = normalizeArray(runtimeSkeletonTruth.primaryItems)[2] ?? fields[4] ?? "צעד הבא";
    nextRuntime.columns = [
      { title: "פתוח", items: [firstItem, fields[0] ?? "שם", fields[1] ?? "סטטוס"] },
      { title: "בטיפול", items: [secondItem, fields[2] ?? "אחראי", fields[3] ?? "תזכורת"] },
      { title: "הצעד הבא", items: [runtimeSkeletonTruth.primaryAction ?? "הפעל פעולה", thirdItem, fields[4] ?? "צעד הבא", ...fields.slice(5, 7)] },
    ];
    if (records.length) {
      nextRuntime.tableRows = records.map((record) => ({
        name: normalizeString(record.name, "רשומה"),
        id: normalizeString(record.id, ""),
        status: normalizeString(record.status, "פתוח"),
        owner: normalizeString(record.owner, "ללא אחראי"),
        reminder: normalizeString(record.reminder, "ללא תזכורת"),
        nextStep: normalizeString(record.nextStep, "אין צעד הבא"),
        priority: normalizeString(record.priority, ""),
      }));
      nextRuntime.metrics = [
        { label: "פתוחים", value: String(records.filter((record) => normalizeString(record.status, "") === "פתוח").length) },
        { label: "דורשים תזכורת", value: String(records.filter((record) => normalizeString(record.reminder, "").includes("היום")).length) },
        { label: "ממתינים לאחראי", value: String(records.filter((record) => isMissingOwner(record.owner)).length) },
      ];
    }
  }

  return nextRuntime;
}

export function createBuildMutationIntent({
  project = null,
  requestText = "",
  operationId = "",
  payload = {},
  requestedBy = "build-agent",
  now = new Date().toISOString(),
} = {}) {
  const safeProject = normalizeObject(project);
  const runtimeSkeletonTruth = normalizeObject(
    safeProject.runtimeSkeletonTruth
      ?? safeProject.context?.runtimeSkeletonTruth
      ?? safeProject.state?.runtimeSkeletonTruth,
  );
  const productDomainSkeleton = normalizeObject(
    safeProject.productDomainSkeleton
      ?? safeProject.context?.productDomainSkeleton
      ?? safeProject.state?.productDomainSkeleton
      ?? runtimeSkeletonTruth.productDomainSkeleton,
  );
  const productOwnedBackendSkeleton = normalizeObject(
    safeProject.productOwnedBackendSkeleton
      ?? safeProject.context?.productOwnedBackendSkeleton
      ?? safeProject.state?.productOwnedBackendSkeleton
      ?? runtimeSkeletonTruth.productOwnedBackendSkeleton,
  );
  const skeletonChoiceTruth = normalizeObject(
    safeProject.skeletonChoiceTruth
      ?? safeProject.context?.skeletonChoiceTruth
      ?? safeProject.state?.skeletonChoiceTruth,
  );
  const resolvedOperationId = normalizeString(operationId, resolveDefaultOperation(productDomainSkeleton));
  return {
    mutationId: `build-mutation:${safeProject.id ?? "unknown"}:${Date.parse(now) || Date.now()}`,
    taskId: "BUILD-MUTATION-TRUTH-001",
    sliceTaskId: "SLICE-006",
    agentId: "mutation-change-agent",
    responseSource: "canonical-build-mutation-intent",
    projectId: normalizeString(safeProject.id, ""),
    runtimeSkeletonId: normalizeString(runtimeSkeletonTruth.runtimeSkeletonId, ""),
    artifactBuildId: normalizeString(runtimeSkeletonTruth.artifactBuildId, ""),
    productDomainSkeletonId: normalizeString(productDomainSkeleton.productDomainSkeletonId, ""),
    productOwnedBackendSkeletonId: normalizeString(productOwnedBackendSkeleton.productOwnedBackendSkeletonId, ""),
    selectedSkeletonCandidateId: normalizeString(skeletonChoiceTruth.selectedSkeletonCandidateId, ""),
    selectedCompositionStyle: normalizeString(skeletonChoiceTruth.selectedCompositionStyle, ""),
    selectedProductDirection: normalizeString(skeletonChoiceTruth.selectedProductDirection, ""),
    operationId: resolvedOperationId,
    userRequest: normalizeString(requestText, "בקשת שינוי מתוך Build"),
    payload: normalizeObject(payload),
    requestedBy,
    createdAt: now,
    status: resolvedOperationId ? "intent-created" : "failed-safely",
    failureReason: resolvedOperationId ? "" : "missing-product-domain-operation",
  };
}

export function applyBuildMutationTruth({
  project = null,
  requestText = "",
  operationId = "",
  payload = {},
  requestedBy = "build-agent",
  now = new Date().toISOString(),
} = {}) {
  const safeProject = normalizeObject(project);
  const intent = createBuildMutationIntent({ project: safeProject, requestText, operationId, payload, requestedBy, now });
  const runtimeSkeletonTruth = normalizeObject(safeProject.runtimeSkeletonTruth ?? safeProject.context?.runtimeSkeletonTruth ?? safeProject.state?.runtimeSkeletonTruth);
  const beforeDomain = normalizeObject(safeProject.productDomainSkeleton ?? safeProject.context?.productDomainSkeleton ?? safeProject.state?.productDomainSkeleton ?? runtimeSkeletonTruth.productDomainSkeleton);
  const beforeProductOwnedBackend = normalizeObject(
    safeProject.productOwnedBackendSkeleton
      ?? safeProject.context?.productOwnedBackendSkeleton
      ?? safeProject.state?.productOwnedBackendSkeleton
      ?? runtimeSkeletonTruth.productOwnedBackendSkeleton,
  );

  if (intent.status !== "intent-created") {
    const failedRecord = createHistoryRecord({
      intent,
      status: "failed-safely",
      beforeDomain,
      afterDomain: beforeDomain,
      beforeProductOwnedBackend,
      afterProductOwnedBackend: beforeProductOwnedBackend,
    });
    return {
      ok: false,
      intent,
      productDomainSkeleton: beforeDomain,
      productOwnedBackendSkeleton: beforeProductOwnedBackend,
      runtimeSkeletonTruth,
      historyRecord: failedRecord,
      error: intent.failureReason,
    };
  }

  const normalizedPayload = normalizeMutationPayload(intent.operationId, intent.payload);
  const operationResult = applyProductDomainOperation(beforeDomain, intent.operationId, normalizedPayload);
  intent.payload = normalizedPayload;
  const afterDomain = operationResult.ok ? operationResult.domainSkeleton : beforeDomain;
  const status = operationResult.ok ? "applied" : "failed-safely";
  const afterProductOwnedBackend = operationResult.ok
    ? applyProductOwnedBackendMutation({
        productOwnedBackendSkeleton: beforeProductOwnedBackend,
        productDomainSkeleton: afterDomain,
        intent,
        operationId: intent.operationId,
        payload: normalizedPayload,
        status,
        now,
      })
    : beforeProductOwnedBackend;
  const historyRecord = createHistoryRecord({
    intent,
    status,
    beforeDomain,
    afterDomain,
    beforeProductOwnedBackend,
    afterProductOwnedBackend,
    error: operationResult.error,
  });
  const refreshedRuntimeTruth = refreshRuntimeTruthFromDomain(runtimeSkeletonTruth, afterDomain);
  const afterRuntimeTruth = {
    ...refreshedRuntimeTruth,
    productDomainSkeleton: afterDomain,
    productDomainSkeletonId: afterDomain.productDomainSkeletonId,
    productOwnedBackendSkeleton: afterProductOwnedBackend,
    productOwnedBackendSkeletonId: afterProductOwnedBackend.productOwnedBackendSkeletonId,
    lastBuildMutationId: intent.mutationId,
    mutationIds: [...normalizeArray(refreshedRuntimeTruth.mutationIds), intent.mutationId],
  };

  return {
    ok: operationResult.ok === true,
    intent: {
      ...intent,
      status,
      failureReason: operationResult.ok ? "" : operationResult.error,
    },
    productDomainSkeleton: afterDomain,
    productOwnedBackendSkeleton: afterProductOwnedBackend,
    runtimeSkeletonTruth: afterRuntimeTruth,
    historyRecord,
    error: operationResult.error ?? "",
  };
}

export function replayBuildMutationIntentsOnSkeleton({
  runtimeSkeletonTruth = {},
  productDomainSkeleton = {},
  productOwnedBackendSkeleton = {},
  buildMutationIntents = [],
} = {}) {
  let nextRuntimeSkeletonTruth = normalizeObject(runtimeSkeletonTruth);
  let nextProductDomainSkeleton = normalizeObject(productDomainSkeleton);
  let nextProductOwnedBackendSkeleton = normalizeObject(productOwnedBackendSkeleton ?? nextRuntimeSkeletonTruth.productOwnedBackendSkeleton);
  const restoredMutationIds = [];

  for (const intent of normalizeArray(buildMutationIntents)) {
    const normalizedIntent = normalizeObject(intent);
    if (normalizedIntent.status !== "applied") {
      continue;
    }

    const operationId = normalizeString(normalizedIntent.operationId, "");
    if (!operationId) {
      continue;
    }

    const operationResult = applyProductDomainOperation(
      nextProductDomainSkeleton,
      operationId,
      normalizeObject(normalizedIntent.payload),
    );
    if (operationResult.ok !== true) {
      continue;
    }

    nextProductDomainSkeleton = operationResult.domainSkeleton;
    nextProductOwnedBackendSkeleton = applyProductOwnedBackendMutation({
      productOwnedBackendSkeleton: nextProductOwnedBackendSkeleton,
      productDomainSkeleton: nextProductDomainSkeleton,
      intent: normalizedIntent,
      operationId,
      payload: normalizeObject(normalizedIntent.payload),
      status: "applied",
      now: normalizedIntent.createdAt ?? new Date().toISOString(),
    });
    const refreshedRuntimeTruth = refreshRuntimeTruthFromDomain(nextRuntimeSkeletonTruth, nextProductDomainSkeleton);
    nextRuntimeSkeletonTruth = {
      ...refreshedRuntimeTruth,
      productDomainSkeleton: nextProductDomainSkeleton,
      productDomainSkeletonId: nextProductDomainSkeleton.productDomainSkeletonId,
      productOwnedBackendSkeleton: nextProductOwnedBackendSkeleton,
      productOwnedBackendSkeletonId: nextProductOwnedBackendSkeleton.productOwnedBackendSkeletonId,
      lastBuildMutationId: normalizedIntent.mutationId ?? refreshedRuntimeTruth.lastBuildMutationId ?? null,
      mutationIds: [
        ...normalizeArray(refreshedRuntimeTruth.mutationIds),
        ...(normalizedIntent.mutationId ? [normalizedIntent.mutationId] : []),
      ],
    };
    if (normalizedIntent.mutationId) {
      restoredMutationIds.push(normalizedIntent.mutationId);
    }
  }

  return {
    runtimeSkeletonTruth: nextRuntimeSkeletonTruth,
    productDomainSkeleton: nextProductDomainSkeleton,
    productOwnedBackendSkeleton: nextProductOwnedBackendSkeleton,
    restoredMutationIds,
  };
}

function createHistoryRecord({
  intent,
  status,
  beforeDomain,
  afterDomain,
  beforeProductOwnedBackend = {},
  afterProductOwnedBackend = {},
  error = "",
}) {
  const visibleSummary = resolveUserFacingMutationSummary(intent.operationId, intent.payload, status);
  return {
    historyRecordId: `history:${intent.mutationId}`,
    taskId: "BUILD-MUTATION-TRUTH-001",
    sliceTaskId: "SLICE-006",
    mutationId: intent.mutationId,
    projectId: intent.projectId,
    runtimeSkeletonId: intent.runtimeSkeletonId,
    productDomainSkeletonId: intent.productDomainSkeletonId,
    productOwnedBackendSkeletonId: intent.productOwnedBackendSkeletonId,
    selectedSkeletonCandidateId: intent.selectedSkeletonCandidateId,
    selectedCompositionStyle: intent.selectedCompositionStyle,
    selectedProductDirection: intent.selectedProductDirection,
    operationId: intent.operationId,
    before: beforeDomain.productDomainSkeletonId ? `${beforeDomain.productDomainSkeletonId} before ${intent.operationId}` : "no product-domain skeleton",
    after: afterDomain.productDomainSkeletonId ? `${afterDomain.productDomainSkeletonId} after ${intent.operationId}` : "no product-domain skeleton",
    backendBefore: beforeProductOwnedBackend.productOwnedBackendSkeletonId
      ? `${beforeProductOwnedBackend.productOwnedBackendSkeletonId} before ${intent.operationId}`
      : "no product-owned backend skeleton",
    backendAfter: afterProductOwnedBackend.productOwnedBackendSkeletonId
      ? `${afterProductOwnedBackend.productOwnedBackendSkeletonId} after ${intent.operationId}`
      : "no product-owned backend skeleton",
    why: intent.userRequest,
    requestedBy: intent.requestedBy,
    affectedAreas: ["runtime-skeleton", "product-domain-skeleton", "product-owned-backend-skeleton", "project-history"],
    approvalStatus: "not-required-for-mock-local-skeleton",
    rollbackAvailable: true,
    truthStatus: status === "applied" ? "new-truth" : "failed-safely",
    status,
    error,
    visibleSummary,
    recordedAt: intent.createdAt,
  };
}

function resolveUserFacingMutationSummary(operationId = "", payload = {}, status = "") {
  if (status !== "applied") {
    return "השינוי לא בוצע, ולכן השלד לא עודכן.";
  }
  const normalizedPayload = normalizeObject(payload);
  const labels = {
    "record.create": `נוסף ליד זמני בשם ${normalizeString(normalizedPayload.name, "ליד חדש")} לשלד.`,
    "record.select": `נבחרה הרשומה ${normalizeString(normalizedPayload.recordName, "הראשונה")} לעריכה.`,
    "record.updateStatus": `סטטוס הליד עודכן ל-${normalizeString(normalizedPayload.status, "סטטוס חדש")}.`,
    "record.assignOwner": `האחראי עודכן ל-${normalizeString(normalizedPayload.owner, "אחראי חדש")}.`,
    "record.updateReminder": `התזכורת עודכנה ל-${normalizeString(normalizedPayload.reminder, "מועד חדש")}.`,
    "record.addField": `נוסף שדה ${normalizeString(normalizedPayload.fieldName, "חדש")} לרשומות.`,
    "task.create": "נוספה משימה חדשה לשלד.",
    "lead.submit": "נשמר ליד בדיקה בשלד.",
    "cart.addItem": "נוסף פריט לעגלת הבדיקה.",
    "game.start": "המשחק עבר למצב התחלה.",
    "tool.run": "פעולת הכלי הורצה בשלד.",
  };
  return labels[operationId] ?? "השינוי נרשם בשלד.";
}
