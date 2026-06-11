function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function resolveProjectId(project = {}) {
  return normalizeString(project.id ?? project.projectId, "unknown-project");
}

function resolveRuntimeSkeletonId(runtimeSkeletonTruth = {}) {
  return normalizeString(runtimeSkeletonTruth.runtimeSkeletonId, "");
}

function resolveProductDomainSkeletonId(productDomainSkeleton = {}) {
  return normalizeString(productDomainSkeleton.productDomainSkeletonId, "");
}

function createLearningEvent({
  eventType,
  project = null,
  runtimeSkeletonTruth = null,
  productDomainSkeleton = null,
  mutationIntent = null,
  mutationOutcome = null,
  outcomeId = "",
  source = "project-service",
  now = new Date().toISOString(),
} = {}) {
  const safeProject = normalizeObject(project);
  const runtime = normalizeObject(runtimeSkeletonTruth ?? safeProject.runtimeSkeletonTruth ?? safeProject.context?.runtimeSkeletonTruth);
  const domain = normalizeObject(
    productDomainSkeleton
      ?? safeProject.productDomainSkeleton
      ?? safeProject.context?.productDomainSkeleton
      ?? runtime.productDomainSkeleton,
  );
  const intent = normalizeObject(mutationIntent);
  const outcome = normalizeObject(mutationOutcome);
  const projectId = resolveProjectId(safeProject);
  const runtimeSkeletonId = resolveRuntimeSkeletonId(runtime);
  const productDomainSkeletonId = resolveProductDomainSkeletonId(domain);
  const mutationId = normalizeString(intent.mutationId ?? outcome.mutationId, "");
  const resolvedOutcomeId = normalizeString(
    outcomeId,
    normalizeString(outcome.historyRecordId, mutationId ? `outcome:${mutationId}` : ""),
  );
  const stableParts = [
    projectId,
    eventType,
    runtimeSkeletonId,
    productDomainSkeletonId,
    mutationId,
    resolvedOutcomeId,
  ].filter(Boolean);

  return {
    eventId: `runtime-learning:${stableParts.join(":")}`,
    taskId: "LEARNING-RUNTIME-001",
    eventType,
    projectId,
    runtimeSkeletonId,
    artifactBuildId: normalizeString(runtime.artifactBuildId, ""),
    productDomainSkeletonId,
    mutationId,
    outcomeId: resolvedOutcomeId,
    source,
    learningSafe: true,
    privacyBoundary: {
      learningSafety: "learning-safe",
      consentGate: "project-local-runtime-learning",
      mayOverwriteProjectTruth: false,
    },
    truthBoundary: "learning-signal-only-does-not-overwrite-project-truth",
    signal: {
      productType: normalizeString(runtime.productType ?? domain.productType, ""),
      shellType: normalizeString(runtime.shellType ?? domain.domainKind, ""),
      productKind: normalizeString(runtime.productKind, ""),
      productPattern: normalizeString(runtime.productPattern, ""),
      productClass: normalizeString(runtime.productClass ?? domain.productClass, ""),
      skeletonFamily: normalizeString(runtime.shellFamily, ""),
      domainKind: normalizeString(domain.domainKind, ""),
      operationId: normalizeString(intent.operationId ?? outcome.operationId, ""),
      outcomeStatus: normalizeString(outcome.status ?? outcome.truthStatus ?? intent.status, ""),
    },
    createdAt: now,
  };
}

export function createRuntimeCreationLearningEvents({
  project = null,
  runtimeSkeletonTruth = null,
  productDomainSkeleton = null,
  source = "runtime-skeleton-truth",
  now = new Date().toISOString(),
} = {}) {
  const runtime = normalizeObject(runtimeSkeletonTruth);
  const domain = normalizeObject(productDomainSkeleton ?? runtime.productDomainSkeleton);
  const events = [];
  if (resolveRuntimeSkeletonId(runtime)) {
    events.push(createLearningEvent({
      eventType: "runtime_skeleton.created",
      project,
      runtimeSkeletonTruth: runtime,
      productDomainSkeleton: domain,
      source,
      now,
    }));
  }
  if (resolveProductDomainSkeletonId(domain)) {
    events.push(createLearningEvent({
      eventType: "product_domain_skeleton.created",
      project,
      runtimeSkeletonTruth: runtime,
      productDomainSkeleton: domain,
      source,
      now,
    }));
  }
  return events;
}

export function createBuildMutationLearningEvents({
  project = null,
  mutationResult = null,
  source = "build-mutation-truth",
  now = new Date().toISOString(),
} = {}) {
  const result = normalizeObject(mutationResult);
  const intent = normalizeObject(result.intent);
  const historyRecord = normalizeObject(result.historyRecord);
  const runtime = normalizeObject(result.runtimeSkeletonTruth);
  const domain = normalizeObject(result.productDomainSkeleton);
  if (!intent.mutationId) {
    return [];
  }

  return [
    createLearningEvent({
      eventType: "build_agent_request.received",
      project,
      runtimeSkeletonTruth: runtime,
      productDomainSkeleton: domain,
      mutationIntent: intent,
      source,
      now,
    }),
    createLearningEvent({
      eventType: "build_mutation_intent.created",
      project,
      runtimeSkeletonTruth: runtime,
      productDomainSkeleton: domain,
      mutationIntent: intent,
      source,
      now,
    }),
    createLearningEvent({
      eventType: result.ok ? "build_mutation_outcome.applied" : "build_mutation_outcome.failed",
      project,
      runtimeSkeletonTruth: runtime,
      productDomainSkeleton: domain,
      mutationIntent: intent,
      mutationOutcome: historyRecord,
      source,
      now,
    }),
    createLearningEvent({
      eventType: result.ok ? "product_domain_operation.outcome_applied" : "product_domain_operation.outcome_failed",
      project,
      runtimeSkeletonTruth: runtime,
      productDomainSkeleton: domain,
      mutationIntent: intent,
      mutationOutcome: historyRecord,
      source,
      now,
    }),
  ];
}

