import { resolveCanonicalOnboardingAnswers } from "../../shared/learning-guided-onboarding.js";
import {
  resolveHumanArtifactExpectationLine,
  resolveHumanLearningDirectionLine,
  resolveHumanUnderstandingSubtitle,
} from "../../shared/live-conversation-tone-contract.js";

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

function isSelfAudienceReference(value = "") {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return false;
  }
  return /^(?:אני|אני בעצמי|אני המשתמש(?:ת)?|המשתמש(?:ת)?(?:\s+המרכזי)?\s*(?:זה|הוא|היא)\s*אני)$/iu.test(normalized);
}

function isAmbiguousClientReference(value = "") {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return false;
  }
  return /(?:^|\s)לקוח(?:ות)?\s+שלי(?:$|\s)/iu.test(normalized);
}

function resolveAudienceDisplayValue(value = "") {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return "";
  }
  if (isSelfAudienceReference(normalized)) {
    return "אתה בעצמך";
  }
  return normalized;
}

function resolveAudienceForPhrase(value = "", fallback = "המשתמש") {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return `עבור ${fallback}`;
  }
  if (isSelfAudienceReference(normalized)) {
    return "עבורך";
  }
  return `עבור ${resolveAudienceDisplayValue(normalized)}`;
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

function normalizeProjectType(value = "") {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return "";
  if (["internal-tool", "internal tool", "internal web app", "internal app", "admin panel", "backoffice", "back office"].includes(normalized)) {
    return "internal-tool";
  }
  if (["commerce-ops", "commerce ops", "commerce-storefront", "storefront", "ecommerce", "e-commerce"].includes(normalized)) {
    return "commerce-ops";
  }
  if (["landing-page", "landing page", "marketing site", "website"].includes(normalized)) {
    return "landing-page";
  }
  if (["mobile-app", "mobile app", "native app"].includes(normalized)) {
    return "mobile-app";
  }
  if (["saas", "web app", "crm", "crm / follow-up", "follow-up", "platform"].includes(normalized)) {
    return "saas";
  }
  return normalized;
}

function resolveAnswers(onboardingConversation = null) {
  const answers = normalizeObject(onboardingConversation?.answers);
  const canonicalAnswers = resolveCanonicalOnboardingAnswers(answers);
  return {
    ...answers,
    "target-audience": canonicalAnswers.audience,
    "core-problem": canonicalAnswers.problem,
  };
}

function resolveSummary(onboardingConversation = null) {
  return normalizeObject(onboardingConversation?.summary);
}

