function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

const FORBIDDEN_VISIBLE_PATTERNS = [
  /adaptive intake agent/i,
  /חוזה קנוני/u,
  /provider|runtime|session|route|model|tradeoff|handoff|readiness|bounded/i,
  /\s->\s/,
];

export function resolveLiveConversationToneContract() {
  return {
    contractId: "wave4-live-conversation-tone-and-pacing-v1",
    status: "live",
    behaviors: [
      "one-question-at-a-time rhythm",
      "silent inference when family confidence is high",
      "clarify only on product-shaping ambiguity",
      "challenge weak assumptions without sounding diagnostic",
      "short apology and immediate reframe when the question was wrong",
      "rewrite hidden structure into human Hebrew on visible surfaces",
    ],
    forbiddenVisiblePatterns: FORBIDDEN_VISIBLE_PATTERNS.map((pattern) => String(pattern)),
  };
}

export function resolveHumanContractStatusLabel(statusLabel = "") {
  const normalized = normalizeString(statusLabel);
  if (normalized && !FORBIDDEN_VISIBLE_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return normalized;
  }
  return "ממה שכבר ברור לי";
}

export function resolveHumanConversationPathLabel(pathLabel = "") {
  const normalized = normalizeString(pathLabel);
  if (normalized && !FORBIDDEN_VISIBLE_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return normalized;
  }
  return "אני נשאר עם המשתמש, הכאב, והרגע שבו זה באמת נשבר עד שהתמונה נסגרת נכון.";
}

export function resolveHumanConversationPauseBadge() {
  return "עוצרים רגע כדי ליישר קו";
}

export function resolveHumanUnderstandingSubtitle(projectTypeLabel = "הפרויקט") {
  return `יש לי כבר תמונה די טובה של ${normalizeString(projectTypeLabel, "הפרויקט")}. אלה ארבע הנקודות שעליהן אני נשען כרגע.`;
}

export function resolveHumanWhyPauseHeading() {
  return "למה אני עוצר על זה רגע";
}

export function resolveHumanNextStepHeading() {
  return "מה נראה מיד אחר כך";
}

export function resolveHumanReasoningNotesHeading() {
  return "על מה אני נשען עכשיו";
}

export function resolveHumanDirectionHeading() {
  return "התמונה שמתחילה להיסגר";
}

export function resolveHumanContinuationHeading() {
  return "איך אני נשאר איתך על אותו הכיוון";
}

export function resolveHumanArtifactExpectationLine({ title = "", summary = "" } = {}) {
  const normalizedTitle = normalizeString(title);
  const normalizedSummary = normalizeString(summary);
  if (!normalizedTitle) {
    return "";
  }
  return `אם אני מחזיק את זה נכון, הצעד הבא הוא לבנות עכשיו ${normalizedTitle}.${normalizedSummary ? ` ${normalizedSummary}` : ""}`.trim();
}

export function resolveHumanLearningDirectionLine({ strategyLabel = "", reason = "", fallback = "" } = {}) {
  const normalizedReason = normalizeString(reason);
  if (normalizedReason) {
    return `כרגע הכיוון מתחדד סביב הדבר שהכי משנה את מה שנבנה. ${normalizedReason}`.trim();
  }
  const normalizedStrategy = normalizeString(strategyLabel);
  if (normalizedStrategy) {
    return normalizedStrategy.replace(/^הלמידה/u, "כרגע הכיוון").trim();
  }
  return normalizeString(fallback);
}

export function resolveHumanVisibleRuntimeShellLine(providerRuntime = {}) {
  if (providerRuntime?.healthStatus === "degraded") {
    return "אם יש עיכוב קטן ברקע, השיחה עצמה לא נשברת ואני ממשיך איתך מאותה נקודה.";
  }
  if (typeof providerRuntime?.availabilityLine === "string" && providerRuntime.availabilityLine.trim()) {
    return "אני ממשיך איתך עם מה שזמין כאן עכשיו, בלי לשבור את הרצף של השיחה.";
  }
  return "אני ממשיך איתך מאותה נקודה, ולא מתקדם לפני שברור מה באמת חשוב כאן.";
}
