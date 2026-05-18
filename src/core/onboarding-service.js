import { defineProjectDraftSchema } from "./project-draft-schema.js";
import { resolveCanonicalProductClass } from "../../web/shared/product-class-model.js";

function toSlug(value, fallback = "project-draft") {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

function createSessionId(projectDraftId) {
  return `onboarding-${projectDraftId}-${Date.now()}`;
}

function parseInitialInput(initialInput) {
  if (typeof initialInput === "string") {
    return {
      raw: initialInput,
      projectName: null,
      goal: initialInput.trim(),
      attachments: [],
      links: [],
    };
  }

  const payload = initialInput && typeof initialInput === "object" ? initialInput : {};
  return {
    raw: payload.raw ?? payload.visionText ?? "",
    projectName: typeof payload.projectName === "string" ? payload.projectName.trim() : null,
    goal:
      typeof payload.goal === "string"
        ? payload.goal.trim()
        : typeof payload.visionText === "string"
          ? payload.visionText.trim()
          : "",
    attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
    links: Array.isArray(payload.links) ? payload.links : [],
  };
}

function normalizeUploadedFiles(uploadedFiles = []) {
  if (!Array.isArray(uploadedFiles)) {
    return [];
  }

  return uploadedFiles
    .filter((item) => item && typeof item === "object")
    .map((file, index) => ({
      id: file.id ?? `file-${index + 1}`,
      name: typeof file.name === "string" ? file.name.trim() : `attachment-${index + 1}`,
      type: typeof file.type === "string" ? file.type.trim() : "unknown",
      content: typeof file.content === "string" ? file.content : "",
      size: typeof file.size === "number" ? file.size : null,
    }));
}

function normalizeExternalLinks(externalLinks = []) {
  if (!Array.isArray(externalLinks)) {
    return [];
  }

  return externalLinks
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim());
}

function extractProjectName(visionText = "") {
  const fromTitle = visionText.match(/^(?:שם הפרויקט|project name)\s*[:\-]\s*(.+)$/im);
  return fromTitle?.[1]?.trim() ?? null;
}

function detectProjectType(text) {
  return resolveCanonicalProductClass({
    texts: [text],
    fallback: "unknown",
  }).productClass;
}

