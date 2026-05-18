function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function resolveProjectTypeLabel(projectType) {
  if (projectType === "landing-page") {
    return "דף נחיתה / שיווק";
  }
  if (projectType === "commerce-ops") {
    return "מערכת מסחר ותפעול";
  }
  if (projectType === "internal-tool") {
    return "כלי פנימי";
  }
  if (projectType === "saas") {
    return "מוצר SaaS / follow-up";
  }
  if (projectType === "mobile-app") {
    return "אפליקציה";
  }
  return "פרויקט";
}

function resolveAnswers({ projectDraft = null, onboardingSession = null } = {}) {
  const normalizedDraft = normalizeObject(projectDraft);
  const normalizedSession = normalizeObject(onboardingSession);
  return normalizeObject(
    normalizedSession.conversation?.answers
      ?? normalizedDraft.state?.knowledge?.onboardingConversationAnswers,
  );
}

function isFollowUpStyleSaas({ projectDraft = null, projectIntake = null, answers = {} } = {}) {
  const normalizedDraft = normalizeObject(projectDraft);
  const normalizedIntake = normalizeObject(projectIntake);
  const blob = [
    normalizedDraft.name,
    normalizedDraft.goal,
    normalizedIntake.visionText,
    answers["target-audience"],
    answers["core-problem"],
    answers["successful-solution"],
  ]
    .map((value) => normalizeString(value, ""))
    .join(" ")
    .toLowerCase();

  return /follow-?up|reminder|crm|pipeline|lead|client|customer|proposal|booking|מעקב|תזכורת|לקוח|לקוחות|ליד|הצעה/.test(blob);
}

function buildLandingExpectation({ projectName, audience, problem, solution }) {
  const title = projectName ? `${projectName} landing page` : "Landing page";
  const summary = solution
    || "דף נחיתה חד עם הבטחה ברורה, הוכחת אמון וקריאה אחת לפעולה.";
  const proofFocus = [
    "הבטחה ראשית מעל הקפל",
    "הוכחת אמון שתומכת בהחלטה",
    "CTA מרכזי אחד שקל להבין",
  ];

  return {
    expectationId: `artifact-expectation:landing-page:${title.toLowerCase().replace(/\s+/g, "-")}`,
    source: "onboarding",
    projectType: "landing-page",
    projectTypeLabel: resolveProjectTypeLabel("landing-page"),
    artifactType: "landing-page",
    proofArtifactType: "landing-page",
    title,
    summary,
    audience,
    problem,
    solution,
    proofFocus,
    understandingLine: `אם הסיכום נכון, Nexus צריך לבנות עכשיו ${title} שמדבר אל ${audience || "הקהל"} ומטפל ישירות ב-${problem || "הכאב המרכזי"}.`,
    loopReadyMessage: `המשימה הבאה צריכה לקדם ${title} עם מסר, אמון ו-CTA שמחוברים ישירות ל-onboarding.`,
    continuityLine: `בתצוגה שנפתח נרצה לראות ${title} שמוכיח הבטחה ברורה, אמון ופעולה מיידית עבור ${audience || "הקהל"}.`,
  };
}

function buildInternalToolExpectation({ projectName, audience, problem, solution }) {
  const title = projectName ? `${projectName} משטח עבודה` : "משטח עבודה פנימי";
  const summary = solution
    || "משטח עבודה פנימי עם תור עבודה ברור, בעלות ברורה, רמת שירות והפעולה הבאה.";
  const proofFocus = [
    "תור עבודה גלוי עם חלוקה ברורה",
    "בעלות ברורה על כל פריט",
    "פעולה הבאה שניתנת לביצוע מיד",
  ];

  return {
    expectationId: `artifact-expectation:internal-tool:${title.toLowerCase().replace(/\s+/g, "-")}`,
    source: "onboarding",
    projectType: "internal-tool",
    projectTypeLabel: resolveProjectTypeLabel("internal-tool"),
    artifactType: "internal-ops-workspace",
    proofArtifactType: "internal-ops-dashboard",
    title,
    summary,
    audience,
    problem,
    solution,
    proofFocus,
    understandingLine: `אם הסיכום נכון, Nexus צריך לבנות עכשיו ${title} עבור ${audience || "הצוות"} כך שהאחראי, רמת השירות והפעולה הבאה יהיו ברורים מיד.`,
    loopReadyMessage: `המשימה הבאה צריכה לקדם ${title} שמוריד את הבלבול סביב ${problem || "צוואר הבקבוק התפעולי"}.`,
    continuityLine: `בתצוגה שנפתח נרצה לראות ${title} עם תור עבודה חי, בעלות גלויה ופעולה הבאה שכל נציג מבין מיד.`,
  };
}