function resolveProjectTypeLabelFromType(projectType = "unknown") {
  return projectType === "landing-page"
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

function resolveProjectType(summary = {}, onboardingFlow = null, onboardingConversation = null, currentProject = null) {
  if (typeof summary.projectType === "string" && summary.projectType.trim()) {
    return normalizeProjectType(summary.projectType);
  }

  const artifactExpectation = resolveArtifactExpectation({ currentProject });
  if (typeof artifactExpectation.projectType === "string" && artifactExpectation.projectType.trim()) {
    return normalizeProjectType(artifactExpectation.projectType);
  }

  const answers = resolveAnswers(onboardingConversation);
  const successfulSolutionType = detectProjectTypeFromText(answers["successful-solution"] ?? "");
  if (successfulSolutionType === "landing-page") {
    return "landing-page";
  }

  return detectProjectTypeFromText(onboardingFlow?.visionText ?? "");
}

function resolveProjectTypeLabel(summary = {}, onboardingFlow = null, onboardingConversation = null, currentProject = null) {
  if (typeof summary.projectTypeLabel === "string" && summary.projectTypeLabel.trim()) {
    return summary.projectTypeLabel.trim();
  }

  const artifactExpectation = resolveArtifactExpectation({ currentProject });
  if (artifactExpectation.projectType) {
    return artifactExpectation.projectTypeLabel ?? resolveProjectTypeLabelFromType(artifactExpectation.projectType);
  }

  const projectType = resolveProjectType(summary, onboardingFlow, onboardingConversation, currentProject);
  return resolveProjectTypeLabelFromType(projectType);
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

function deriveConversationArtifactExpectation({
  currentProject = null,
  onboardingConversation = null,
  onboardingFlow = null,
} = {}) {
  const answers = resolveAnswers(onboardingConversation);
  const summary = resolveSummary(onboardingConversation);
  const projectType = resolveProjectType(summary, onboardingFlow, onboardingConversation, currentProject);
  const projectName = String(onboardingFlow?.projectName ?? "").trim();
  const audience = String(answers["target-audience"] ?? "").trim();
  const audienceDisplay = resolveAudienceDisplayValue(audience) || "המשתמש";
  const audienceForPhrase = resolveAudienceForPhrase(audience);
  const problem = String(answers["core-problem"] ?? "").trim();
  const solution = String(answers["successful-solution"] ?? "").trim();

  if (projectType === "landing-page") {
    const title = projectName ? `${projectName} דף נחיתה` : "דף נחיתה";
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
      understandingLine: `אם הסיכום נכון, הצעד הבא הוא לבנות עכשיו ${title} שמדבר אל ${audienceDisplay} ומטפל ישירות ב-${problem || "הכאב המרכזי"}.`,
      continuityLine: `בתצוגה שנפתח נרצה לראות ${title} עם הבטחה ברורה, אמון ופעולה מיידית ${audienceForPhrase}.`,
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
      understandingLine: `אם הסיכום נכון, הצעד הבא הוא לבנות עכשיו ${title} ${resolveAudienceForPhrase(audience, "הצוות")} כך שהאחראי, רמת השירות והפעולה הבאה יהיו ברורים מיד.`,
      continuityLine: `בתצוגה שנפתח נרצה לראות ${title} עם תור עבודה חי, בעלות גלויה ופעולה הבאה שכל נציג מבין מיד.`,
    };
  }
  if (projectType === "commerce-ops") {
    const title = projectName ? `${projectName} מרחב מסחר` : "מרחב מסחר";
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
      understandingLine: `אם הסיכום נכון, הצעד הבא הוא לבנות עכשיו ${title} ${resolveAudienceForPhrase(audience, "צוות המסחר")} כך שהזמנות, קטלוג והפעולה הבאה יהיו ברורים מיד סביב ${problem || "צוואר הבקבוק התפעולי"}.`,
      continuityLine: `בתצוגה שנפתח נרצה לראות ${title} עם תור הזמנות פעיל, מצב קטלוג גלוי ופעולה תפעולית אחת שכל נציג יודע לבצע מיד.`,
    };
  }
  if (projectType === "saas") {
    const title = projectName ? `${projectName} מרחב מוצר ראשון` : "מרחב מוצר ראשון";
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
      understandingLine: `אם הסיכום נכון, הצעד הבא הוא לבנות עכשיו ${title} ${audienceForPhrase} כך שהפעולה הבאה סביב ${problem || "הכאב המרכזי"} תהיה ברורה.`,
      continuityLine: `בתצוגה שנפתח נרצה לראות ${title} שממחיש פעולה ראשונה, מצב עבודה ברור ותועלת ישירה ${audienceForPhrase}.`,
    };
  }
  if (projectType === "mobile-app") {
    const title = projectName ? `${projectName} זרימת מובייל ראשונה` : "זרימת מובייל ראשונה";
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
      understandingLine: `אם הסיכום נכון, הצעד הבא הוא לבנות עכשיו ${title} ${audienceForPhrase} כך שהמסך הראשון והפעולה הראשונה יהיו ברורים מיד סביב ${problem || "הכאב המרכזי"}.`,
      continuityLine: `בתצוגה שנפתח נרצה לראות ${title} עם מסך ראשון ברור, פעולה ראשונה מובנת וזרימה ניידת שמשרתת ${audienceForPhrase}.`,
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
  const derivedArtifactExpectation = deriveConversationArtifactExpectation({
    currentProject,
    onboardingConversation,
    onboardingFlow,
  });
  const summary = resolveSummary(onboardingConversation);
  const summaryProjectType = typeof summary.projectType === "string" ? summary.projectType.trim() : "";
  const artifactProjectType = typeof artifactExpectation.projectType === "string"
    ? artifactExpectation.projectType.trim()
    : "";
  if (
    derivedArtifactExpectation.title
    && (
      !artifactExpectation.title
      || (summaryProjectType && artifactProjectType && summaryProjectType !== artifactProjectType)
    )
  ) {
    return derivedArtifactExpectation;
  }
  return artifactExpectation;
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
  const summary = resolveSummary(onboardingConversation);
  return {
    intentId: `generation-intent:${projectType}:${(artifactExpectation.title ?? "artifact").toLowerCase().replace(/\s+/g, "-")}`,
    source: summary.learningStatus === "live" ? "learning-guided-onboarding" : "onboarding-artifact-expectation",
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
    learningAware: summary.learningStatus === "live",
    learningStrategy: summary.learningStrategy ?? null,
    learningStrategyLabel: summary.learningStrategyLabel ?? null,
    learningReason: summary.learningReason ?? null,
    learnedSignals: normalizeArray(summary.learningSignals),
    learnedProofRequirement: summary.handoffStrengthLine ?? null,
    learnedFocusAreas: normalizeArray(artifactExpectation.proofFocus).slice(0, 3),
  };
}

function resolveAudienceCard(answers = {}, summary = {}) {
  const audience = String(answers["target-audience"] ?? "").trim();
  const refined = Array.isArray(summary.understoodItems)
    ? summary.understoodItems.find((item) => typeof item === "string" && (item.includes("קהל") || item.includes("המשתמש המרכזי")))
    : "";
  const selfAudience = isSelfAudienceReference(audience);
  const ambiguousClientAudience = isAmbiguousClientReference(audience);
  const displayAudience = resolveAudienceDisplayValue(audience);

  return {
    label: "קהל יעד",
    icon: "👥",
    title: ambiguousClientAudience
      ? "המשתמש עדיין לא הוגדר מספיק טוב"
      : displayAudience || "קהל היעד עדיין לא הושלם",
    body: refined || (selfAudience
      ? "כרגע ברור שאתה גם מי שמגדיר את המוצר וגם מי שאמור להשתמש בו בפועל, ולכן שאר ההחלטות צריכות להיבדק מנקודת המבט שלך."
      : ambiguousClientAudience
        ? "עדיין צריך לדייק אם מדובר בך, בצוות של הלקוח, או בלקוח הקצה עצמו לפני שאפשר לבנות על זה."
      : audience
      ? "זה המשתמש המרכזי שעבורו בונים את החוויה הראשונה של הפרויקט."
      : "צריך לחדד מי המשתמש המרכזי של המוצר כדי שנוכל להחליט מה חשוב לבנות קודם."),
  };
}

