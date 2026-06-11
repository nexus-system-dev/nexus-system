function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
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

function extractRecommendedPatterns(source = {}) {
  const normalized = normalizeObject(source);
  return normalizeArray(normalized.recommendedPatterns)
    .map((pattern) => normalizeObject(pattern))
    .map((pattern) => ({
      patternId: normalizeString(pattern.patternId ?? pattern.recommendedPattern ?? pattern.productPattern, ""),
      productClass: normalizeString(pattern.productClass, ""),
      skeletonFamily: normalizeString(pattern.skeletonFamily ?? pattern.shellFamily, ""),
      domainKind: normalizeString(pattern.domainKind, ""),
      confidence: typeof pattern.confidence === "number" ? pattern.confidence : 0.62,
      signalCount: typeof pattern.signalCount === "number" ? pattern.signalCount : 1,
      reason: normalizeString(pattern.reason, "למידה קודמת מצביעה על דפוס מוצר רלוונטי."),
      eventTypes: normalizeArray(pattern.eventTypes).map((eventType) => normalizeString(eventType, "")).filter(Boolean),
    }))
    .filter((pattern) => pattern.patternId);
}

function patternMatchesText(pattern, text) {
  const normalized = normalizeText(text);
  const patternId = normalizeString(pattern.patternId, "");
  if (!normalized || !patternId) {
    return false;
  }
  const tokensByPattern = {
    "editor-canvas": ["canvas", "editor", "draw", "shape", "layer", "קנבס", "עורך", "צורה", "שכבה"],
    "simulator-state": ["simulator", "simulate", "scenario", "metric", "control", "סימולטור", "סימולציה", "תרחיש", "מדד"],
    "game-loop": ["game", "play", "score", "level", "משחק", "שחקן", "ניקוד", "שלב"],
    "tool-io": ["tool", "input", "output", "calculate", "convert", "כלי", "קלט", "פלט", "מחשבון", "ממיר"],
    "management-records": ["records", "status", "owner", "table", "crm", "רשומות", "סטטוס", "אחראי", "טבלה"],
    "web-page-flow": ["landing", "website", "page", "form", "דף", "אתר", "טופס"],
    "app-navigation": ["app", "mobile", "screen", "navigation", "אפליקציה", "מסך", "ניווט"],
  };
  return normalizeArray(tokensByPattern[patternId]).some((token) => normalized.includes(token));
}

export function createProductPatternLearningDecision({
  project = {},
  productClass = "",
  texts = [],
  productSkeleton = {},
  artifactExpectation = {},
  generationIntent = {},
} = {}) {
  const safeProject = normalizeObject(project);
  const safeProductSkeleton = normalizeObject(productSkeleton);
  const safeArtifactExpectation = normalizeObject(artifactExpectation);
  const safeGenerationIntent = normalizeObject(generationIntent);
  const decisionHints = normalizeObject(
    safeProject.runtimeLearningDecisionHints
      ?? safeProject.context?.runtimeLearningDecisionHints
      ?? safeProject.state?.runtimeLearningDecisionHints,
  );
  const recommendedPatterns = extractRecommendedPatterns(decisionHints);
  const corpus = flattenText([
    texts,
    safeProject.name,
    safeProject.goal,
    safeProductSkeleton.productType,
    safeProductSkeleton.primaryProblem,
    safeProductSkeleton.firstWorkflow?.title,
    safeProductSkeleton.firstWorkflow?.steps ?? [],
    safeArtifactExpectation.projectType,
    safeArtifactExpectation.deliverableLabel,
    safeArtifactExpectation.title,
    safeGenerationIntent.productClass,
  ]);
  const applicablePatterns = recommendedPatterns
    .map((pattern) => ({
      ...pattern,
      relevance: patternMatchesText(pattern, corpus) ? "direct" : "weak",
      influenceScore: (pattern.confidence * 10) + (pattern.signalCount * 2) + (patternMatchesText(pattern, corpus) ? 6 : 0),
    }))
    .sort((left, right) => right.influenceScore - left.influenceScore);
  const strongest = applicablePatterns[0] ?? null;
  const status = strongest ? "live" : "empty";

  return {
    taskId: "LEARNING-PRODUCT-INTELLIGENCE-001",
    status,
    sourceTaskIds: ["LEARNING-RUNTIME-001", "PRODUCT-KIND-001"],
    projectId: normalizeString(safeProject.id ?? safeProject.projectId, ""),
    productClass: normalizeString(productClass, ""),
    recommendedPatterns: applicablePatterns,
    strongestPattern: strongest
      ? {
          patternId: strongest.patternId,
          productClass: strongest.productClass,
          skeletonFamily: strongest.skeletonFamily,
          domainKind: strongest.domainKind,
          confidence: strongest.confidence,
          relevance: strongest.relevance,
          reason: strongest.reason,
        }
      : null,
    mustUseBeforeProductKindDecision: true,
    mustUseBeforeAgentReply: true,
    mayOverwriteProjectTruth: false,
    truthBoundary: "learning-product-intelligence-recommends-only-does-not-overwrite-project-truth",
    decisionUse: "recommend-product-pattern-skeleton-family-or-clarification-before-agent-response",
  };
}
