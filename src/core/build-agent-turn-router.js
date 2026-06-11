function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasPattern(message, patterns = []) {
  const normalized = normalizeString(message).toLowerCase();
  return patterns.some((pattern) => pattern.test(normalized));
}

function classifyProviderScopedRequest(message = "") {
  const text = normalizeString(message);
  const patterns = [
    /וואטסאפ|whatsapp/iu,
    /תשלום|סליקה|חיוב|כרטיס אשראי|payment|checkout|charge|stripe/iu,
    /פרסם|לפרסם|תפרסם|שחרר|לשחרר|תשחרר|publish|deploy|release|go live|hosting/iu,
    /אימייל|מייל|email|newsletter|sendgrid|mailchimp/iu,
    /סושיאל|רשתות|קמפיין|פרסומת|ads?|campaign|facebook|instagram|tiktok|linkedin/iu,
    /תקציב|להוציא כסף|spend|budget|ad spend/iu,
    /וידאו|קריאייטיב|תמונה|מותג|לוגו|סרטון|brand|creative|image|video|motion|higgsfield|runway|canva|adobe/iu,
    /פיגמה|figma|design import|design export|ייבוא עיצוב|יצוא עיצוב/iu,
    /חבר|תחבר|connect|integration|provider|ספק חיצוני|אינטגרציה/iu,
    /תאמן|train|reference|דמות קבועה|מותג קבוע|brand kit/iu,
  ];
  return patterns.some((pattern) => pattern.test(text));
}

function routeLabel(owner) {
  const labels = {
    "visual-build-agent": "עיצוב ושלד חזותי",
    "mutation-change-agent": "שינוי אמת מוצר",
    "verification-qa-agent": "בדיקה",
    "release-agent": "שחרור",
    "history-continuity-agent": "המשך ושחזור",
    "build-loop-agent": "שיחת בנייה",
  };
  return labels[owner] ?? "שיחת בנייה";
}

export function createBuildAgentTurnDecision({
  project = {},
  message = "",
  learningInstructions = null,
} = {}) {
  const routingHints = normalizeArray(learningInstructions?.routingHints);
  const text = normalizeString(message);
  const skeletonChoiceTruth = project?.skeletonChoiceTruth ?? project?.context?.skeletonChoiceTruth ?? project?.state?.skeletonChoiceTruth ?? {};

  let intent = "question";
  let owner = "build-loop-agent";
  let status = "answer-only";
  let requiresApproval = false;
  let mayClaimChanged = false;
  let reason = "זו שאלה או בקשת הבהרה, ולכן אין שינוי מוצר להצגה.";

  if (routingHints.includes("provider-release-boundary") || classifyProviderScopedRequest(text)) {
    intent = hasPattern(text, [/פרסם|לפרסם|שחרר|לשחרר|publish|deploy|release|go live|hosting/])
      ? "release-request"
      : "provider-capability-request";
    owner = intent === "release-request" ? "release-agent" : "mutation-change-agent";
    status = "blocked-or-approval-required";
    requiresApproval = true;
    reason = "הבקשה דורשת שער ספקים, הרשאה ואישור מפורש, ולכן אסור להציג אותה כשינוי או פעולה שבוצעו.";
  } else if (routingHints.includes("prior-failure-requires-retry-or-clarification")) {
    intent = "retry-after-failed-mutation";
    owner = "mutation-change-agent";
    status = "retry-or-clarification-required";
    requiresApproval = true;
    reason = "ניסיון שינוי קודם נכשל, ולכן אסור להפעיל שינוי נוסף לפני ניסיון חוזר ברור או הבהרה.";
  } else if (hasPattern(text, [/בדוק|תבדוק|עובד|בדיקה|test|check|verify/])) {
    intent = "verification-request";
    owner = "verification-qa-agent";
    status = "routed";
    reason = "הבקשה היא לבדוק את השלד, ולכן היא צריכה לעבור למסלול בדיקה ולא לשינוי מוצר.";
  } else if (hasPattern(text, [
    /הזמנות במקום לידים|לא לידים|actually.*orders|orders.*not leads|שנה את המוצר|תשנה את המוצר/,
    // BUILD-SPEECH-TRUTH-001: generalized product-direction wording must reach the
    // approval path instead of falling through to a confident chat reply.
    /במקום (ה)?(לידים|רשומות|הזמנות|לקוחות|משימות)/,
    /תהפוך את (זה|המוצר|האפליקציה|הכלי) ל(אפליקציי?ת|כלי|מוצר|מערכת|חנות|אתר|משחק)/,
    /שנה את הכיוון של המוצר|turn (this|it) into a|make (this|it) (a|an) (different|new) product|change (the )?product/,
  ])) {
    intent = "product-truth-change";
    owner = "mutation-change-agent";
    status = "approval-required";
    requiresApproval = true;
    reason = "זו החלפת אמת מוצרית, ולכן צריך אישור והשפעה לפני שינוי השלד.";
  } else if (hasPattern(text, [/יבש|dry|premium|פרימיום|wow|וואו|יוקרתי|יוקרתי יותר|style switch|שפת עיצוב/])) {
    intent = "visual-style-change";
    owner = "visual-build-agent";
    status = "approval-required";
    requiresApproval = true;
    reason = "זו בקשת שינוי סגנון משמעותית, ולכן צריך אישור לפני החלפת הכיוון החזותי.";
  } else if (hasPattern(text, [/סלאש|splash|צבע|עיצוב|כפתור|מסך|כרטיס|כרטיסים|מעקב היום|חזרה היום|follow.?up|layout|design|screen|button|card/])) {
    intent = "visual-change";
    owner = "visual-build-agent";
    status = "routed";
    reason = "זו בקשה חזותית, ולכן היא נשלחת למסלול בנייה חזותית לפני טענת שינוי.";
  } else if (routingHints.includes("mutation-required-before-success")) {
    intent = "small-safe-change";
    owner = "mutation-change-agent";
    status = "mutation-required";
    reason = "זו בקשת שינוי קטנה, אבל עדיין צריך רישום שינוי אמיתי לפני שמותר להגיד שהיא בוצעה.";
  } else if (hasPattern(text, [/המשך|תמשיך|retry|נסה שוב|שחזר|refresh|restore/])) {
    intent = "continuation";
    owner = "history-continuity-agent";
    status = "routed";
    reason = "זו בקשת המשך או שחזור, ולכן היא שייכת למסלול המשכיות.";
  }

  return {
    taskId: "BLD-AGT-001",
    decisionId: `build-agent-turn:${normalizeString(project.id, "project")}:${Date.now()}`,
    projectId: normalizeString(project.id, ""),
    intent,
    owner,
    ownerLabel: routeLabel(owner),
    status,
    requiresApproval,
    mayClaimChanged,
    speechBoundary: mayClaimChanged
      ? "reply-may-describe-applied-change"
      : "reply-must-not-claim-product-change",
    reason,
    learningInstructionStatus: normalizeString(learningInstructions?.status, "empty"),
    runtimeSkeletonId: normalizeString(learningInstructions?.runtimeSkeletonId, ""),
    productDomainSkeletonId: normalizeString(learningInstructions?.productDomainSkeletonId, ""),
    selectedSkeletonCandidateId: normalizeString(skeletonChoiceTruth.selectedSkeletonCandidateId, ""),
    selectedCompositionStyle: normalizeString(skeletonChoiceTruth.selectedCompositionStyle, ""),
    selectedProductDirection: normalizeString(skeletonChoiceTruth.selectedProductDirection, ""),
    skeletonChoiceStatus: normalizeString(skeletonChoiceTruth.status, ""),
  };
}
