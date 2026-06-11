function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function hasPattern(message, patterns = []) {
  const normalized = normalizeString(message).toLowerCase();
  return patterns.some((pattern) => pattern.test(normalized));
}

function includesEventType(events, suffix) {
  return events.some((event) => normalizeString(event?.eventType).endsWith(suffix));
}

function collectIds(project = {}, events = []) {
  const runtimeSkeletonTruth = normalizeObject(
    project.runtimeSkeletonTruth
      ?? project.context?.runtimeSkeletonTruth
      ?? project.state?.runtimeSkeletonTruth,
  );
  const productDomainSkeleton = normalizeObject(
    project.productDomainSkeleton
      ?? project.context?.productDomainSkeleton
      ?? project.state?.productDomainSkeleton,
  );
  const skeletonChoiceTruth = normalizeObject(
    project.skeletonChoiceTruth
      ?? project.context?.skeletonChoiceTruth
      ?? project.state?.skeletonChoiceTruth,
  );
  return {
    projectId: normalizeString(project.id, null),
    runtimeSkeletonId: normalizeString(
      runtimeSkeletonTruth.runtimeSkeletonId,
      normalizeString(events.find((event) => event?.runtimeSkeletonId)?.runtimeSkeletonId, null),
    ),
    productDomainSkeletonId: normalizeString(
      productDomainSkeleton.productDomainSkeletonId,
      normalizeString(events.find((event) => event?.productDomainSkeletonId)?.productDomainSkeletonId, null),
    ),
    selectedSkeletonCandidateId: normalizeString(skeletonChoiceTruth.selectedSkeletonCandidateId, null),
    selectedCompositionStyle: normalizeString(skeletonChoiceTruth.selectedCompositionStyle, null),
    selectedProductDirection: normalizeString(skeletonChoiceTruth.selectedProductDirection, null),
    skeletonChoiceStatus: normalizeString(skeletonChoiceTruth.status, null),
  };
}

function resolveProductPatternLearningDecision(project = {}) {
  const runtimeSkeletonTruth = normalizeObject(
    project.runtimeSkeletonTruth
      ?? project.context?.runtimeSkeletonTruth
      ?? project.state?.runtimeSkeletonTruth,
  );
  return normalizeObject(
    runtimeSkeletonTruth.productPatternLearningDecision
      ?? project.productPatternLearningDecision
      ?? project.context?.productPatternLearningDecision
      ?? project.state?.productPatternLearningDecision,
  );
}

export function createBuildAgentLearningInstructions({
  project = {},
  message = "",
  currentSurface = "loop",
} = {}) {
  const events = normalizeArray(
    project.runtimeLearningEvents
      ?? project.context?.runtimeLearningEvents
      ?? project.state?.runtimeLearningEvents,
  );
  const decisionHints = normalizeObject(
    project.runtimeLearningDecisionHints
      ?? project.context?.runtimeLearningDecisionHints
      ?? project.state?.runtimeLearningDecisionHints,
  );
  const productPatternLearningDecision = resolveProductPatternLearningDecision(project);
  const ids = collectIds(project, events);
  const routingHints = [];
  const instructions = [
    "Use these learning signals as bounded working instructions before replying.",
    "Do not present learning as product truth unless project truth or a mutation result proves it.",
    "Do not claim a build change succeeded unless a real mutation or downstream result was applied.",
  ];
  const strongestPattern = normalizeObject(productPatternLearningDecision.strongestPattern);
  if (normalizeString(strongestPattern.patternId, "")) {
    routingHints.push("product-pattern-learning-before-reply");
    instructions.push(`Consider learned product pattern ${strongestPattern.patternId} before routing or replying, but do not present it as product truth unless the current project truth confirms it.`);
  }
  if (ids.selectedSkeletonCandidateId) {
    routingHints.push("selected-skeleton-candidate-before-reply");
    instructions.push(`Continue from selected skeleton candidate ${ids.selectedSkeletonCandidateId}; do not switch product direction or composition style without approval.`);
  }

  const providerOrReleaseRequest = hasPattern(message, [
    /וואטסאפ/,
    /פרסם|לפרסם|שחרר|לשחרר/,
    /תשלום|חיוב|כרטיס אשראי|כרטיס תשלום/,
    /ספק|חיבור אמיתי|אינטגרציה אמיתית/,
    /whatsapp/,
    /publish|deploy|release/,
    /payment|charge|card/,
    /provider|real integration/,
  ]);
  if (providerOrReleaseRequest) {
    routingHints.push("provider-release-boundary");
    instructions.push("Treat real provider connection, publishing, payment, and release requests as bounded or approval-required work, not as ordinary safe changes.");
  }

  const safeChangeRequest = hasPattern(message, [
    /תוסיף|להוסיף|שנה|תשנה|עדכן|תעדכן|סנן|סינון/,
    /שדה|עמודה|כפתור|מסך|רשימה|ליד|רשומה|סטטוס|אחראי|תזכורת/,
    /add|change|update|filter|field|column|button|screen|list|status|owner|reminder/,
  ]);
  if (safeChangeRequest) {
    routingHints.push("mutation-required-before-success");
    instructions.push("Route safe build changes through the mutation or visual-build owner before saying the product changed.");
  }

  if (includesEventType(events, ".failed")) {
    routingHints.push("prior-failure-requires-retry-or-clarification");
    instructions.push("If prior build mutation learning shows failure, preserve retry or clarification instead of presenting fake success.");
  }

  const eventTypes = normalizeArray(decisionHints.eventTypes).length
    ? normalizeArray(decisionHints.eventTypes)
    : [...new Set(events.map((event) => normalizeString(event?.eventType)).filter(Boolean))];

  return {
    taskId: "BLD-AGT-001",
    sourceTaskId: "LEARNING-RUNTIME-001",
    status: events.length > 0 ? "live" : "empty",
    currentSurface,
    ...ids,
    signalCount: events.length,
    eventTypes,
    routingHints: [...new Set(routingHints)],
    instructions,
    productPatternLearningDecision,
    selectedSkeletonCandidateId: ids.selectedSkeletonCandidateId,
    selectedCompositionStyle: ids.selectedCompositionStyle,
    selectedProductDirection: ids.selectedProductDirection,
    skeletonChoiceStatus: ids.skeletonChoiceStatus,
    mustUseBeforeReply: true,
    mayOverwriteProjectTruth: false,
    truthBoundary: "learning-instructions-only-do-not-overwrite-product-truth",
  };
}