function resolveProblemCard(answers = {}, summary = {}, onboardingConversation = null, currentProject = null) {
  const problem = String(answers["core-problem"] ?? "").trim();
  const projectType = resolveProjectType(summary, null, onboardingConversation, currentProject);
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

function resolveSolutionCard(answers = {}, summary = {}, onboardingConversation = null, currentProject = null) {
  const solution = String(answers["successful-solution"] ?? "").trim();
  const projectType = resolveProjectType(summary, null, onboardingConversation, currentProject);
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
      ? "אם זה באמת הכיוון, אפשר עכשיו להפוך את ההבנה הזו לצעד הראשון שמוליד תוצר ממשי."
      : "אחרי שנאשר שזה יושב נכון, נתקדם ישר לצעד הראשון שנגזר מזה.",
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
  const projectTypeLabel = resolveProjectTypeLabel(summary, onboardingFlow, onboardingConversation, currentProject);
  const derivedArtifactExpectation = buildOnboardingArtifactExpectationPreview({
    currentProject,
    onboardingFlow,
    onboardingConversation,
  });
  const resolvedGenerationIntent = resolveGenerationIntent({ currentProject });
  const derivedGenerationIntent = buildOnboardingGenerationIntentPreview({
    currentProject,
    onboardingFlow,
    onboardingConversation,
  });
  const generationIntent = resolvedGenerationIntent.intentId
    && !(
      typeof summary.projectType === "string"
      && summary.projectType.trim()
      && typeof resolvedGenerationIntent.projectType === "string"
      && resolvedGenerationIntent.projectType.trim()
      && summary.projectType.trim() !== resolvedGenerationIntent.projectType.trim()
    )
    ? resolvedGenerationIntent
    : derivedGenerationIntent;
  const artifactExpectationLine = derivedArtifactExpectation.title
    ? resolveHumanArtifactExpectationLine({
        title: derivedArtifactExpectation.title,
        summary: derivedArtifactExpectation.summary ?? "",
      })
    : "";
  const generationLearningCard = generationIntent.intentId
    ? {
        badge: generationIntent.learningAware ? "הכיוון שכבר מתחיל להיסגר" : "הכיוון שאני מחזיק עכשיו",
        title: generationIntent.artifactTitle ?? "התוצר הבא",
        body: generationIntent.learningAware
          ? resolveHumanLearningDirectionLine({
              strategyLabel: generationIntent.learningStrategyLabel ?? "",
              reason: generationIntent.learningReason ?? "",
              fallback: "יש לי כאן כיוון יותר חד למה צריך להיסגר קודם.",
            })
          : generationIntent.generationGoal ?? generationIntent.framingLine ?? "השלב הבא כבר מחובר ישירות למה שהבנו כאן.",
        proofLine: generationIntent.learnedProofRequirement
          ?? generationIntent.generationGoal
          ?? generationIntent.framingLine
          ?? "השלב הבא צריך להישאר צמוד למה שסגרנו כאן.",
        focusAreas: normalizeArray(generationIntent.learnedFocusAreas ?? generationIntent.focusAreas).slice(0, 3),
      }
    : null;

  return {
    projectName,
    title: "בוא נוודא שאני איתך על אותו הדבר",
    subtitle: resolveHumanUnderstandingSubtitle(projectTypeLabel),
    detail: artifactExpectationLine || "אם זה יושב נכון, נתקדם מכאן ישר לצעד הבא. אם לא, נדייק כאן לפני שבונים הלאה.",
    whyItMatters: derivedArtifactExpectation.understandingLine
      || "ההבנה הזו קובעת איך ייראה הצעד הבא. אם זה מדויק, ננוע קדימה בביטחון. אם לא, עדיף לתקן כאן ולא אחרי שבנינו משהו עקום.",
    confidenceLabel: onboardingConversation?.isComplete
      ? "יש לי כבר תמונה די יציבה של מה צריך להיבנות עכשיו"
      : "יש לי כיוון טוב, אבל אני עדיין משאיר מקום לדיוק אחרון",
    generationLearningCard,
    cards: [
      resolveAudienceCard(answers, summary),
      resolveProblemCard(answers, summary, onboardingConversation, currentProject),
      resolveSolutionCard(answers, summary, onboardingConversation, currentProject),
      resolveGoalCard({ currentProject, onboardingFlow, answers }),
    ],
  };
}