function detectProjectTypeFromInputs({ visionText = "", uploadedFiles = [], externalLinks = [] } = {}) {
  const normalizedFiles = normalizeUploadedFiles(uploadedFiles);
  const normalizedLinks = normalizeExternalLinks(externalLinks);
  const uploadedMaterialText = normalizedFiles
    .flatMap((file) => [file.name, file.type, file.content])
    .filter((value) => typeof value === "string" && value.trim())
    .join("\n");
  const combinedSignals = [
    visionText,
    uploadedMaterialText,
    normalizedLinks.join("\n"),
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join("\n");

  const directDetection = detectProjectType(combinedSignals);
  if (directDetection !== "unknown") {
    return directDetection;
  }

  return resolveCanonicalProductClass({
    texts: [combinedSignals],
    fallback: "unknown",
  }).productClass;
}

function detectRequestedDeliverables(text, files, links) {
  const signals = [];
  const normalized = text.toLowerCase();

  if (/(auth|login|register|התחברות)/i.test(normalized)) {
    signals.push("auth");
  }
  if (/(payment|payments|billing|checkout|תשלום|תשלומים)/i.test(normalized)) {
    signals.push("payments");
  }
  if (/(landing page|דף נחיתה|campaign|marketing|שיווק)/i.test(normalized)) {
    signals.push("growth");
  }
  if (
    files.some(
      (file) =>
        /figma|design|ui/i.test(file.name) ||
        /figma|design|ui/i.test(file.type) ||
        /figma|design|ui/i.test(file.content),
    )
  ) {
    signals.push("design-input");
  }
  if (links.some((link) => /github|gitlab/i.test(link))) {
    signals.push("repo-link");
  }

  return [...new Set(signals)];
}

function inferMissingInputs({ projectName, visionText, uploadedFiles, externalLinks }) {
  const missingInputs = [];

  if (!visionText.trim()) {
    missingInputs.push("vision");
  }
  if (!projectName) {
    missingInputs.push("project-name");
  }
  if (uploadedFiles.length === 0 && externalLinks.length === 0) {
    missingInputs.push("supporting-material");
  }

  return missingInputs;
}

function buildProjectIntake({ projectName = "", visionText = "", uploadedFiles = [], externalLinks = [] }) {
  const normalizedFiles = normalizeUploadedFiles(uploadedFiles);
  const normalizedLinks = normalizeExternalLinks(externalLinks);
  const normalizedProjectName = typeof projectName === "string" && projectName.trim()
    ? projectName.trim()
    : extractProjectName(visionText);
  const projectType = detectProjectTypeFromInputs({
    visionText,
    uploadedFiles: normalizedFiles,
    externalLinks: normalizedLinks,
  });
  const requestedDeliverables = detectRequestedDeliverables(visionText, normalizedFiles, normalizedLinks);

  return {
    projectName: normalizedProjectName,
    visionText: visionText.trim(),
    uploadedFiles: normalizedFiles,
    externalLinks: normalizedLinks,
    projectType,
    requestedDeliverables,
  };
}

function buildParsedSignals(projectIntake) {
  return {
    detectedProjectType: projectIntake.projectType,
    hasUploadedFiles: projectIntake.uploadedFiles.length > 0,
    hasExternalLinks: projectIntake.externalLinks.length > 0,
    requestedDeliverables: projectIntake.requestedDeliverables,
    detectedInputs: [
      ...(projectIntake.projectName ? ["project-name"] : []),
      ...(projectIntake.visionText ? ["vision"] : []),
      ...(projectIntake.uploadedFiles.length > 0 ? ["files"] : []),
      ...(projectIntake.externalLinks.length > 0 ? ["links"] : []),
    ],
  };
}

function resolveOnboardingSteps({ onboardingSession, projectIntake }) {
  const requiredActions = [];
  const missingInputs = inferMissingInputs(projectIntake);

  if (missingInputs.includes("vision")) {
    requiredActions.push("הזן תיאור קצר של מה אתה רוצה לבנות");
  }
  if (missingInputs.includes("project-name")) {
    requiredActions.push("תן שם לפרויקט");
  }
  if (missingInputs.includes("supporting-material")) {
    requiredActions.push("העלה איפיון, קבצים או קישור חיצוני");
  }
  if (projectIntake.projectType === "unknown") {
    requiredActions.push("חדד איזה סוג פרויקט אתה בונה");
  }

  const currentStep = missingInputs.length > 0
    ? "capture-missing-inputs"
    : projectIntake.projectType === "unknown"
      ? "clarify-project-type"
      : "review-intake";

  const nextStep = currentStep === "review-intake" ? "confirm-project-setup" : "review-intake";

  return {
    currentStep,
    nextStep,
    requiredActions,
    sessionId: onboardingSession?.sessionId ?? null,
    projectDraftId: onboardingSession?.projectDraftId ?? null,
  };
}

function appendUnique(items = [], value) {
  return items.includes(value) ? items : [...items, value];
}

const onboardingAgentQuestionDefinitions = {
  "target-audience": {
    id: "target-audience",
    title: "למי המערכת הזאת נבנית?",
    placeholder: "לדוגמה: לבעלי עסקים קטנים",
  },
  "project-class": {
    id: "project-class",
    title: "לפני שממשיכים, מה הדבר המרכזי שאתה בונה כאן?",
    placeholder: "לדוגמה: דף נחיתה שיווקי / כלי פנימי לצוות / מוצר SaaS קטן",
  },
  "core-problem": {
    id: "core-problem",
    title: "מה הבעיה המרכזית שהם מתמודדים איתה?",
    placeholder: "לדוגמה: קשה להם לנהל לקוחות ולעקוב אחרי מכירות",
  },
  "successful-solution": {
    id: "successful-solution",
    title: "איך נראה פתרון מוצלח מבחינתם?",
    placeholder: "לדוגמה: כלי לקוחות פשוט ונוח עם התראות",
  },
};

function resolveQuestionPresentation(session, questionId) {
  const question = getOnboardingQuestionDefinition(questionId);
  if (!question) {
    return null;
  }

  const projectType = resolveConversationProjectType(session);

  if (questionId === "target-audience") {
    if (projectType === "landing-page") {
      return {
        title: "למי דף הנחיתה הזה צריך לדבר?",
        placeholder: "לדוגמה: עצמאים שרוצים יותר פניות בלי שיחת מכירה ארוכה",
      };
    }
    if (projectType === "mobile-app") {
      return {
        title: "מי ישתמש באפליקציה הזאת ביום-יום?",
        placeholder: "לדוגמה: הורים עובדים שצריכים להבין מהר מה קורה היום",
      };
    }
    if (projectType === "internal-tool") {
      return {
        title: "מי הצוות שיעבוד עם הכלי הזה בכל יום?",
        placeholder: "לדוגמה: צוות תפעול ושירות שצריך לראות תור עבודה ברור",
      };
    }
    if (projectType === "commerce-ops") {
      return {
        title: "מי הצוות שמנהל את המסחר הזה בכל יום?",
        placeholder: "לדוגמה: צוות מסחר ותפעול שמחזיק קטלוג, הזמנות ותוכן",
      };
    }
    if (projectType === "saas") {
      return {
        title: "מי המשתמשים שצריכים לנהל את העבודה בתוך המוצר?",
        placeholder: "לדוגמה: מאמנים עצמאיים שמנהלים לקוחות וחידושי מנוי",
      };
    }
  }

  if (questionId === "project-class") {
    return {
      title: "מה הדבר המרכזי שאתה בונה כאן: דף נחיתה, מערכת מסחר תפעולית, כלי פנימי, או מוצר SaaS קטן?",
      placeholder: "לדוגמה: דף נחיתה / מערכת מסחר תפעולית / כלי פנימי לצוות / מוצר SaaS קטן",
    };
  }

  if (questionId === "core-problem") {
    if (projectType === "landing-page") {
      return {
        title: question.title,
        placeholder: "לדוגמה: המבקרים לא מבינים מהר למה לבחור בי ולכן לא משאירים פרטים",
      };
    }
    if (projectType === "mobile-app") {
      return {
        title: question.title,
        placeholder: "לדוגמה: קשה להבין מה הצעד הבא ואין מסך ראשון שמסדר את היום",
      };
    }
    if (projectType === "internal-tool") {
      return {
        title: question.title,
        placeholder: "לדוגמה: פניות נופלות בין נציגים ואין בעלות ברורה על הטיפול",
      };
    }
    if (projectType === "commerce-ops") {
      return {
        title: question.title,
        placeholder: "לדוגמה: הזמנות, מלאי ותוכן לא נפגשים באותו flow ולכן טיפול נמרח ונופל בין בעלי תפקידים",
      };
    }
    if (projectType === "saas") {
      return {
        title: question.title,
        placeholder: "לדוגמה: הם מאבדים מעקב על לקוחות, חידושים והודעות חשובות",
      };
    }
  }

  if (questionId === "successful-solution") {
    if (projectType === "landing-page") {
      return {
        title: question.title,
        placeholder: "לדוגמה: דף ברור עם הבטחה חדה, הוכחת אמון ופעולה אחת שקל לבחור",
      };
    }
    if (projectType === "mobile-app") {
      return {
        title: question.title,
        placeholder: "לדוגמה: מסך פתיחה ברור, פעולה ראשונה אחת, והמשך נקי למסך הבא",
      };
    }
    if (projectType === "internal-tool") {
      return {
        title: question.title,
        placeholder: "לדוגמה: תור עבודה ברור עם בעלות, סטטוס ופעולה אחת שאפשר לבצע מיד",
      };
    }
    if (projectType === "commerce-ops") {
      return {
        title: question.title,
        placeholder: "לדוגמה: מרכז מסחר אחד שמראה הזמנות דחופות, חריגות קטלוג, בעלות ופעולה הבאה לכל נציג",
      };
    }
    if (projectType === "saas") {
      return {
        title: question.title,
        placeholder: "לדוגמה: לוח לקוחות עם חידושים, תזכורות והפעולה הבאה הכי חשובה",
      };
    }
  }

  return {
    title: question.title,
    placeholder: question.placeholder,
  };
}

function getOnboardingQuestionDefinition(questionId) {
  return onboardingAgentQuestionDefinitions[questionId] ?? null;
}

function formatConversationTime(date = new Date()) {
  return new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function detectProjectTypeCandidates(text) {
  const normalized = String(text ?? "").toLowerCase();
  const candidates = new Set();

  if (/(landing page|landing-page|website|marketing site|marketing page|homepage|web site|site|דף נחיתה|אתר שיווקי|שיווק)/i.test(normalized)) {
    candidates.add("landing-page");
  }
  if (/(ecommerce|shop|store|catalog|checkout|cart|order|orders|inventory|merchant|fulfillment|commerce|מסחר|קטלוג|הזמנות|מלאי)/i.test(normalized)) {
    candidates.add("commerce-ops");
  }
  if (/(internal tool|ops|operations|backoffice|back office|admin panel|portal|workspace|queue|תפעול|צוות פנימי|כלי פנימי)/i.test(normalized)) {
    candidates.add("internal-tool");
  }
  if (/(saas|subscription|mvp|web app|platform|crm|customer|client|follow-up|reminder|dashboard|מערכת|כלי|לקוחות)/i.test(normalized)) {
    candidates.add("saas");
  }
  if (/(mobile app|react native|expo|ios|android|אפליקציה)/i.test(normalized)) {
    candidates.add("mobile-app");
  }

  return [...candidates];
}

function resolveConversationClassification(session, answers = {}) {
  const intakeProjectType = typeof session?.projectIntake?.projectType === "string"
    ? session.projectIntake.projectType.trim()
    : "";
  if (intakeProjectType && intakeProjectType !== "unknown") {
    return {
      projectType: intakeProjectType,
      candidateTypes: [intakeProjectType],
      isAmbiguous: false,
      source: "project-intake",
    };
  }

  const projectClassAnswer = typeof answers["project-class"] === "string" ? answers["project-class"].trim() : "";
  if (projectClassAnswer) {
    const projectTypeFromAnswer = detectProjectType(projectClassAnswer);
    if (projectTypeFromAnswer !== "unknown") {
      return {
        projectType: projectTypeFromAnswer,
        candidateTypes: [projectTypeFromAnswer],
        isAmbiguous: false,
        source: "conversation-answer",
      };
    }
  }

  const sourceText = [
    session?.projectIntake?.visionText,
    session?.projectDraft?.goal,
    session?.initialInput?.goal,
    session?.initialInput?.raw,
    typeof answers["target-audience"] === "string" ? answers["target-audience"].trim() : "",
    typeof answers["core-problem"] === "string" ? answers["core-problem"].trim() : "",
    typeof answers["successful-solution"] === "string" ? answers["successful-solution"].trim() : "",
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join("\n");

  const candidateTypes = detectProjectTypeCandidates(sourceText);
  const detectedProjectType = detectProjectType(sourceText);
  const projectType = detectedProjectType !== "unknown"
    ? detectedProjectType
    : candidateTypes.length === 1
      ? candidateTypes[0]
      : "unknown";

  return {
    projectType,
    candidateTypes,
    isAmbiguous: candidateTypes.length > 1 || projectType === "unknown",
    source: "intake-signals",
  };
}

function requiresSolutionQuestion(projectType) {
  return projectType !== "landing-page";
}

function hasSufficientUnderstanding({ projectType, audience, problem, solution }) {
  if (!audience || !problem) {
    return false;
  }

  if (projectType === "landing-page") {
    return true;
  }

  return Boolean(solution);
}

function buildAdaptiveQuestionPlan(session, answers = {}) {
  const audience = typeof answers["target-audience"] === "string" ? answers["target-audience"].trim() : "";
  const problem = typeof answers["core-problem"] === "string" ? answers["core-problem"].trim() : "";
  const solution = typeof answers["successful-solution"] === "string" ? answers["successful-solution"].trim() : "";
  const classification = resolveConversationClassification(session, answers);

  const plan = ["target-audience"];

  if (audience && classification.isAmbiguous && !answers["project-class"]) {
    plan.push("project-class");
  }

  if (audience) {
    plan.push("core-problem");
  }

  if (!hasSufficientUnderstanding({
    projectType: classification.projectType,
    audience,
    problem,
    solution,
  })) {
    const shouldAskSolution = audience && problem && requiresSolutionQuestion(classification.projectType);
    if (shouldAskSolution) {
      plan.push("successful-solution");
    }
  }

  return [...new Set(plan)];
}

function resolveNextConversationQuestionId(session, answers = {}) {
  const audience = typeof answers["target-audience"] === "string" ? answers["target-audience"].trim() : "";
  const problem = typeof answers["core-problem"] === "string" ? answers["core-problem"].trim() : "";
  const solution = typeof answers["successful-solution"] === "string" ? answers["successful-solution"].trim() : "";
  const projectClassAnswer = typeof answers["project-class"] === "string" ? answers["project-class"].trim() : "";
  const classification = resolveConversationClassification(session, answers);

  if (!audience) {
    return "target-audience";
  }

  if (!projectClassAnswer && classification.isAmbiguous) {
    return "project-class";
  }

  if (!problem) {
    return "core-problem";
  }

  if (hasSufficientUnderstanding({
    projectType: classification.projectType,
    audience,
    problem,
    solution,
  })) {
    return null;
  }

  if (!solution) {
    return "successful-solution";
  }

  return null;
}

function buildAgentPrompt(session, questionId) {
  const questionPresentation = resolveQuestionPresentation(session, questionId);
  if (!questionPresentation) {
    return null;
  }

  const answers = session?.conversation?.answers ?? {};
  if (questionId === "project-class" && typeof answers["target-audience"] === "string" && answers["target-audience"].trim()) {
    return `כדי לא להוביל את ${answers["target-audience"].trim()} למסלול הלא נכון, מה הדבר המרכזי שאתה בונה כאן: דף נחיתה שיווקי, כלי פנימי לצוות, או מוצר SaaS קטן?`;
  }
  if (questionId === "core-problem" && typeof answers["target-audience"] === "string" && answers["target-audience"].trim()) {
    return `מעולה. אם המערכת נבנית עבור ${answers["target-audience"].trim()}, מה הבעיה המרכזית שהם מתמודדים איתה?`;
  }

  if (
    questionId === "successful-solution"
    && typeof answers["target-audience"] === "string"
    && answers["target-audience"].trim()
    && typeof answers["core-problem"] === "string"
    && answers["core-problem"].trim()
  ) {
    return `יש כבר תמונה טובה: הקהל הוא ${answers["target-audience"].trim()} והכאב המרכזי הוא ${answers["core-problem"].trim()}. איך נראה פתרון מוצלח מבחינתם?`;
  }

  return questionPresentation.title;
}

function buildQuestionReason(session, questionId) {
  const answers = session?.conversation?.answers ?? {};
  const audience = typeof answers["target-audience"] === "string" ? answers["target-audience"].trim() : "";
  const problem = typeof answers["core-problem"] === "string" ? answers["core-problem"].trim() : "";

  if (questionId === "project-class") {
    return "יש כאן כמה אותות אפשריים, ואני צריך לנעול את סוג הפרויקט כדי לא לערבב בין דף שיווקי, כלי פנימי ומוצר SaaS.";
  }
  if (questionId === "core-problem" && audience) {
    return `כבר ברור לי מי המשתמש המרכזי. עכשיו אני צריך להבין מה הכאב שחוזר אצל ${audience} כדי לכוון את ה-onboarding נכון.`;
  }
  if (questionId === "successful-solution" && audience && problem) {
    return `יש לי כבר קהל יעד וכאב מרכזי. נשאר לחדד איך נראה פתרון שעובד בפועל עבור ${audience}.`;
  }

  return "השאלה הזו סוגרת את הפער הבא שחסר כדי להבין נכון את הפרויקט.";
}

function buildCompletionReason(session) {
  const answers = session?.conversation?.answers ?? {};
  const audience = typeof answers["target-audience"] === "string" ? answers["target-audience"].trim() : "";
  const problem = typeof answers["core-problem"] === "string" ? answers["core-problem"].trim() : "";
  const solution = typeof answers["successful-solution"] === "string" ? answers["successful-solution"].trim() : "";
  const classification = resolveConversationClassification(session, answers);

  if (classification.projectType === "landing-page" && audience && problem) {
    return "יש כבר מספיק הבנה כדי לסכם דף נחיתה: ברור מי הקהל ומה צריך לתקן במסר או בהמרה, ולכן לא נדרש עוד סבב שאלות לפני סיכום ההבנה.";
  }

  if (audience && problem && solution) {
    return "יש כבר קהל יעד, כאב מרכזי ותמונת פתרון. זה מספיק כדי לעצור את השיחה ולעבור לסיכום ההבנה.";
  }

  return "יש מספיק הבנה ראשונית כדי לעצור כאן ולעבור לסיכום ההבנה.";
}

function resolveConversationProjectType(session) {
  const intakeProjectType = typeof session?.projectIntake?.projectType === "string"
    ? session.projectIntake.projectType.trim()
    : "";
  if (intakeProjectType && intakeProjectType !== "unknown") {
    return intakeProjectType;
  }

  const answers = session?.conversation?.answers ?? {};
  const projectClassAnswer = typeof answers["project-class"] === "string" ? answers["project-class"].trim() : "";
  if (projectClassAnswer) {
    const projectTypeFromAnswer = detectProjectType(projectClassAnswer);
    if (projectTypeFromAnswer !== "unknown") {
      return projectTypeFromAnswer;
    }
  }

  const projectType = session?.projectIntake?.projectType;
  if (typeof projectType === "string" && projectType.trim()) {
    return projectType.trim();
  }

  const sourceText = [
    session?.projectIntake?.visionText,
    session?.projectDraft?.goal,
    session?.initialInput?.goal,
    session?.initialInput?.raw,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join("\n");

  return detectProjectType(sourceText);
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

function resolveSolutionLabel(projectType) {
  if (projectType === "landing-page") {
    return "כיוון לדף הנחיתה";
  }
  if (projectType === "commerce-ops") {
    return "כיוון למסחר ולתפעול";
  }
  if (projectType === "internal-tool") {
    return "כיוון לזרימת העבודה";
  }
  if (projectType === "saas") {
    return "כיוון למוצר";
  }
  return "כיוון לפתרון";
}

function buildMissingItemsForProjectType({ projectType, audience, problem, solution }) {
  if (!audience) {
    return ["מי קהל היעד המרכזי"];
  }

  if (!problem) {
    if (projectType === "landing-page") {
      return [
        "מה גורם לקהל לא לעצור ולהשאיר ליד היום",
        "מה ההבטחה השיווקית שהעמוד חייב להבהיר מיד",
      ];
    }
    if (projectType === "internal-tool") {
      return [
        "איזה צוואר בקבוק תפעולי פוגע בעבודה היומית",
        "מה נשבר כשאין בעלות ברורה על התור",
      ];
    }
    if (projectType === "commerce-ops") {
      return [
        "איפה הזמנות, קטלוג או מלאי נופלים בין בעלי תפקידים",
        "מה נשבר היום במסחר בגלל שאין מסך אחד ברור לצוות",
      ];
    }
    if (projectType === "saas") {
      return [
        "מה קורס בתהליך ה-follow-up היום",
        "מה הפעולה הידנית שחוזרת שוב ושוב ופוגעת בעקביות",
      ];
    }
    return [
      "מה הבעיה הכי כואבת של קהל היעד",
      "מה עוצר אותם היום מלהתקדם",
    ];
  }

  if (!solution) {
    if (projectType === "landing-page") {
      return [
        "איך נראה דף נחיתה מוצלח מבחינת ההצעה, האמון וה-CTA",
        "איזו פעולה המשתמש צריך לבצע מיד כשהעמוד ברור לו",
      ];
    }
    if (projectType === "internal-tool") {
      return [
        "איך נראה מסך עבודה מוצלח עבור הנציג",
        "איזו פעולה ראשונה חייבת להיות ברורה בכל תיק או תור",
      ];
    }
    if (projectType === "commerce-ops") {
      return [
        "איך נראה מרכז מסחר מוצלח עבור הצוות",
        "איזו פעולה ראשונה חייבת להיות ברורה על הזמנה, קטלוג או חריגת מלאי",
      ];
    }
    if (projectType === "saas") {
      return [
        "איך נראה follow-up מוצלח בתוך המוצר",
        "מה המשתמש חייב לראות או לקבל כדי לא לפספס ליד נוסף",
      ];
    }
    return ["איך נראה פתרון מוצלח מבחינתם"];
  }

  if (projectType === "landing-page") {
    return [
      "מה ההבטחה הראשית שחייבת להופיע מעל הקפל",
      "איזה הוכחת אמון תחזק את ה-CTA המרכזי",
    ];
  }
  if (projectType === "internal-tool") {
    return [
      "איפה הבעלות על התור חייבת להיות גלויה",
      "מה הפעולה הבאה שכל נציג חייב להבין בלי הדרכה",
    ];
  }
  if (projectType === "commerce-ops") {
    return [
      "איפה חריגות הזמנה או מלאי חייבות להיות גלויות מיד",
      "מה הפעולה הבאה שכל איש מסחר צריך להבין בלי לחפש בין מסכים",
    ];
  }
  if (projectType === "saas") {
    return [
      "מה הפעולה הראשונה אחרי כניסה למוצר",
      "איזה follow-up חייב להופיע בלי עבודת יד",
    ];
  }

  return [
    "איך הם משתמשים היום",
    "איך נראה פתרון מוצלח מבחינתם",
  ];
}

function buildConversationSummary(session) {
  const answers = session?.conversation?.answers ?? {};
  const audience = typeof answers["target-audience"] === "string" ? answers["target-audience"].trim() : "";
  const problem = typeof answers["core-problem"] === "string" ? answers["core-problem"].trim() : "";
  const solution = typeof answers["successful-solution"] === "string" ? answers["successful-solution"].trim() : "";
  const projectType = resolveConversationProjectType(session);
  const projectTypeLabel = resolveProjectTypeLabel(projectType);
  const effectiveSolution = projectType === "landing-page" && audience && problem && !solution
    ? "__landing-sufficient__"
    : solution;

  const understoodItems = [];
  const missingItems = buildMissingItemsForProjectType({
    projectType,
    audience,
    problem,
    solution: effectiveSolution,
  });

  if (audience) {
    understoodItems.push(`קהל יעד: ${audience}`);
  }
  if (problem) {
    understoodItems.push(`בעיה מרכזית: ${problem}`);
  }
  if (solution) {
    understoodItems.push(`${resolveSolutionLabel(projectType)}: ${solution}`);
  }

  return {
    understoodTitle: "מה הבנתי עד עכשיו",
    understoodItems,
    missingTitle: "מה חסר לי",
    missingItems,
    projectType,
    projectTypeLabel,
  };
}

function buildConversationStateEnvelope(session) {
  const conversation = session?.conversation ?? null;
  if (!conversation) {
    return null;
  }

  const nextQuestionId = resolveNextConversationQuestionId(session, conversation.answers);
  const currentQuestionDefinition = getOnboardingQuestionDefinition(nextQuestionId);
  const adaptiveQuestionCount = buildAdaptiveQuestionPlan(session, conversation.answers).length;
  const currentQuestion = currentQuestionDefinition
    ? {
        id: currentQuestionDefinition.id,
        title: buildAgentPrompt(session, currentQuestionDefinition.id),
        placeholder: resolveQuestionPresentation(session, currentQuestionDefinition.id)?.placeholder ?? currentQuestionDefinition.placeholder,
        reason: buildQuestionReason(session, currentQuestionDefinition.id),
      }
    : null;
  const currentIndex = Object.values(conversation.answers ?? {}).filter((value) => typeof value === "string" && value.trim()).length;
  const isComplete = nextQuestionId === null;
  const totalQuestions = Math.max(
    adaptiveQuestionCount,
    currentIndex + (currentQuestion ? 1 : 0),
  );

  return {
    onboardingConversation: {
      sessionId: session.sessionId,
      transcript: conversation.transcript,
      summary: buildConversationSummary(session),
      currentQuestion,
      currentIndex,
      totalQuestions,
      isComplete,
      completionReason: isComplete ? buildCompletionReason(session) : null,
      answers: conversation.answers,
    },
  };
}

function createConversationState(session) {
  const openingPrompt = buildAgentPrompt(session, "target-audience");
  return {
    answers: {},
    transcript: openingPrompt
      ? [
          {
            id: "ai-1",
            speaker: "ai",
            text: openingPrompt,
            time: formatConversationTime(),
          },
        ]
      : [],
  };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validatePayload(payload, schema = {}) {
  if (!isPlainObject(payload)) {
    return false;
  }

  if (Array.isArray(schema.requiredKeys)) {
    return schema.requiredKeys.every((key) => key in payload);
  }

  return true;
}

function createProjectDraftSnapshot({
  userId,
  projectDraftId,
  initialInput = null,
  existingProjectDraft = null,
} = {}) {
  return defineProjectDraftSchema({
    userIdentity: {
      userId: userId ?? null,
      email: existingProjectDraft?.owner?.email ?? null,
      displayName: existingProjectDraft?.owner?.displayName ?? null,
    },
    initialInput: {
      ...(initialInput ?? {}),
      projectDraftId,
    },
    existingProjectDraft,
  }).projectDraft;
}

export class OnboardingService {
  constructor() {
    this.sessions = new Map();
    this.actionRegistry = this.createActionRegistry();
  }

  createSession({ userId, projectDraftId, initialInput }) {
    const parsedInput = parseInitialInput(initialInput);
    const resolvedDraftId = toSlug(projectDraftId ?? parsedInput.projectName ?? "project-draft");
    const resolvedName = parsedInput.projectName ?? projectDraftId ?? "Project Draft";
    const now = new Date().toISOString();
    const session = {
      sessionId: createSessionId(resolvedDraftId),
      userId: String(userId ?? "anonymous"),
      projectDraftId: resolvedDraftId,
      currentStep: parsedInput.goal ? "review-intake" : "capture-vision",
      nextStep: parsedInput.goal ? "confirm-project-setup" : "review-intake",
      status: "active",
      createdAt: now,
      updatedAt: now,
      initialInput: parsedInput,
      projectIntake: null,
      requiredActions: [],
      approvals: [],
      connectedSources: {
        repo: null,
      },
      conversation: null,
      projectDraft: createProjectDraftSnapshot({
        userId,
        projectDraftId: resolvedDraftId,
        initialInput: {
          ...parsedInput,
          projectName: resolvedName,
          goal: parsedInput.goal,
          creationSource: "onboarding-session",
        },
      }),
    };

    session.conversation = createConversationState(session);

    this.sessions.set(session.sessionId, session);
    return session;
  }

  createProjectIntake({ projectName, visionText, uploadedFiles = [], externalLinks = [] }) {
    const projectIntake = buildProjectIntake({
      projectName,
      visionText,
      uploadedFiles,
      externalLinks,
    });
    const parsedSignals = buildParsedSignals(projectIntake);
    const missingInputs = inferMissingInputs(projectIntake);

    return {
      projectIntake,
      parsedSignals,
      missingInputs,
    };
  }

  resolveStep({ onboardingSession, projectIntake }) {
    const resolved = resolveOnboardingSteps({
      onboardingSession,
      projectIntake,
    });

    if (onboardingSession?.sessionId && this.sessions.has(onboardingSession.sessionId)) {
      const existing = this.sessions.get(onboardingSession.sessionId);
      const updatedSession = {
        ...existing,
        currentStep: resolved.currentStep,
        updatedAt: new Date().toISOString(),
        projectIntake,
        requiredActions: resolved.requiredActions,
        nextStep: resolved.nextStep,
      };
      this.sessions.set(onboardingSession.sessionId, updatedSession);
    }

    return resolved;
  }

  createActionRegistry() {
    return {
      "create-project-draft": {
        actionSchema: {
          requiredKeys: [],
        },
        handler: this.createProjectDraftMutationHandler.bind(this),
      },
      "upload-spec": {
        actionSchema: {
          requiredKeys: [],
        },
        handler: this.createIntakeUpdateHandler.bind(this),
      },
      "connect-repo": {
        actionSchema: {
          requiredKeys: ["provider"],
        },
        handler: this.createRepoConnectionHandler.bind(this),
      },
      "approve-choice": {
        actionSchema: {
          requiredKeys: ["choice"],
        },
        handler: this.createApprovalCaptureHandler.bind(this),
      },
      "advance-step": {
        actionSchema: {
          requiredKeys: [],
        },
        handler: this.createOnboardingStepAdvancementHandler.bind(this),
      },
    };
  }

  createProjectDraftMutationHandler({ session, payload, now }) {
    const projectName = typeof payload.projectName === "string" && payload.projectName.trim()
      ? payload.projectName.trim()
      : session.projectDraft.name;
    const goal = typeof payload.goal === "string" ? payload.goal.trim() : session.projectDraft.goal;

    return {
      ...session,
      updatedAt: now,
      projectDraft: createProjectDraftSnapshot({
        userId: session.userId,
        projectDraftId: session.projectDraftId,
        initialInput: {
          ...session.initialInput,
          projectName,
          goal,
          creationSource: session.projectDraft?.creationSource ?? "onboarding-session",
        },
        existingProjectDraft: {
          ...session.projectDraft,
          state: {
            ...session.projectDraft.state,
            businessGoal: goal,
          },
        },
      }),
    };
  }

  createIntakeUpdateHandler({ session, payload, now }) {
    const intake = this.createProjectIntake({
      projectName: payload.projectName ?? session.projectIntake?.projectName ?? session.projectDraft.name,
      visionText: payload.visionText ?? session.projectIntake?.visionText ?? session.projectDraft.goal,
      uploadedFiles: payload.uploadedFiles ?? [],
      externalLinks: payload.externalLinks ?? [],
    });
    const resolved = resolveOnboardingSteps({
      onboardingSession: session,
      projectIntake: intake.projectIntake,
    });

    return {
      ...session,
      updatedAt: now,
      currentStep: resolved.currentStep,
      nextStep: resolved.nextStep,
      requiredActions: resolved.requiredActions,
      projectIntake: intake.projectIntake,
      projectDraft: createProjectDraftSnapshot({
        userId: session.userId,
        projectDraftId: session.projectDraftId,
        initialInput: {
          ...session.initialInput,
          projectName: intake.projectIntake.projectName ?? session.projectDraft.name,
          goal: intake.projectIntake.visionText || session.projectDraft.goal,
          attachments: intake.projectIntake.uploadedFiles,
          links: intake.projectIntake.externalLinks,
          requestedDeliverables: intake.projectIntake.requestedDeliverables,
          creationSource: session.projectDraft?.creationSource ?? "onboarding-session",
        },
        existingProjectDraft: {
          ...session.projectDraft,
          state: {
            ...session.projectDraft.state,
            businessGoal: intake.projectIntake.visionText || session.projectDraft.state.businessGoal,
            knowledge: {
              ...(session.projectDraft.state.knowledge ?? {}),
              knownGaps: intake.missingInputs,
            },
          },
        },
      }),
    };
  }

  createRepoConnectionHandler({ session, payload, now }) {
    return {
      ...session,
      updatedAt: now,
      connectedSources: {
        ...session.connectedSources,
        repo: {
          provider: payload.provider ?? "unknown",
          repoUrl: payload.repoUrl ?? null,
          owner: payload.owner ?? null,
          repo: payload.repo ?? null,
        },
      },
    };
  }

  createApprovalCaptureHandler({ session, payload, now }) {
    const approvalLabel = typeof payload.choice === "string" ? payload.choice.trim() : null;

    return {
      ...session,
      updatedAt: now,
      approvals: approvalLabel ? appendUnique(session.approvals, approvalLabel) : session.approvals,
    };
  }

  createOnboardingStepAdvancementHandler({ session, now }) {
    const projectIntake = session.projectIntake ?? buildProjectIntake({
      visionText: session.projectDraft.goal,
      uploadedFiles: [],
      externalLinks: [],
    });
    const resolved = resolveOnboardingSteps({
      onboardingSession: session,
      projectIntake,
    });

    return {
      ...session,
      updatedAt: now,
      currentStep: resolved.nextStep ?? resolved.currentStep,
      nextStep: resolved.nextStep,
      requiredActions: resolved.requiredActions,
      projectIntake,
    };
  }

  submitConversationTurn({ sessionId, answer = "" }) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const normalizedAnswer = typeof answer === "string" ? answer.trim() : "";
    if (!normalizedAnswer) {
      return buildConversationStateEnvelope(session);
    }

    const conversation = session.conversation ?? createConversationState(session);
    const nextQuestionId = resolveNextConversationQuestionId(session, conversation.answers);
    const question = getOnboardingQuestionDefinition(nextQuestionId);
    if (!question) {
      return buildConversationStateEnvelope(session);
    }

    const timestamp = formatConversationTime();
    const nextAnswers = {
      ...conversation.answers,
      [question.id]: normalizedAnswer,
    };
    const nextTranscript = [
      ...conversation.transcript,
      {
        id: `user-${nextAnswers ? Object.keys(nextAnswers).length : conversation.transcript.length + 1}`,
        speaker: "user",
        text: normalizedAnswer,
        time: timestamp,
      },
    ];

    const nextConversation = {
      ...conversation,
      answers: nextAnswers,
      transcript: nextTranscript,
    };

    const nextQuestionAfterAnswer = resolveNextConversationQuestionId({ ...session, conversation: nextConversation }, nextAnswers);
    const nextPrompt = buildAgentPrompt({ ...session, conversation: nextConversation }, nextQuestionAfterAnswer);
    if (nextPrompt) {
      nextConversation.transcript = [
        ...nextConversation.transcript,
        {
          id: `ai-${nextConversation.transcript.length + 1}`,
          speaker: "ai",
          text: nextPrompt,
          time: formatConversationTime(),
        },
      ];
    }

    const updatedSession = {
      ...session,
      updatedAt: new Date().toISOString(),
      conversation: nextConversation,
      projectDraft: createProjectDraftSnapshot({
        userId: session.userId,
        projectDraftId: session.projectDraftId,
        initialInput: {
          ...session.initialInput,
          projectName: session.projectDraft?.name ?? session.initialInput?.projectName ?? "Project Draft",
          goal: session.projectDraft?.goal ?? session.initialInput?.goal ?? "",
          onboardingConversationAnswers: nextAnswers,
          creationSource: session.projectDraft?.creationSource ?? "onboarding-session",
        },
        existingProjectDraft: {
          ...session.projectDraft,
          state: {
            ...session.projectDraft.state,
            knowledge: {
              ...(session.projectDraft.state?.knowledge ?? {}),
              onboardingConversationAnswers: nextAnswers,
            },
          },
        },
      }),
    };

    this.sessions.set(sessionId, updatedSession);
    return buildConversationStateEnvelope(updatedSession);
  }

  getConversationState(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }
    if (!session.conversation) {
      session.conversation = createConversationState(session);
      this.sessions.set(sessionId, session);
    }
    return buildConversationStateEnvelope(session);
  }

  restartConversation(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const updatedSession = {
      ...session,
      updatedAt: new Date().toISOString(),
      conversation: createConversationState(session),
    };

    this.sessions.set(sessionId, updatedSession);
    return buildConversationStateEnvelope(updatedSession);
  }

  createOnboardingCommandResultEnvelope({ actionType, actionSchema, updatedSession }) {
    return {
      updatedSession,
      projectDraft: updatedSession.projectDraft,
      commandMetadata: {
        actionType,
        actionSchema,
      },
    };
  }

  resolveAction(actionType, payload = {}) {
    const resolvedHandler = this.actionRegistry[actionType] ?? null;
    if (!resolvedHandler) {
      return null;
    }

    return {
      resolvedHandler,
      actionSchema: resolvedHandler.actionSchema,
      isValid: validatePayload(payload, resolvedHandler.actionSchema),
    };
  }

  handleCommand({ sessionId, actionType, payload = {} }) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const now = new Date().toISOString();
    const action = this.resolveAction(actionType, payload);
    if (!action || !action.isValid) {
      return null;
    }

    const updatedSession = action.resolvedHandler.handler({
      session,
      payload,
      now,
    });

    this.sessions.set(sessionId, updatedSession);
    return this.createOnboardingCommandResultEnvelope({
      actionType,
      actionSchema: action.actionSchema,
      updatedSession,
    });
  }

  updateIntake({ sessionId, projectName, visionText, uploadedFiles = [], externalLinks = [] }) {
    return this.handleCommand({
      sessionId,
      actionType: "upload-spec",
      payload: {
        projectName,
        visionText,
        uploadedFiles,
        externalLinks,
      },
    });
  }

  uploadFiles({ sessionId, uploadedFiles = [] }) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    return this.handleCommand({
      sessionId,
      actionType: "upload-spec",
      payload: {
        projectName: session.projectIntake?.projectName ?? session.projectDraft.name,
        visionText: session.projectIntake?.visionText ?? session.projectDraft.goal,
        uploadedFiles: [...(session.projectIntake?.uploadedFiles ?? []), ...uploadedFiles],
        externalLinks: session.projectIntake?.externalLinks ?? [],
      },
    });
  }

  getCurrentStep(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    return {
      sessionId: session.sessionId,
      currentStep: session.currentStep,
      nextStep: session.nextStep ?? null,
      requiredActions: session.requiredActions ?? [],
    };
  }

  finishSession(sessionId, { onboardingCompletionDecision = null } = {}) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const normalizedDecision = onboardingCompletionDecision && typeof onboardingCompletionDecision === "object"
      ? onboardingCompletionDecision
      : null;
    const now = new Date().toISOString();
    const isReadyToComplete = normalizedDecision?.isComplete === true;
    const completionStatus = normalizedDecision?.completionStatus ?? (isReadyToComplete ? "completed" : "needs-clarification");
    const resolvedSteps = resolveOnboardingSteps({
      onboardingSession: session,
      projectIntake: session.projectIntake ?? buildProjectIntake({
        projectName: session.projectDraft?.name ?? session.initialInput?.projectName ?? "",
        visionText: session.projectDraft?.goal ?? session.initialInput?.goal ?? "",
        uploadedFiles: session.projectIntake?.uploadedFiles ?? session.initialInput?.attachments ?? [],
        externalLinks: session.projectIntake?.externalLinks ?? session.initialInput?.links ?? [],
      }),
    });
    const finishedSession = {
      ...session,
      status: completionStatus,
      currentStep: isReadyToComplete ? "completed" : resolvedSteps.currentStep,
      nextStep: isReadyToComplete ? null : resolvedSteps.nextStep,
      requiredActions: isReadyToComplete ? [] : resolvedSteps.requiredActions,
      updatedAt: now,
    };

    this.sessions.set(sessionId, finishedSession);
    return {
      updatedSession: finishedSession,
      projectDraft: finishedSession.projectDraft,
    };
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId) ?? null;
  }

  listSessions() {
    return [...this.sessions.values()];
  }
}