function buildCommerceOpsExpectation({ projectName, audience, problem, solution }) {
  const title = projectName ? `${projectName} commerce workspace` : "Commerce workspace";
  const summary = solution
    || "מרכז מסחר אחד שמחבר הזמנות, קטלוג, מלאי ופעולה הבאה לכל נציג.";
  const proofFocus = [
    "הזמנות דחופות גלויות מיד",
    "חריגות קטלוג ומלאי נראות באותו מסך",
    "בעלות ופעולה הבאה ברורות לכל איש מסחר",
  ];

  return {
    expectationId: `artifact-expectation:commerce-ops:${title.toLowerCase().replace(/\\s+/g, "-")}`,
    source: "onboarding",
    projectType: "commerce-ops",
    projectTypeLabel: resolveProjectTypeLabel("commerce-ops"),
    artifactType: "commerce-ops-workspace",
    proofArtifactType: "commerce-ops-dashboard",
    title,
    summary,
    audience,
    problem,
    solution,
    proofFocus,
    understandingLine: `אם הסיכום נכון, Nexus צריך לבנות עכשיו ${title} עבור ${audience || "צוות המסחר"} כך שהזמנות, קטלוג והפעולה הבאה יהיו ברורים מיד.`,
    loopReadyMessage: `המשימה הבאה צריכה לקדם ${title} שמסדר את ${problem || "צוואר הבקבוק במסחר היומי"}.`,
    continuityLine: `בתצוגה שנפתח נרצה לראות ${title} עם הזמנות דחופות, חריגות קטלוג ובעלות ברורה על הפעולה הבאה.`,
  };
}

function buildSaasExpectation({ projectName, audience, problem, solution, followUpStyle }) {
  const title = projectName
    ? followUpStyle
      ? `${projectName} follow-up dashboard`
      : `${projectName} product workspace`
    : followUpStyle
      ? "Follow-up dashboard"
      : "Product workspace";
  const summary = solution
    || (followUpStyle
      ? "מוצר SaaS קטן שמרכז follow-ups, תזכורות והצעד הבא לכל ליד."
      : "מוצר SaaS ראשון עם זרימת עבודה ברורה ופעולה ראשונה שקל להבין.");
  const proofFocus = followUpStyle
    ? [
        "רשימת follow-up ברורה",
        "תזכורות או פעולה הבאה לכל ליד",
        "זרימה שמונעת נפילת הזדמנויות",
      ]
    : [
        "מסך ראשון ברור למשתמש",
        "פעולה ראשונה שאפשר להבין מיד",
        "משטח מוצרי שמטפל בכאב המרכזי",
      ];

  return {
    expectationId: `artifact-expectation:saas:${title.toLowerCase().replace(/\s+/g, "-")}`,
    source: "onboarding",
    projectType: "saas",
    projectTypeLabel: resolveProjectTypeLabel("saas"),
    artifactType: followUpStyle ? "followup-dashboard" : "saas-workspace",
    proofArtifactType: followUpStyle ? "followup-dashboard" : "generated-surface",
    title,
    summary,
    audience,
    problem,
    solution,
    proofFocus,
    understandingLine: `אם הסיכום נכון, Nexus צריך לבנות עכשיו ${title} עבור ${audience || "המשתמש"} כך שהפעולה הבאה סביב ${problem || "הכאב המרכזי"} תהיה ברורה.`,
    loopReadyMessage: `המשימה הבאה צריכה לקדם ${title} שמראה איך המוצר עוזר ל-${audience || "משתמש"} לא לפספס את ${problem || "הכאב המרכזי"}.`,
    continuityLine: `בתצוגה שנפתח נרצה לראות ${title} שממחיש פעולה ראשונה, מצב עבודה ברור ותועלת ישירה עבור ${audience || "המשתמש"}.`,
  };
}

