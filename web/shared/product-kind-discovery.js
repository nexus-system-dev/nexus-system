function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeText(value) {
  return normalizeString(value, "").toLowerCase();
}

function flattenText(values = []) {
  return values
    .flat(Infinity)
    .map((value) => {
      if (typeof value === "string") return value;
      if (value && typeof value === "object") return Object.values(value).join(" ");
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

const PRODUCT_PATTERN_DEFINITIONS = {
  "game-loop": {
    label: "משחק",
    productClass: "game",
    skeletonFamily: "playable-preview",
    domainKind: "game-state-rules-local-state",
    firstBehavior: "סצנה, שחקן, חוקים, ניקוד ופעולת משחק ראשונה.",
    keywords: ["game", "playable", "gameplay", "player", "score", "level", "enemy", "physics", "jump", "maze", "puzzle", "unity", "unreal", "משחק", "שחקן", "ניקוד", "שלב", "אויב", "מבוך", "פאזל"],
  },
  "editor-canvas": {
    label: "עורך",
    productClass: "software-tool",
    skeletonFamily: "editor-canvas-shell",
    domainKind: "editor-document-local-state",
    firstBehavior: "קנבס, סרגל כלים, אובייקט נבחר, שינוי והיסטוריית פעולות.",
    keywords: ["editor", "canvas", "draw", "design", "timeline", "crop", "layers", "toolbar", "undo", "redo", "selected object", "עורך", "קנבס", "ציור", "שכבות", "סרגל כלים", "בחירה", "בטל", "חזור"],
  },
  "simulator-state": {
    label: "סימולטור",
    productClass: "software-tool",
    skeletonFamily: "simulator-control-shell",
    domainKind: "simulator-state-control-local-state",
    firstBehavior: "מצב, שליטה, מדדים ותוצאה משתנה אחרי פעולה.",
    keywords: ["simulator", "simulation", "simulate", "model", "scenario", "control", "parameters", "metrics", "what if", "סימולטור", "סימולציה", "תרחיש", "מדדים", "שליטה", "פרמטרים"],
  },
  "tool-io": {
    label: "כלי קלט־פלט",
    productClass: "software-tool",
    skeletonFamily: "tool-control-shell",
    domainKind: "tool-operation-local-state",
    firstBehavior: "קלט, פעולה, פלט, מצב והיסטוריית הרצות.",
    keywords: ["calculator", "generator", "converter", "processor", "analyzer", "input", "output", "upload", "file", "export", "מחשבון", "מחולל", "ממיר", "מעבד", "ניתוח", "קלט", "פלט", "קובץ"],
  },
  "management-records": {
    label: "מערכת ניהול",
    productClass: "internal-tool",
    skeletonFamily: "workspace-state-shell",
    domainKind: "workflow-record-local-state",
    firstBehavior: "רשומות, סטטוסים, סינון, אחראי ופעולות על רשומה.",
    keywords: ["records", "status", "assignee", "owner", "reminder", "kanban", "table", "crm", "leads", "orders", "management", "רשומות", "סטטוס", "אחראי", "תזכורת", "טבלה", "ניהול", "לידים", "הזמנות"],
  },
  "workflow-system": {
    label: "זרימת עבודה",
    productClass: "internal-tool",
    skeletonFamily: "product-workflow-shell",
    domainKind: "workflow-record-local-state",
    firstBehavior: "שלבים, משימות, מעבר בין מצבים והחלטת הצעד הבא.",
    keywords: ["workflow", "pipeline", "approval", "review", "handoff", "queue", "step", "next step", "זרימה", "תהליך", "אישור", "סקירה", "תור", "שלב", "צעד הבא"],
  },
  "app-navigation": {
    label: "אפליקציה",
    productClass: "mobile-app",
    skeletonFamily: "mobile-simulator",
    domainKind: "mobile-local-app-state",
    firstBehavior: "מסכים, ניווט, מצב מקומי ופעולות משתמש חוזרות.",
    keywords: ["mobile app", "app", "ios", "android", "phone", "screen", "navigation", "tab", "אפליקציה", "אייפון", "אנדרואיד", "מסכים", "ניווט"],
  },
  "web-page-flow": {
    label: "אתר או דף",
    productClass: "landing-page",
    skeletonFamily: "web-page-preview",
    domainKind: "lead-capture-local-state",
    firstBehavior: "עמוד, ערך מרכזי, קריאה לפעולה וטופס או המשך ברור.",
    keywords: ["landing page", "website", "site", "homepage", "hero", "cta", "form", "marketing", "דף נחיתה", "אתר", "עמוד", "טופס", "שיווק"],
  },
  "commerce-flow": {
    label: "מסחר",
    productClass: "commerce-ops",
    skeletonFamily: "commerce-flow-preview",
    domainKind: "cart-order-draft-local-state",
    firstBehavior: "מוצרים, עגלה, טיוטת הזמנה וגבול ברור ללא תשלום אמיתי.",
    keywords: ["commerce", "shop", "store", "cart", "checkout", "product", "inventory", "order", "מסחר", "חנות", "עגלה", "תשלום", "מוצר", "מלאי", "הזמנה"],
  },
  "ai-tool": {
    label: "כלי AI",
    productClass: "software-tool",
    skeletonFamily: "ai-tool-workbench",
    domainKind: "ai-tool-operation-local-state",
    firstBehavior: "קלט, הנחיה, פעולה, תוצאה, היסטוריה וגבול ספקים ברור.",
    keywords: ["ai", "prompt", "chatbot", "agent", "summarize", "generate", "llm", "model", "בינה מלאכותית", "פרומפט", "צאט", "סוכן", "סיכום", "מחולל"],
  },
  "content-document": {
    label: "תוכן",
    productClass: "content-product",
    skeletonFamily: "content-preview",
    domainKind: "content-outline-local-state",
    firstBehavior: "מבנה תוכן, פרקים, מצב עריכה והמשך כתיבה.",
    keywords: ["book", "course", "lesson", "chapter", "content", "newsletter", "ספר", "קורס", "שיעור", "פרק", "תוכן", "ניוזלטר"],
  },
};

const CLASS_TO_PATTERN = {
  game: "game-loop",
  "software-tool": "tool-io",
  "internal-tool": "management-records",
  saas: "workflow-system",
  "mobile-app": "app-navigation",
  "landing-page": "web-page-flow",
  "commerce-ops": "commerce-flow",
  book: "content-document",
  "content-product": "content-document",
};

function scorePattern(text, definition) {
  const normalized = normalizeText(text);
  return definition.keywords.reduce((score, keyword) => {
    const needle = keyword.toLowerCase();
    return normalized.includes(needle) ? score + 1 : score;
  }, 0);
}

function confidenceFromScore(score) {
  if (score <= 0) return 0;
  if (score === 1) return 0.58;
  if (score === 2) return 0.76;
  return 0.92;
}

function resolvePatternFromProductClass(productClass) {
  return CLASS_TO_PATTERN[normalizeString(productClass, "")] ?? "";
}

function createClarificationQuestions(text) {
  const subject = normalizeString(text, "הרעיון");
  return [
    `מה המשתמש עושה שוב ושוב בתוך ${subject}?`,
    "מה חייב להשתנות על המסך אחרי הפעולה הראשונה?",
  ];
}

function normalizeLearningPattern(value) {
  const pattern = normalizeObject(value);
  return {
    patternId: normalizeString(pattern.patternId ?? pattern.recommendedPattern ?? pattern.productPattern, ""),
    productClass: normalizeString(pattern.productClass, ""),
    skeletonFamily: normalizeString(pattern.skeletonFamily ?? pattern.shellFamily, ""),
    domainKind: normalizeString(pattern.domainKind, ""),
    confidence: typeof pattern.confidence === "number" ? pattern.confidence : 0.62,
    relevance: normalizeString(pattern.relevance, "weak"),
    reason: normalizeString(pattern.reason, "למידה קודמת מצביעה על דפוס מוצר רלוונטי."),
  };
}

function resolveLearningPatterns({ learningSignals = [], learningDecision = null } = {}) {
  const decision = normalizeObject(learningDecision);
  const rawPatterns = [
    ...normalizeArray(decision.recommendedPatterns),
    decision.strongestPattern,
    ...normalizeArray(learningSignals),
  ];
  return rawPatterns
    .map(normalizeLearningPattern)
    .filter((pattern) => pattern.patternId && PRODUCT_PATTERN_DEFINITIONS[pattern.patternId]);
}

export function listProductPatternDefinitions() {
  return Object.entries(PRODUCT_PATTERN_DEFINITIONS).map(([patternId, definition]) => ({
    patternId,
    ...definition,
  }));
}

export function resolveProductKindDiscovery({
  productClass = "generic",
  productClassSource = "fallback",
  texts = [],
  productSkeleton = {},
  artifactExpectation = {},
  generationIntent = {},
  learningSignals = [],
  learningDecision = null,
} = {}) {
  const safeProductSkeleton = normalizeObject(productSkeleton);
  const safeArtifactExpectation = normalizeObject(artifactExpectation);
  const safeGenerationIntent = normalizeObject(generationIntent);
  const corpus = flattenText([
    texts,
    safeProductSkeleton.productType,
    safeProductSkeleton.primaryProblem,
    safeProductSkeleton.primaryUser,
    safeProductSkeleton.firstWorkflow?.title,
    safeProductSkeleton.firstWorkflow?.whyThisFirst,
    safeProductSkeleton.firstWorkflow?.steps ?? [],
    safeProductSkeleton.initialActions ?? [],
    safeProductSkeleton.initialScreens?.map((screen) => normalizeObject(screen).name) ?? [],
    safeProductSkeleton.dataObjects?.map((object) => [normalizeObject(object).name, normalizeObject(object).fields ?? []]) ?? [],
    safeProductSkeleton.versionOneBoundary?.buildNow ?? [],
    safeArtifactExpectation.projectType,
    safeArtifactExpectation.deliverableLabel,
    safeArtifactExpectation.title,
    safeArtifactExpectation.summary,
    safeGenerationIntent.productClass,
    learningSignals,
  ]);

  const scored = Object.entries(PRODUCT_PATTERN_DEFINITIONS)
    .map(([patternId, definition]) => ({
      patternId,
      score: scorePattern(corpus, definition),
      definition,
    }))
    .sort((left, right) => right.score - left.score);
  const best = scored[0];
  const learningPatterns = resolveLearningPatterns({ learningSignals, learningDecision });
  const strongestLearningPattern = learningPatterns[0] ?? null;
  const learningPatternId = normalizeString(strongestLearningPattern?.patternId, "");
  const learningPattern = learningPatternId ? PRODUCT_PATTERN_DEFINITIONS[learningPatternId] : null;
  const shouldUseLearningPattern = Boolean(learningPattern)
    && !["explicit", "hint"].includes(normalizeString(productClassSource, "fallback"))
    && strongestLearningPattern.confidence >= 0.6
    && (
      strongestLearningPattern.relevance === "direct"
      || (best?.score ?? 0) <= 1
    );
  const classPatternId = resolvePatternFromProductClass(productClass);
  const classPattern = classPatternId ? PRODUCT_PATTERN_DEFINITIONS[classPatternId] : null;
  const classPatternScore = scored.find((candidate) => candidate.patternId === classPatternId)?.score ?? 0;
  const declaredKindText = flattenText([
    safeProductSkeleton.productType,
    safeArtifactExpectation.projectType,
    safeGenerationIntent.productClass,
  ]);
  const classPatternDeclaredScore = classPattern ? scorePattern(declaredKindText, classPattern) : 0;
  const shouldHonorClassPattern = Boolean(classPatternId)
    && ["explicit", "hint"].includes(normalizeString(productClassSource, "fallback"));
  const shouldPreferDeclaredClassPattern = Boolean(classPatternId)
    && normalizeString(productClassSource, "fallback") === "detected"
    && classPatternDeclaredScore > 0;
  const shouldPreferDetectedClassPattern = Boolean(classPatternId)
    && normalizeString(productClassSource, "fallback") === "detected"
    && classPatternScore > 0
    && classPatternScore >= (best?.score ?? 0);
  const selectedPatternId = shouldHonorClassPattern
    ? classPatternId
    : shouldPreferDeclaredClassPattern
      ? classPatternId
    : shouldUseLearningPattern
      ? learningPatternId
    : shouldPreferDetectedClassPattern
      ? classPatternId
    : best?.score > 0 ? best.patternId : classPatternId || "unknown-product-pattern";
  const selectedDefinition = PRODUCT_PATTERN_DEFINITIONS[selectedPatternId] ?? classPattern;
  const confidence = shouldHonorClassPattern
    ? 0.82
    : shouldPreferDeclaredClassPattern
      ? Math.max(0.76, confidenceFromScore(classPatternDeclaredScore))
    : shouldUseLearningPattern
      ? Math.max(0.64, strongestLearningPattern.confidence)
    : shouldPreferDetectedClassPattern
      ? confidenceFromScore(classPatternScore)
    : best?.score > 0 ? confidenceFromScore(best.score) : classPattern ? 0.52 : 0.18;
  const needsClarification = !selectedDefinition || confidence < 0.5;

  return {
    taskId: "PRODUCT-KIND-001",
    status: needsClarification ? "needs-clarification" : "resolved",
    productKind: selectedDefinition?.label ?? "לא ברור עדיין",
    productPattern: selectedPatternId,
    productClass: selectedDefinition?.productClass ?? normalizeString(productClass, "generic"),
    confidence,
    confidenceBand: confidence >= 0.75 ? "high" : confidence >= 0.5 ? "medium" : "low",
    needsClarification,
    clarificationQuestions: needsClarification ? createClarificationQuestions(corpus.split("\n")[0]) : [],
    unknowns: needsClarification ? ["product-pattern", "first-behavior"] : [],
    patternCandidates: scored
      .filter((candidate) => candidate.score > 0)
      .slice(0, 4)
      .map((candidate) => ({
        patternId: candidate.patternId,
        score: candidate.score,
        productClass: candidate.definition.productClass,
        skeletonFamily: candidate.definition.skeletonFamily,
      })),
    learningDecision: {
      taskId: "LEARNING-PRODUCT-INTELLIGENCE-001",
      status: learningPatterns.length > 0 ? "considered" : "empty",
      applied: shouldUseLearningPattern,
      selectedPatternId: shouldUseLearningPattern ? learningPatternId : "",
      mayOverwriteProjectTruth: false,
      truthBoundary: "learning-can-recommend-product-pattern-but-not-overwrite-project-truth",
      recommendedPatterns: learningPatterns.slice(0, 4),
    },
    skeletonSelection: selectedDefinition
      ? {
          productClass: selectedDefinition.productClass,
          shellFamily: selectedDefinition.skeletonFamily,
          domainKind: selectedDefinition.domainKind,
          firstBehavior: selectedDefinition.firstBehavior,
          reason: shouldUseLearningPattern
            ? strongestLearningPattern.reason
            : "בחירת השלד מבוססת על דפוס הפעולה הראשון של המוצר, לא רק על שם קטגוריה.",
        }
      : {
          productClass: "generic",
          shellFamily: "clarification-required",
          domainKind: "unknown-product-pattern",
          firstBehavior: "צריך להבין קודם מה הפעולה החוזרת ומה משתנה אחרי הפעולה הראשונה.",
          reason: "אין מספיק אמת לבחירת שלד בלי שאלת הבהרה.",
        },
    canonicalProjectTruth: true,
  };
}