export function createSkeletonChoiceLearningEvents({
  project = null,
  skeletonChoiceTruth = null,
  selectionRecord = null,
  selectedCandidate = null,
  source = "skeleton-choice-truth",
  now = new Date().toISOString(),
} = {}) {
  const truth = normalizeObject(skeletonChoiceTruth);
  const candidate = normalizeObject(selectedCandidate);
  const record = normalizeObject(selectionRecord);
  if (!truth.selectedSkeletonCandidateId && !record.candidateId) {
    return [];
  }
  const runtime = normalizeObject(project?.runtimeSkeletonTruth ?? project?.context?.runtimeSkeletonTruth ?? {
    runtimeSkeletonId: truth.runtimeSkeletonId,
    artifactBuildId: truth.productTruthEnvelope?.artifactBuildId,
    productClass: truth.productTruthEnvelope?.productClass,
    productKind: truth.productTruthEnvelope?.productKind,
    productPattern: truth.productTruthEnvelope?.productPattern,
    shellFamily: truth.productTruthEnvelope?.shellFamily,
  });
  const domain = normalizeObject(project?.productDomainSkeleton ?? project?.context?.productDomainSkeleton ?? {
    productDomainSkeletonId: truth.productDomainSkeletonId,
    domainKind: truth.productTruthEnvelope?.domainKind,
  });
  return [
    {
      ...createLearningEvent({
        eventType: "skeleton_choice.selected",
        project,
        runtimeSkeletonTruth: runtime,
        productDomainSkeleton: domain,
        outcomeId: record.selectionId ?? `skeleton-choice:${truth.selectedSkeletonCandidateId}`,
        source,
        now,
      }),
      selectedSkeletonCandidateId: truth.selectedSkeletonCandidateId ?? record.candidateId,
      selectedCompositionStyle: truth.selectedCompositionStyle ?? candidate.compositionStyle ?? "",
      selectedProductDirection: truth.selectedProductDirection ?? candidate.productDirection ?? "",
      signal: {
        ...createLearningEvent({
          eventType: "skeleton_choice.selected",
          project,
          runtimeSkeletonTruth: runtime,
          productDomainSkeleton: domain,
          outcomeId: record.selectionId ?? `skeleton-choice:${truth.selectedSkeletonCandidateId}`,
          source,
          now,
        }).signal,
        selectedSkeletonCandidateId: truth.selectedSkeletonCandidateId ?? record.candidateId,
        selectedCompositionStyle: truth.selectedCompositionStyle ?? candidate.compositionStyle ?? "",
        selectedProductDirection: truth.selectedProductDirection ?? candidate.productDirection ?? "",
      },
    },
  ];
}

export function mergeRuntimeLearningEvents(existingEvents = [], nextEvents = []) {
  const merged = [];
  const seen = new Set();
  for (const event of [...normalizeArray(existingEvents), ...normalizeArray(nextEvents)]) {
    const safeEvent = normalizeObject(event);
    const eventId = normalizeString(safeEvent.eventId, "");
    if (!eventId || seen.has(eventId)) {
      continue;
    }
    seen.add(eventId);
    merged.push(safeEvent);
  }
  return merged;
}

export function buildRuntimeLearningDecisionHints(events = []) {
  const normalizedEvents = normalizeArray(events).map(normalizeObject);
  const eventTypes = [...new Set(normalizedEvents.map((event) => event.eventType).filter(Boolean))];
  const patternCounts = new Map();
  for (const event of normalizedEvents) {
    const signal = normalizeObject(event.signal);
    const patternId = normalizeString(signal.productPattern, "");
    if (!patternId) {
      continue;
    }
    const existing = patternCounts.get(patternId) ?? {
      patternId,
      productClass: normalizeString(signal.productClass, ""),
      skeletonFamily: normalizeString(signal.skeletonFamily, ""),
      domainKind: normalizeString(signal.domainKind, ""),
      count: 0,
      eventTypes: new Set(),
    };
    existing.count += 1;
    if (!existing.productClass) existing.productClass = normalizeString(signal.productClass, "");
    if (!existing.skeletonFamily) existing.skeletonFamily = normalizeString(signal.skeletonFamily, "");
    if (!existing.domainKind) existing.domainKind = normalizeString(signal.domainKind, "");
    existing.eventTypes.add(normalizeString(event.eventType, ""));
    patternCounts.set(patternId, existing);
  }
  const recommendedPatterns = [...patternCounts.values()]
    .sort((left, right) => right.count - left.count)
    .slice(0, 5)
    .map((pattern) => ({
      patternId: pattern.patternId,
      productClass: pattern.productClass,
      skeletonFamily: pattern.skeletonFamily,
      domainKind: pattern.domainKind,
      signalCount: pattern.count,
      confidence: pattern.count > 2 ? 0.82 : pattern.count > 1 ? 0.72 : 0.62,
      reason: "למידת ריצה קודמת מצביעה שזה דפוס מוצר שכדאי לשקול לפני בחירת שלד.",
      eventTypes: [...pattern.eventTypes].filter(Boolean),
    }));
  return {
    taskId: "LEARNING-RUNTIME-001",
    status: eventTypes.length > 0 ? "live" : "next",
    decisionUse: "future-build-generation-and-routing-hints-only",
    mayOverwriteProjectTruth: false,
    signalCount: normalizedEvents.length,
    eventTypes,
    recommendedPatterns,
    requiredBoundary: "learning may influence later decisions but must not mutate runtime, domain, or project truth silently",
  };
}