function buildMobileAppExpectation({ projectName, audience, problem, solution }) {
  const title = projectName ? `${projectName} mobile flow` : "Mobile flow";
  const summary = solution
    || "זרימת מובייל ראשונה עם מסך פתיחה ברור, פעולה ראשונה מובנת ומעבר נקי לצעד הבא.";
  const proofFocus = [
    "מסך ראשון ברור למשתמש הנכון",
    "פעולה ראשונה שאפשר להבין בלי הדרכה",
    "זרימה ניידת שמטפלת ישירות בכאב המרכזי",
  ];

  return {
    expectationId: `artifact-expectation:mobile-app:${title.toLowerCase().replace(/\s+/g, "-")}`,
    source: "onboarding",
    projectType: "mobile-app",
    projectTypeLabel: resolveProjectTypeLabel("mobile-app"),
    artifactType: "mobile-flow",
    proofArtifactType: "mobile-app",
    title,
    summary,
    audience,
    problem,
    solution,
    proofFocus,
    understandingLine: `אם הסיכום נכון, Nexus צריך לבנות עכשיו ${title} עבור ${audience || "המשתמש"} כך שהמסך הראשון והפעולה הראשונה יהיו ברורים מיד סביב ${problem || "הכאב המרכזי"}.`,
    loopReadyMessage: `המשימה הבאה צריכה לקדם ${title} עם מסך ראשון ברור ופעולה ראשונה שמחוברת ישירות ל-onboarding.`,
    continuityLine: `בתצוגה שנפתח נרצה לראות ${title} שמוכיח מסך ראשון ברור, פעולה ראשונה מובנת וזרימה ניידת שמשרתת את ${audience || "המשתמש"}.`,
  };
}

function buildFallbackExpectation({ projectName, projectType, audience, problem, solution }) {
  const title = projectName ? `${projectName} first artifact` : "First project artifact";

  return {
    expectationId: `artifact-expectation:${projectType || "unknown"}:${title.toLowerCase().replace(/\s+/g, "-")}`,
    source: "onboarding",
    projectType: projectType || "unknown",
    projectTypeLabel: resolveProjectTypeLabel(projectType),
    artifactType: "generated-surface",
    proofArtifactType: "generated-surface",
    title,
    summary: solution || "התוצר הראשון צריך לבטא בצורה ברורה את מה שהמשתמש צריך לקבל מהפרויקט.",
    audience,
    problem,
    solution,
    proofFocus: [
      "קהל יעד ברור",
      "כאב מרכזי שמקבל מענה",
      "פעולה ראשונה שאפשר להבין מיד",
    ],
    understandingLine: `אם הסיכום נכון, Nexus צריך לבנות עכשיו ${title} עבור ${audience || "המשתמש"} סביב ${problem || "הכאב המרכזי"}.`,
    loopReadyMessage: `המשימה הבאה צריכה לקדם ${title} במקום לייצר תוצר כללי מדי.`,
    continuityLine: `בתצוגה שנפתח נרצה לראות ${title} שמחובר ישירות למה שעלה ב-onboarding.`,
  };
}

export function buildOnboardingArtifactExpectation({
  projectDraft = null,
  projectIntake = null,
  onboardingSession = null,
} = {}) {
  const normalizedDraft = normalizeObject(projectDraft);
  const normalizedIntake = normalizeObject(projectIntake);
  const answers = resolveAnswers({ projectDraft, onboardingSession });
  const projectType = normalizeString(normalizedIntake.projectType, "unknown");
  const projectName = normalizeString(normalizedIntake.projectName, normalizeString(normalizedDraft.name, ""));
  const audience = normalizeString(answers["target-audience"], "");
  const problem = normalizeString(answers["core-problem"], "");
  const solution = normalizeString(answers["successful-solution"], "");

  if (projectType === "landing-page") {
    return buildLandingExpectation({ projectName, audience, problem, solution });
  }
  if (projectType === "internal-tool") {
    return buildInternalToolExpectation({ projectName, audience, problem, solution });
  }
  if (projectType === "commerce-ops") {
    return buildCommerceOpsExpectation({ projectName, audience, problem, solution });
  }
  if (projectType === "saas") {
    return buildSaasExpectation({
      projectName,
      audience,
      problem,
      solution,
      followUpStyle: isFollowUpStyleSaas({ projectDraft, projectIntake, answers }),
    });
  }
  if (projectType === "mobile-app") {
    return buildMobileAppExpectation({ projectName, audience, problem, solution });
  }

  return buildFallbackExpectation({ projectName, projectType, audience, problem, solution });
}
