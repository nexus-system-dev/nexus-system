function truncateText(value, maxLength = 64) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }

  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function detectProjectTypeFromText(value = "") {
  const normalized = String(value ?? "").toLowerCase();
  if (/(landing page|landing-page|website|marketing site|marketing page|homepage|web site|site|דף נחיתה|אתר שיווקי|שיווק)/i.test(normalized)) {
    return "landing-page";
  }
  if (/(ecommerce|e-commerce|commerce|catalog|inventory|orders|merchant|fulfillment|storefront|sku|cart|checkout|מבצעים|קטלוג|מלאי|הזמנות|חנות|מרצ'נט|סליקה|משלוחים|תפעול מסחר)/i.test(normalized)) {
    return "commerce-ops";
  }
  if (/(internal tool|ops|operations|backoffice|back office|admin panel|portal|workspace|queue|תפעול|צוות פנימי|כלי פנימי)/i.test(normalized)) {
    return "internal-tool";
  }
  if (/(mobile app|react native|expo|ios|android|אפליקציה)/i.test(normalized)) {
    return "mobile-app";
  }
  if (/(saas|subscription|mvp|web app|platform|crm|customer|client|follow-up|reminder|dashboard|מערכת|כלי|לקוחות)/i.test(normalized)) {
    return "saas";
  }
  return "unknown";
}

function resolveAnswers(onboardingConversation = null) {
  return normalizeObject(onboardingConversation?.answers);
}

function resolveSummary(onboardingConversation = null) {
  return normalizeObject(onboardingConversation?.summary);
}

function resolveProjectType(summary = {}, onboardingFlow = null) {
  return typeof summary.projectType === "string" && summary.projectType.trim()
    ? summary.projectType.trim()
    : detectProjectTypeFromText(onboardingFlow?.visionText ?? "");
}

function resolveProjectTypeLabel(summary = {}, onboardingFlow = null) {
  const projectType = resolveProjectType(summary, onboardingFlow);
  return typeof summary.projectTypeLabel === "string" && summary.projectTypeLabel.trim()
    ? summary.projectTypeLabel.trim()
    : projectType === "landing-page"
      ? "דף נחיתה / שיווק"
      : projectType === "commerce-ops"
        ? "מערכת מסחר ותפעול"
      : projectType === "internal-tool"
        ? "כלי פנימי"
        : projectType === "saas"
          ? "מוצר SaaS / follow-up"
          : projectType === "mobile-app"
            ? "אפליקציה"
            : "הפרויקט";
}

function buildExpectationId(projectType, title) {
  return `artifact-expectation:${projectType}:${String(title ?? "artifact").toLowerCase().replace(/\s+/g, "-")}`;
}

function resolveArtifactExpectation({ currentProject = null } = {}) {
  return normalizeObject(
    currentProject?.artifactExpectation
      ?? currentProject?.context?.artifactExpectation
      ?? currentProject?.onboardingStateHandoff?.artifactExpectation
      ?? currentProject?.context?.onboardingStateHandoff?.artifactExpectation,
  );
}

function resolveGenerationIntent({ currentProject = null } = {}) {
  return normalizeObject(
    currentProject?.generationIntent
      ?? currentProject?.context?.generationIntent
      ?? currentProject?.aiDesignRequest?.generationIntent
      ?? currentProject?.context?.aiDesignRequest?.generationIntent,
  );
}

function deriveConversationArtifactExpectation({ onboardingConversation = null, onboardingFlow = null } = {}) {
  const answers = resolveAnswers(onboardingConversation);
  const summary = resolveSummary(onboardingConversation);
  const projectType = resolveProjectType(summary, onboardingFlow);
  const projectName = String(onboardingFlow?.projectName ?? "").trim();
  const audience = String(answers["target-audience"] ?? "").trim();
  const problem = String(answers["core-problem"] ?? "").trim();
  const solution = String(answers["successful-solution"] ?? "").trim();

  if (projectType === "landing-page") {
    const title = projectName ? `${projectName} landing page` : "Landing page";
    return {
      expectationId: buildExpectationId("landing-page", title),
      projectType: "landing-page",
      projectTypeLabel: "דף נחיתה / שיווק",
      proofArtifactType: "landing-page",
      title,
      summary: solution || "דף נחיתה חד עם הבטחה ברורה, הוכחת אמון וקריאה אחת לפעולה.",
      proofFocus: [
        "הבטחה ראשית מעל הקפל",
        "הוכחת אמון שתומכת בהחלטה",
        "CTA מרכזי אחד שקל להבין",
      ],
      understandingLine: `אם הסיכום נכון, Nexus צריך לבנות עכשיו ${projectName ? `${projectName} landing page` : "Landing page"} שמדבר אל ${audience || "הקהל"} ומטפל ישירות ב-${problem || "הכאב המרכזי"}.`,
      continuityLine: `בתצוגה שנפתח נרצה לראות ${title} עם הבטחה ברורה, אמון ופעולה מיידית עבור ${audience || "הקהל"}.`,
    };
  }
  if (projectType === "internal-tool") {
    const title = projectName ? `${projectName} משטח עבודה` : "משטח עבודה פנימי";
    return {
      expectationId: buildExpectationId("internal-tool", title),
      projectType: "internal-tool",
      projectTypeLabel: "כלי פנימי",
      proofArtifactType: "internal-ops-dashboard",
      title,
      summary: solution || "משטח עבודה פנימי עם תור עבודה ברור, בעלות ברורה, רמת שירות והפעולה הבאה.",
      proofFocus: [
        "תור עבודה גלוי עם חלוקה ברורה",
        "בעלות ברורה על כל פריט",
        "פעולה הבאה שניתנת לביצוע מיד",
      ],
      understandingLine: `אם הסיכום נכון, Nexus צריך לבנות עכשיו ${title} עבור ${audience || "הצוות"} כך שהאחראי, רמת השירות והפעולה הבאה יהיו ברורים מיד.`,
      continuityLine: `בתצוגה שנפתח נרצה לראות ${title} עם תור עבודה חי, בעלות גלויה ופעולה הבאה שכל נציג מבין מיד.`,
    };
  }
  if (projectType === "commerce-ops") {
    const title = projectName ? `${projectName} commerce workspace` : "Commerce workspace";
    return {
      expectationId: buildExpectationId("commerce-ops", title),
      projectType: "commerce-ops",
      projectTypeLabel: "מערכת מסחר ותפעול",
      proofArtifactType: "commerce-ops-dashboard",
      title,
      summary: solution || "מרחב מסחר ותפעול עם תור הזמנות, שליטה בקטלוג ופעולה הבאה של הצוות.",
      proofFocus: [
        "תור הזמנות ברור עם עדיפות נוכחית",
        "מצב קטלוג ומלאי שאפשר לפעול ממנו מיד",
        "פעולת תפעול אחת ברורה שמקדמת את המסחר עכשיו",
      ],
      understandingLine: `אם הסיכום נכון, Nexus צריך לבנות עכשיו ${title} עבור ${audience || "צוות המסחר"} כך שהזמנות, קטלוג והפעולה הבאה יהיו ברורים מיד סביב ${problem || "צוואר הבקבוק התפעולי"}.`,
      continuityLine: `בתצוגה שנפתח נרצה לראות ${title} עם תור הזמנות פעיל, מצב קטלוג גלוי ופעולה תפעולית אחת שכל נציג יודע לבצע מיד.`,
    };
  }
  if (projectType === "saas") {
    const title = projectName ? `${projectName} product workspace` : "Product workspace";
    return {
      expectationId: buildExpectationId("saas", title),
      projectType: "saas",
      projectTypeLabel: "מוצר SaaS / follow-up",
      proofArtifactType: "generated-surface",
      title,
      summary: solution || "מוצר SaaS ראשון עם זרימת עבודה ברורה ופעולה ראשונה שקל להבין.",
      proofFocus: [
        "מסך ראשון ברור למשתמש",
        "פעולה ראשונה שאפשר להבין מיד",
        "משטח מוצרי שמטפל בכאב המרכזי",
      ],
      understandingLine: `אם הסיכום נכון, Nexus צריך לבנות עכשיו ${projectName ? `${projectName} product workspace` : "Product workspace"} עבור ${audience || "המשתמש"} כך שהפעולה הבאה סביב ${problem || "הכאב המרכזי"} תהיה ברורה.`,
      continuityLine: `בתצוגה שנפתח נרצה לראות ${title} שממחיש פעולה ראשונה, מצב עבודה ברור ותועלת ישירה עבור ${audience || "המשתמש"}.`,
    };
  }
  if (projectType === "mobile-app") {
    const title = projectName ? `${projectName} mobile flow` : "Mobile flow";
    return {
      expectationId: buildExpectationId("mobile-app", title),
      projectType: "mobile-app",
      projectTypeLabel: "אפליקציה",
      proofArtifactType: "mobile-app",
      title,
      summary: solution || "זרימת מובייל ראשונה עם מסך פתיחה ברור, פעולה ראשונה מובנת ומעבר נקי לצעד הבא.",
      proofFocus: [
        "מסך ראשון ברור למשתמש הנכון",
        "פעולה ראשונה שאפשר להבין בלי הדרכה",
        "זרימה ניידת שמטפלת ישירות בכאב המרכזי",
      ],
      understandingLine: `אם הסיכום נכון, Nexus צריך לבנות עכשיו ${title} עבור ${audience || "המשתמש"} כך שהמסך הראשון והפעולה הראשונה יהיו ברורים מיד סביב ${problem || "הכאב המרכזי"}.`,
      continuityLine: `בתצוגה שנפתח נרצה לראות ${title} עם מסך ראשון ברור, פעולה ראשונה מובנת וזרימה ניידת שמשרתת את ${audience || "המשתמש"}.`,
    };
  }

  return {};
}

function buildGenerationGoal(artifactExpectation = {}) {
  if (artifactExpectation.projectType === "landing-page") {
    return `${artifactExpectation.title || "The landing page"} should make the promise, trust proof, and one clear CTA visible before Proof.`;
  }
  if (artifactExpectation.projectType === "commerce-ops") {
    return `${artifactExpectation.title || "The commerce workspace"} should make the active order queue, catalog pressure, and next operational action visible before Proof.`;
  }
  if (artifactExpectation.projectType === "mobile-app") {
    return `${artifactExpectation.title || "The mobile flow"} should make the first screen, first action, and next-step continuity visible before Proof.`;
  }
  return artifactExpectation.summary ?? null;
}

export function buildOnboardingArtifactExpectationPreview({
  currentProject = null,
  onboardingFlow = null,
  onboardingConversation = null,
} = {}) {
  const artifactExpectation = resolveArtifactExpectation({ currentProject });
  return artifactExpectation.title
    ? artifactExpectation
    : deriveConversationArtifactExpectation({ onboardingConversation, onboardingFlow });
}

export function buildOnboardingGenerationIntentPreview({
  currentProject = null,
  onboardingFlow = null,
  onboardingConversation = null,
} = {}) {
  const artifactExpectation = buildOnboardingArtifactExpectationPreview({
    currentProject,
    onboardingFlow,
    onboardingConversation,
  });
  if (!artifactExpectation.expectationId) {
    return null;
  }

  const projectType = artifactExpectation.projectType ?? "unknown";
  return {
    intentId: `generation-intent:${projectType}:${(artifactExpectation.title ?? "artifact").toLowerCase().replace(/\s+/g, "-")}`,
    source: "onboarding-artifact-expectation",
    status: "ready",
    projectType,
    projectTypeLabel: artifactExpectation.projectTypeLabel ?? "Project",
    artifactTitle: artifactExpectation.title ?? "Artifact",
    artifactSummary: artifactExpectation.summary ?? null,
    proofArtifactType: artifactExpectation.proofArtifactType ?? "generated-surface",
    framingLine: artifactExpectation.continuityLine ?? artifactExpectation.understandingLine ?? null,
    generationGoal: buildGenerationGoal(artifactExpectation),
    focusAreas: Array.isArray(artifactExpectation.proofFocus) ? artifactExpectation.proofFocus : [],
    primaryAction: {
      label: projectType === "landing-page"
        ? "Open primary CTA"
        : projectType === "commerce-ops"
          ? "Open the next operating action"
        : projectType === "mobile-app"
          ? "Start the first mobile action"
          : "Review artifact",
      actionIntent: projectType === "landing-page"
        ? "convert"
        : projectType === "commerce-ops"
          ? "operate"
        : projectType === "mobile-app"
          ? "start-flow"
          : "review",
    },
    weakClass: ["landing-page", "mobile-app"].includes(projectType),
  };
}

function resolveAudienceCard(answers = {}, summary = {}) {
  const audience = String(answers["target-audience"] ?? "").trim();
  const refined = Array.isArray(summary.understoodItems)
    ? summary.understoodItems.find((item) => typeof item === "string" && item.includes("קהל"))
    : "";

  return {
    label: "קהל יעד",
    icon: "👥",
    title: audience || "קהל היעד עדיין לא הושלם",
    body: refined || (audience
      ? "זה המשתמש המרכזי שעבורו בונים את החוויה הראשונה של הפרויקט."
      : "צריך לחדד מי המשתמש המרכזי של המוצר כדי שנוכל להחליט מה חשוב לבנות קודם."),
  };
}

function resolveProblemCard(answers = {}, summary = {}) {
  const problem = String(answers["core-problem"] ?? "").trim();
  const projectType = resolveProjectType(summary);
  const refined = Array.isArray(summary.missingItems)
    ? summary.missingItems.find((item) => typeof item === "string" && (item.includes("בעיה") || item.includes("כאב") || item.includes("צוואר בקבוק")))
    : "";

  return {
    label: "הבעיה",
    icon: "⚠️",
    title: problem || "הבעיה עדיין לא חודדה",
    body: problem
      ? (projectType === "landing-page"
        ? "זה החסם המרכזי שמונע מהמסר השיווקי להמיר, והוא צריך לקבל מענה כבר בעמוד הראשון."
        : projectType === "commerce-ops"
          ? "זה צוואר הבקבוק במסחר או בתפעול, והוא צריך לקבל מענה ברור כבר בלוח העבודה הראשון."
        : projectType === "internal-tool"
          ? "זה צוואר הבקבוק התפעולי שחוזר אצל הצוות, והוא צריך לקבל מענה ברור כבר במסך העבודה הראשון."
          : "זה הכאב המרכזי שחוזר אצל המשתמש, והוא צריך לקבל פתרון כבר בגרסה הראשונה.")
      : refined || "צריך להבין מה הכאב המרכזי שחוזר אצל המשתמש הזה לפני שנוכל להגדיר משימה ראשונה מדויקת.",
  };
}

function resolveSolutionCard(answers = {}, summary = {}) {
  const solution = String(answers["successful-solution"] ?? "").trim();
  const projectType = resolveProjectType(summary);
  const label = projectType === "landing-page"
    ? "הכיוון לדף"
    : projectType === "commerce-ops"
      ? "הכיוון למסחר"
    : projectType === "internal-tool"
      ? "הכיוון לזרימה"
      : "הפתרון";

  return {
    label,
    icon: "💡",
    title: solution || "הפתרון עדיין לא הוגדר",
    body: solution
      ? (projectType === "landing-page"
        ? "כך אמור להיראות דף נחיתה אמין וברור מבחינת המשתמש, וזה הבסיס למשימת ההמרה הבאה."
        : projectType === "commerce-ops"
          ? "כך אמור להיראות מרחב מסחר ותפעול מוצלח, וזה הבסיס למשימת ההמשך שתשפיע על הזמנות, קטלוג ותיעדוף."
        : projectType === "internal-tool"
          ? "כך אמורה להיראות זרימת העבודה המוצלחת של הצוות, וזה הבסיס למשימת המוצר הבאה."
          : "כך אמור להיראות פתרון מוצלח מבחינת המשתמש, וזה הבסיס למשימה הבאה בלופ.")
      : "צריך לחדד איך נראה פתרון מוצלח מבחינת המשתמש כדי שלא נבנה משהו כללי מדי.",
  };
}

function resolveGoalCard({ currentProject = null, onboardingFlow = null, answers = {} } = {}) {
  const hasActiveOnboardingFlow = Boolean(
    onboardingFlow?.sessionId
    || onboardingFlow?.projectDraftId
    || onboardingFlow?.projectName
    || onboardingFlow?.visionText,
  );
  const goalSource = String(
    hasActiveOnboardingFlow
      ? onboardingFlow?.visionText
      : currentProject?.goal
          ?? onboardingFlow?.visionText
      ?? answers["successful-solution"]
      ?? "",
  ).trim();

  return {
    label: "מטרת ההצלחה",
    icon: "🎯",
    title: truncateText(goalSource, 52) || "להוציא את הפרויקט לפעולה",
    body: goalSource
      ? "אם זה באמת הכיוון, Nexus יכול עכשיו להפוך את ההבנה הזו למשימה הראשונה שתוביל לתוצר ממשי."
      : "אחרי אישור הסיכום נתקדם למשימה הראשונה שנגזרת ישירות מההבנה הזו.",
  };
}

export function buildUnderstandingSummaryViewModel({
  currentProject = null,
  onboardingFlow = null,
  onboardingConversation = null,
} = {}) {
  const answers = resolveAnswers(onboardingConversation);
  const summary = resolveSummary(onboardingConversation);
  const projectName = currentProject?.name ?? onboardingFlow?.projectName ?? "";
  const projectTypeLabel = resolveProjectTypeLabel(summary, onboardingFlow);
  const derivedArtifactExpectation = buildOnboardingArtifactExpectationPreview({
    currentProject,
    onboardingFlow,
    onboardingConversation,
  });
  const generationIntent = resolveGenerationIntent({ currentProject });
  const artifactExpectationLine = derivedArtifactExpectation.title
    ? `מה אנחנו מכוונים לבנות עכשיו: ${derivedArtifactExpectation.title}. ${derivedArtifactExpectation.summary ?? ""}`.trim()
    : "";
  const generationLearningCard = generationIntent.intentId
    ? {
        badge: generationIntent.learningAware ? "כיוון generation חי" : "כיוון generation",
        title: generationIntent.artifactTitle ?? "התוצר הבא",
        body: generationIntent.learningAware
          ? `${generationIntent.learningStrategyLabel ?? "הלמידה כבר משנה את כיוון היצירה"}. ${generationIntent.learningReason ?? ""}`.trim()
          : generationIntent.generationGoal ?? generationIntent.framingLine ?? "השלב הבא כבר מחובר לתוצר שאליו Nexus מכוונת.",
        proofLine: generationIntent.learnedProofRequirement
          ?? generationIntent.generationGoal
          ?? generationIntent.framingLine
          ?? "השלב הבא צריך להישאר צמוד למה שסגרנו כאן.",
        focusAreas: normalizeArray(generationIntent.learnedFocusAreas ?? generationIntent.focusAreas).slice(0, 3),
      }
    : null;

  return {
    projectName,
    title: "זה מה שהבנתי",
    subtitle: `ניתחתי את השיחה שלנו והפקתי את ארבעת המרכיבים המרכזיים של ${projectTypeLabel}.`,
    detail: artifactExpectationLine || "אם זה מדויק נמשיך ללופ. אם לא, נחזור לחדד את ההבנה לפני שמתקדמים.",
    whyItMatters: derivedArtifactExpectation.understandingLine
      || "ההבנה הזו היא הבסיס לכל החלטה שנקבל בהמשך. אם הסיכום נכון, המשימה הבאה תהיה חדה וישימה. אם לא, נתקן עכשיו לפני שבונים משהו לא מדויק.",
    confidenceLabel: onboardingConversation?.isComplete
      ? "רמת ביטחון גבוהה על בסיס שיחת ה־onboarding"
      : "רמת ביטחון ראשונית עד להשלמת ההבנה",
    generationLearningCard,
    cards: [
      resolveAudienceCard(answers, summary),
      resolveProblemCard(answers, summary),
      resolveSolutionCard(answers, summary),
      resolveGoalCard({ currentProject, onboardingFlow, answers }),
    ],
  };
}
