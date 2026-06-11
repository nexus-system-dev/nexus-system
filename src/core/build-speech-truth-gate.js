// BUILD-SPEECH-TRUTH-001 — No fake success speech and arbitrary-change truth gate.
//
// Canonical law:
// - Nexus may not say a product change was applied unless a real downstream result actually changed.
// - Provider or agent speech is not truth. Speech must be gated by the downstream result.
// - If a requested change cannot be applied, Nexus must say so, ask a precise clarification,
//   or route it to the correct pending owner.

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

const EXTERNAL_ACTION_PATTERNS = [
  /וואטסאפ|whatsapp/iu,
  /תשלום|סליקה|חיוב|כרטיס אשראי|payment|checkout|charge|billing|stripe/iu,
  /פרסם|לפרסם|תפרסם|שחרר|לשחרר|תשחרר|publish|deploy|release|go live|hosting/iu,
  /אימייל|מייל|email|newsletter|sendgrid|mailchimp/iu,
  /סושיאל|רשתות|קמפיין|פרסומת|ads?|campaign|facebook|instagram|tiktok|linkedin/iu,
  /תקציב|להוציא כסף|spend|budget|ad spend/iu,
  /וידאו|קריאייטיב|תמונה|מותג|לוגו|סרטון|brand|creative|image|video|motion|higgsfield|runway|canva|adobe/iu,
  /פיגמה|figma|design import|design export|ייבוא עיצוב|יצוא עיצוב/iu,
  /ספק חיצוני|חיבור אמיתי|אינטגרציה|provider|integration/iu,
  /אפסטור|חנות האפליקציות|app ?store|דומיין|domain/iu,
  /תאמן|train|reference|דמות קבועה|מותג קבוע|brand kit/iu,
];

const VERIFICATION_PATTERNS = [
  /בדוק|תבדוק|בדקי|בדיקה|עובד\s*\?|test|check|verify/iu,
];

const PRODUCT_DIRECTION_PATTERNS = [
  /במקום (ה)?(לידים|רשומות|הזמנות|לקוחות|משימות)/iu,
  /תהפוך את (זה|המוצר|האפליקציה|הכלי)/iu,
  /שנה את (המוצר|הכיוון|האפליקציה)/iu,
  /(שזה|שהמוצר) יהיה (בכלל|משהו אחר)/iu,
  /turn (this|it) into/iu,
  /make (this|it) (a|an) /iu,
  /change (the )?(product|direction)/iu,
];

const FIELD_ADD_PATTERNS = [
  /(תוסיף|תוסיפי|הוסף|הוסיפי|להוסיף|צריך|רוצה|add|create)[^.!?]*(שדה|עמודה|field|column)/iu,
  /(שדה|עמודה|field|column)[^.!?]*(חדש|חדשה|נוסף|נוספת|new)/iu,
];

const SCREEN_ADD_PATTERNS = [
  /(תוסיף|הוסף|להוסיף|תבנה|add|create|build)[^.!?]*(מסך|עמוד|דף|screen|page)/iu,
];

const ACTION_ADD_PATTERNS = [
  /(תוסיף|הוסף|להוסיף|add|create)[^.!?]*(כפתור|פעולה|button|action)/iu,
];

const COPY_CHANGE_PATTERNS = [
  /(שנה|תשנה|תחליף|החלף|עדכן|תעדכן|תקן|rename|change|update)[^.!?]*(כותרת|טקסט|ניסוח|תווית|שם של|copy|title|text|label|wording)/iu,
];

function hasAnyPattern(message, patterns = []) {
  const text = normalizeString(message);
  return patterns.some((pattern) => pattern.test(text));
}

export function classifyBuildSpeechRequestClass(message = "") {
  const text = normalizeString(message);
  if (!text) {
    return "other";
  }
  if (hasAnyPattern(text, EXTERNAL_ACTION_PATTERNS)) {
    return "external-action";
  }
  if (hasAnyPattern(text, VERIFICATION_PATTERNS)) {
    return "verification";
  }
  if (hasAnyPattern(text, PRODUCT_DIRECTION_PATTERNS)) {
    return "product-direction";
  }
  if (hasAnyPattern(text, FIELD_ADD_PATTERNS)) {
    return "field-add";
  }
  if (hasAnyPattern(text, SCREEN_ADD_PATTERNS)) {
    return "screen-add";
  }
  if (hasAnyPattern(text, ACTION_ADD_PATTERNS)) {
    return "action-add";
  }
  if (hasAnyPattern(text, COPY_CHANGE_PATTERNS)) {
    return "copy-change";
  }
  return "other";
}

