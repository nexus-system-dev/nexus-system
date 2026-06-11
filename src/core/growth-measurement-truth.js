function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function normalizeNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

const REQUIRED_INTERNAL_EVENTS = [
  "demo.viewed",
  "share.opened",
  "primary_action.clicked",
  "form.submitted",
  "lead.created",
  "action.approved",
  "landing.opened",
  "test_email.sent",
  "action.failed",
  "action.completed",
];

const FABRICATED_METRIC_PATTERN = /fake|fabricated|estimated|guess|assumption|הערכה|מומצא|ניחוש/i;
const SENSITIVE_KEY_PATTERN = /email|phone|token|secret|cookie|authorization|password|raw|payload/i;

function redactSensitive(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => redactSensitive(entry));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? "[redacted]" : redactSensitive(entry),
      ]),
    );
  }
  return value;
}

function normalizeSourceType(value) {
  const sourceType = normalizeString(value, "internal-event");
  return ["provider", "manual", "internal-event", "form", "social-comment", "nexus"].includes(sourceType)
    ? sourceType
    : "manual";
}

function normalizeConfidence(value, sourceType, dataPointCount) {
  const confidence = normalizeString(value);
  if (["low", "medium", "high"].includes(confidence)) {
    return confidence;
  }
  if (sourceType === "provider" && dataPointCount >= 10) {
    return "medium";
  }
  return "low";
}

export function createGrowthMeasurementRecord(record = {}, { index = 0 } = {}) {
  const normalized = normalizeObject(record);
  const source = normalizeString(normalized.source);
  const metric = normalizeString(normalized.metric);
  const sourceType = normalizeSourceType(normalized.sourceType);
  const value = normalizeNumber(normalized.value, normalized.value ?? null);
  const rejectedReasons = [];

  if (!source) {
    rejectedReasons.push("missing-source");
  }
  if (!metric) {
    rejectedReasons.push("missing-metric");
  }
  if (FABRICATED_METRIC_PATTERN.test(source) || FABRICATED_METRIC_PATTERN.test(metric)) {
    rejectedReasons.push("fabricated-or-estimated-source");
  }
  if (sourceType === "provider" && normalized.providerConnected !== true) {
    rejectedReasons.push("provider-not-connected");
  }
  if (sourceType === "provider" && normalized.readScopeGranted !== true) {
    rejectedReasons.push("provider-read-scope-missing");
  }

  const timestamp = normalizeString(normalized.timestamp, new Date().toISOString());
  const dataPointCount = Math.max(1, normalizeNumber(normalized.dataPointCount, 1));
  const confidenceLevel = normalizeConfidence(normalized.confidenceLevel, sourceType, dataPointCount);
  const hypothesis = normalizeString(normalized.hypothesis, "השערה לא הוגדרה.");
  const result = rejectedReasons.length
    ? "Measurement unavailable."
    : normalizeString(normalized.result, `${metric} נמדד ממקור ${source}.`);
  const insight = dataPointCount <= 1
    ? "זה סימן ראשוני בלבד, לא הוכחה."
    : normalizeString(normalized.insight, "יש אינדיקציה ראשונית להמשך בדיקה.");

  return {
    measurementRecordId: normalizeString(normalized.measurementRecordId, `growth-measurement:${index + 1}`),
    taskId: "GROW-MEASURE-001",
    status: rejectedReasons.length ? "rejected" : "accepted",
    rejectedReasons,
    timestamp,
    source,
    sourceType,
    manualLabel: sourceType === "manual" ? "manual-measurement" : null,
    growthPath: normalizeString(normalized.growthPath, "growth-agent"),
    experimentId: normalizeString(normalized.experimentId, "first-growth-signal"),
    metric,
    value,
    privacyClassification: normalizeString(normalized.privacyClassification, "internal"),
    confidenceLevel,
    linkedArtifactId: normalizeString(normalized.linkedArtifactId, null),
    linkedActionId: normalizeString(normalized.linkedActionId, null),
    dataPointCount,
    hypothesis,
    result,
    insight,
    sensitiveData: redactSensitive(normalizeObject(normalized.sensitiveData)),
  };
}

function buildExternalActionGate({ externalAction = null, records = [] } = {}) {
  const action = normalizeObject(externalAction);
  const actionType = normalizeString(action.actionType, "draft-only");
  const isDraftOnly = action.draftOnly === true || actionType === "draft-only";
  const successMetric = normalizeString(action.successMetric);
  const hasAcceptedMeasurement = records.some((record) => record.status === "accepted");
  const canExecute = isDraftOnly || Boolean(successMetric);

  return {
    actionType,
    draftOnly: isDraftOnly,
    successMetric: successMetric || null,
    canExecuteExternalAction: canExecute,
    blockedReasons: canExecute ? [] : ["missing-small-success-metric"],
    measurementAvailability: hasAcceptedMeasurement ? "available" : "measurement-not-available-yet",
    noSuccessInference: !hasAcceptedMeasurement,
  };
}

function buildLearningSummary(records) {
  const accepted = records.filter((record) => record.status === "accepted");
  const rejected = records.filter((record) => record.status === "rejected");
  const conflicts = accepted.length > 1 && new Set(accepted.map((record) => `${record.metric}:${record.value}`)).size > 1;
  const confidenceLevel = accepted.length >= 3 && !conflicts ? "medium" : "low";

  return {
    hypothesis: accepted[0]?.hypothesis ?? "נדרשת מדידה ממקור ברור לפני מסקנה.",
    result: accepted.length
      ? `${accepted.length} נקודות מדידה זמינות.`
      : "measurement not available yet",
    insight: accepted.length
      ? "זה סימן ראשוני בלבד, לא הוכחה."
      : "אין להסיק הצלחה בלי מקור מדידה.",
    conclusionLanguage: "initial-signal",
    confidenceLevel,
    conflictSummary: conflicts ? "מקורות שונים מציגים תוצאות שונות; אין מסקנה בטוחה." : null,
    rejectedCount: rejected.length,
  };
}

export function buildGrowthMeasurementTruth({
  project = null,
  growthAgent = null,
  records = [],
  externalAction = null,
  shareApproved = false,
} = {}) {
  const safeProject = normalizeObject(project);
  const safeGrowthAgent = normalizeObject(growthAgent);
  const measurementRecords = normalizeArray(records).map((record, index) =>
    createGrowthMeasurementRecord(record, { index }),
  );
  const externalActionGate = buildExternalActionGate({ externalAction, records: measurementRecords });
  const learningSummary = buildLearningSummary(measurementRecords);

  return {
    taskId: "GROW-MEASURE-001",
    measurementTruthId: `growth-measurement:${normalizeString(safeProject.id, "unknown-project")}`,
    projectId: normalizeString(safeProject.id, "unknown-project"),
    status: measurementRecords.some((record) => record.status === "accepted") ? "has-initial-signal" : "measurement-not-available-yet",
    internalOnlyByDefault: true,
    shareDemoVisibility: shareApproved === true ? "approved-summary-only" : "internal-only",
    requiredInternalEvents: REQUIRED_INTERNAL_EVENTS,
    records: measurementRecords,
    sourceSummary: measurementRecords.map((record) => ({
      measurementRecordId: record.measurementRecordId,
      source: record.source,
      sourceType: record.sourceType,
      metric: record.metric,
      status: record.status,
      rejectedReasons: record.rejectedReasons,
    })),
    externalActionGate,
    learningSummary,
    handoffs: {
      nextGrowthActionOwner: "growth-agent",
      nextGrowthAction: normalizeString(safeGrowthAgent.recommendedAction, "להגדיר מדד קטן לפני פעולה חיצונית."),
      productChangeOwner: "mutation-change-agent",
      productChangeAllowedHere: false,
    },
    userSummary: {
      title: "מדידה ראשונית",
      body: learningSummary.result,
      confidenceLevel: learningSummary.confidenceLevel,
      boundary: "מדידה אומרת מה קרה; היא לא משנה את המוצר ולא מוכיחה הצלחה לבד.",
    },
  };
}

export function summarizeGrowthMeasurementTruth(measurementTruth = {}) {
  const safeTruth = normalizeObject(measurementTruth);
  const summary = normalizeObject(safeTruth.learningSummary);
  const gate = normalizeObject(safeTruth.externalActionGate);

  return {
    taskId: normalizeString(safeTruth.taskId, "GROW-MEASURE-001"),
    status: normalizeString(safeTruth.status, "measurement-not-available-yet"),
    recordCount: normalizeArray(safeTruth.records).length,
    acceptedCount: normalizeArray(safeTruth.records).filter((record) => record.status === "accepted").length,
    sourceTypes: [...new Set(normalizeArray(safeTruth.records).map((record) => normalizeString(record.sourceType)).filter(Boolean))],
    measurementAvailability: normalizeString(gate.measurementAvailability, "measurement-not-available-yet"),
    noSuccessInference: gate.noSuccessInference !== false,
    confidenceLevel: normalizeString(summary.confidenceLevel, "low"),
    conclusionLanguage: normalizeString(summary.conclusionLanguage, "initial-signal"),
    hypothesis: normalizeString(summary.hypothesis, "נדרשת מדידה ממקור ברור לפני מסקנה."),
    result: normalizeString(summary.result, "measurement not available yet"),
    insight: normalizeString(summary.insight, "אין להסיק הצלחה בלי מקור מדידה."),
    shareDemoVisibility: normalizeString(safeTruth.shareDemoVisibility, "internal-only"),
    nextGrowthActionOwner: normalizeString(safeTruth.handoffs?.nextGrowthActionOwner, "growth-agent"),
    productChangeOwner: normalizeString(safeTruth.handoffs?.productChangeOwner, "mutation-change-agent"),
    productChangeAllowedHere: safeTruth.handoffs?.productChangeAllowedHere === true,
  };
}