const FIELD_NAME_TRAILING_NOISE = /\s+(לכל|בכל|עבור|אצל|בתוך|של כל|ל)\s+\S.*$/u;
const FIELD_NAME_ENGLISH_TRAILING_NOISE = /\s+(for|to|on)\s+(each|every|all)\b.*$/iu;

export function extractRequestedFieldName(message = "") {
  const text = normalizeString(message);
  if (!text) {
    return "";
  }
  const hebrewMatch = text.match(
    /(?:שדה|עמודה)(?:\s+(?:חדש|חדשה))?(?:\s+(?:של|בשם|שנקרא|שנקראת))?\s+["'״]?([^,."'״!?]+)/u,
  );
  const englishMatch = text.match(
    /(?:field|column)(?:\s+(?:called|named))?\s+["']?([A-Za-z][\w ]*)/iu,
  );
  let candidate = normalizeString(hebrewMatch?.[1] ?? englishMatch?.[1], "");
  if (!candidate) {
    return "";
  }
  candidate = candidate
    .replace(FIELD_NAME_TRAILING_NOISE, "")
    .replace(FIELD_NAME_ENGLISH_TRAILING_NOISE, "")
    .replace(/\s+(בבקשה|עכשיו|please|now)$/iu, "")
    .trim();
  if (!candidate || /^(חדש|חדשה|new)$/iu.test(candidate)) {
    return "";
  }
  return candidate;
}

// Generalized free-text mutation resolver. Runs only when the trained downstream
// resolver (BLD-AGT-001) returned routed-only, so trained safe operations are preserved.
export function resolveFreeTextMutationOperation({ message = "", buildAgentTurn = null } = {}) {
  const turn = normalizeObject(buildAgentTurn);
  const requestClass = classifyBuildSpeechRequestClass(message);

  if (
    turn.requiresApproval === true
    || turn.status === "blocked-or-approval-required"
    || requestClass === "external-action"
    || requestClass === "verification"
  ) {
    return null;
  }

  if (requestClass === "product-direction") {
    return {
      shouldApply: false,
      status: "approval-or-boundary-required",
      requestClass,
      resolvedBy: "BUILD-SPEECH-TRUTH-001",
      reason: "זו החלפת כיוון מוצרית, ולכן היא ממתינה לאישור לפני שינוי אמיתי.",
    };
  }

  if (requestClass === "field-add" && turn.owner !== "mutation-change-agent") {
    return null;
  }

  if (requestClass === "field-add") {
    const fieldName = extractRequestedFieldName(message);
    if (!fieldName) {
      return {
        shouldApply: false,
        status: "clarification-needed",
        requestClass,
        resolvedBy: "BUILD-SPEECH-TRUTH-001",
        reason: "כדי להוסיף שדה אמיתי חסר שם ברור לשדה החדש.",
        clarificationQuestion: "איך לקרוא לשדה החדש?",
      };
    }
    return {
      shouldApply: true,
      owner: "mutation-change-agent",
      operationId: "record.addField",
      payload: {
        fieldName,
        defaultValue: "לא סומן",
      },
      requestClass,
      resolvedBy: "BUILD-SPEECH-TRUTH-001",
      visibleSummary: `נוסף שדה ${fieldName} לרשומות ולשלד, כחלק מאמת הפרויקט.`,
    };
  }

  if (requestClass === "screen-add" || requestClass === "action-add" || requestClass === "copy-change") {
    // No trained visual/mutation operation matched this request. Routing it onward
    // with confident language would be fake routing: nothing downstream can apply it.
    const labels = {
      "screen-add": "הוספת מסך חדש",
      "action-add": "הוספת כפתור או פעולה חדשה",
      "copy-change": "שינוי ניסוח או כותרת",
    };
    return {
      shouldApply: false,
      status: "unsupported-not-yet",
      requestClass,
      resolvedBy: "BUILD-SPEECH-TRUTH-001",
      reason: `${labels[requestClass]} עדיין לא נתמכת כשינוי אוטומטי בטוח, ולכן אסור להציג אותה כשינוי שבוצע.`,
    };
  }

  return null;
}

// Success-claim detection. Negated phrases ("לא בוצע", "עדיין לא הוספתי") are stripped first
// so truthful bounded copy does not register as a claim.
const NEGATION_STRIP_PATTERNS = [
  /(?:לא|אי אפשר|אסור|בלי|מבלי|טרם|עדיין לא)\s*(?:ש)?(?:בוצע|בוצעה|נוסף|נוספה|עודכן|עודכנה|שונה|שונתה|הוחל|הוחלה|נשמר|נשמרה|הוספתי|עדכנתי|שיניתי|ביצעתי|החלתי|הצלחתי להחיל|יכול להחיל|יודע להחיל)[֐-׿]*/gu,
  /(?:not|hasn't|haven't|wasn't|won't|cannot|can't|didn't|isn't)\s+(?:been\s+)?(?:applied|added|updated|changed|created|done)/giu,
  // Clause-level negations and conditions: "עד ש...", "לפני ש...", "לא אגיד ש...",
  // "ולא כהצלחה שבוצעה" — claim words inside these clauses are not success claims.
  /עד ש[^.!?]*/gu,
  /לפני ש[^.!?]*/gu,
  /(?:ו)?לא\s+(?:אגיד|אומר|אציג|אטען|נגיד|אסמן)[^.!?]*/gu,
  /(?:ו)?לא\s+כ?הצלחה[^.!?]*/gu,
];

const SUCCESS_CLAIM_PATTERNS = [
  /הוספתי|עדכנתי|שיניתי|יצרתי|החלתי|ביצעתי|הסרתי|מחקתי/u,
  /נוסף|נוספה|עודכן|עודכנה|שונה|שונתה|הוסר|הוסרה|בוצע|בוצעה|הושלם|הושלמה|הוחל|הוחלה/u,
  /מעדכן (?:עכשיו|ומייצר|את)|מייצר שלד|מוסיף (?:עכשיו|את)/u,
  /השינוי (?:נשמר|הוחל|נכנס|מוכן ומחובר)/u,
  /\bdone\b|\bapplied\b/iu,
  /i (?:have )?(?:added|updated|changed|created|applied)/iu,
  /(?:has|have) been (?:added|updated|changed|created|applied)/iu,
  /is now (?:added|updated|changed|live)/iu,
];

export function replyClaimsAppliedChange(reply = "") {
  let text = normalizeString(reply);
  if (!text) {
    return false;
  }
  for (const pattern of NEGATION_STRIP_PATTERNS) {
    text = text.replace(pattern, " ");
  }
  return SUCCESS_CLAIM_PATTERNS.some((pattern) => pattern.test(text));
}

export function resolveBuildSpeechState({
  buildAgentTurn = null,
  downstreamAction = null,
  downstreamResult = null,
  mutationChangeDecision = null,
} = {}) {
  const turn = normalizeObject(buildAgentTurn);
  const action = normalizeObject(downstreamAction);
  const result = normalizeObject(downstreamResult);
  const decision = normalizeObject(mutationChangeDecision);

  if (result.status === "applied" && normalizeString(result.mutationId)) {
    return "applied";
  }
  if (result.status === "applied" || result.status === "failed-safely") {
    return "failed";
  }
  if (
    decision.requiresApproval === true
    || turn.requiresApproval === true
    || turn.status === "blocked-or-approval-required"
    || action.status === "approval-or-boundary-required"
  ) {
    return "pending-approval";
  }
  if (action.status === "unsupported-not-yet") {
    return "unsupported-not-yet";
  }
  if (
    action.status === "clarification-needed"
    || turn.status === "retry-or-clarification-required"
    || decision.status === "needs-clarification"
    || turn.status === "mutation-required"
  ) {
    return "clarification-needed";
  }
  if (
    ["verification-qa-agent", "release-agent", "history-continuity-agent", "visual-build-agent"].includes(turn.owner)
    || turn.status === "routed"
  ) {
    return "routed";
  }
  return "answer-only";
}

const SPEECH_STATE_USER_COPY = {
  failed: "ניסיתי להעביר את הבקשה למסלול שינוי אמיתי, אבל היא לא נסגרה כהצלחה והמוצר נשאר כמו שהיה. אפשר לנסות ניסוח ממוקד יותר או לבקש ממני להציע דרך אחרת.",
  "pending-approval": "זה שינוי שמשפיע על כיוון המוצר, ולכן הוא ממתין לאישור שלך לפני שינוי אמיתי. עד אז המוצר נשאר בדיוק כמו שהוא.",
  "clarification-needed": "אני רוצה שזה יקרה באמת במוצר ולא רק בשיחה, וחסר לי פרט אחד כדי להמשיך בבטחה.",
  "unsupported-not-yet": "את הסוג הזה של שינוי אני עדיין לא יודע להחיל בעצמי, אז אני לא אציג אותו כאילו קרה. המוצר נשאר כמו שהוא, והבקשה נשמרה אצלי כבקשה פתוחה.",
  routed: "הבקשה הזאת שייכת למסלול ייעודי, אז העברתי אותה לשם. אני לא אציג תוצאה לפני שיש תוצאה אמיתית.",
  "answer-only": "כדי לא להטעות אותך: ההודעה הזאת לא שינתה את המוצר. אם אתה רוצה שינוי אמיתי, נסח אותו ואני אעביר אותו למסלול שינוי.",
};

function boundedReplyFor({ speechState, downstreamAction, downstreamResult }) {
  const action = normalizeObject(downstreamAction);
  const result = normalizeObject(downstreamResult);
  const base = SPEECH_STATE_USER_COPY[speechState] ?? SPEECH_STATE_USER_COPY["answer-only"];
  if (speechState === "clarification-needed") {
    const question = normalizeString(action.clarificationQuestion, "מה בדיוק אתה רוצה שישתנה במוצר?");
    return `${base} ${question}`;
  }
  if (speechState === "failed") {
    const error = normalizeString(result.error, "");
    return error ? `${base}` : base;
  }
  return base;
}

// The speech boundary gate. Forces every visible Build reply into one truthful state:
// applied | pending-approval | clarification-needed | unsupported-not-yet | failed | routed | answer-only.
export function enforceBuildSpeechBoundary({
  candidateReply = "",
  candidateSource = "shell",
  message = "",
  buildAgentTurn = null,
  downstreamAction = null,
  downstreamResult = null,
  mutationChangeDecision = null,
  now = new Date().toISOString(),
} = {}) {
  const speechState = resolveBuildSpeechState({
    buildAgentTurn,
    downstreamAction,
    downstreamResult,
    mutationChangeDecision,
  });
  const action = normalizeObject(downstreamAction);
  const requestClass = normalizeString(action.requestClass, classifyBuildSpeechRequestClass(message));
  const result = normalizeObject(downstreamResult);
  const candidate = normalizeString(candidateReply, "");
  const isProviderSpeech = candidateSource === "provider";
  // States introduced by the free-text resolver are unknown to the legacy shell reply
  // builder, so they always need explicit bounded copy.
  const resolverIntroducedState = action.resolvedBy === "BUILD-SPEECH-TRUTH-001"
    && action.shouldApply !== true;

  let reply = candidate;
  let replyWasRewritten = false;

  if (speechState === "applied") {
    reply = candidate || `${normalizeString(result.visibleSummary, "השינוי נרשם באמת הפרויקט.")}`;
  } else if (resolverIntroducedState) {
    const bounded = boundedReplyFor({ speechState, downstreamAction, downstreamResult });
    replyWasRewritten = Boolean(candidate) && candidate !== bounded;
    reply = bounded;
  } else if (isProviderSpeech && (speechState === "failed" || speechState === "unsupported-not-yet")) {
    // Provider speech after a failed/unsupported downstream result must be explicit truth.
    const bounded = boundedReplyFor({ speechState, downstreamAction, downstreamResult });
    replyWasRewritten = reply !== bounded;
    reply = bounded;
  } else if ((isProviderSpeech && replyClaimsAppliedChange(candidate)) || !candidate) {
    const bounded = boundedReplyFor({ speechState, downstreamAction, downstreamResult });
    replyWasRewritten = Boolean(candidate);
    reply = bounded;
  }

  return {
    taskId: "BUILD-SPEECH-TRUTH-001",
    speechState,
    requestClass,
    reply,
    replyWasRewritten,
    mayClaimChanged: speechState === "applied",
    appliedMutationId: speechState === "applied" ? normalizeString(result.mutationId, "") : "",
    appliedOperationId: speechState === "applied" ? normalizeString(result.operationId, "") : "",
    requestText: normalizeString(message, ""),
    reason: normalizeString(
      normalizeObject(downstreamAction).reason,
      normalizeString(normalizeObject(buildAgentTurn).reason, ""),
    ),
    recordedAt: now,
  };
}

// Persisted history that distinguishes requested-but-not-applied from applied changes.
export function appendBuildSpeechHistory(project = {}, speechTruth = {}) {
  const safeProject = normalizeObject(project);
  const truth = normalizeObject(speechTruth);
  if (truth.taskId !== "BUILD-SPEECH-TRUTH-001") {
    return normalizeArray(safeProject.buildSpeechHistory);
  }
  return [
    ...normalizeArray(
      safeProject.buildSpeechHistory
      ?? safeProject.context?.buildSpeechHistory
      ?? safeProject.state?.buildSpeechHistory,
    ),
    {
      historyRecordId: `build-speech:${normalizeString(safeProject.id, "project")}:${Date.parse(truth.recordedAt) || Date.now()}`,
      taskId: "BUILD-SPEECH-TRUTH-001",
      projectId: normalizeString(safeProject.id, ""),
      requestText: truth.requestText,
      requestClass: truth.requestClass,
      speechState: truth.speechState,
      applied: truth.speechState === "applied",
      appliedMutationId: truth.appliedMutationId,
      appliedOperationId: truth.appliedOperationId,
      replyWasRewritten: truth.replyWasRewritten === true,
      recordedAt: truth.recordedAt,
    },
  ];
}
