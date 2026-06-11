function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function compactTextParts(parts = []) {
  return normalizeArray(parts).map((part) => normalizeString(part, "")).filter(Boolean);
}

function resolveProductTruthEnvelope({ project = {}, runtimeSkeletonTruth = {}, productDomainSkeleton = {} } = {}) {
  const runtime = normalizeObject(runtimeSkeletonTruth);
  const domain = normalizeObject(productDomainSkeleton ?? runtime.productDomainSkeleton);
  return {
    projectId: normalizeString(project.id ?? runtime.projectId, ""),
    runtimeSkeletonId: normalizeString(runtime.runtimeSkeletonId, ""),
    artifactBuildId: normalizeString(runtime.artifactBuildId, ""),
    productDomainSkeletonId: normalizeString(domain.productDomainSkeletonId, ""),
    productClass: normalizeString(runtime.productClass ?? domain.productClass, "generic"),
    productKind: normalizeString(runtime.productKind, ""),
    productPattern: normalizeString(runtime.productPattern, ""),
    shellFamily: normalizeString(runtime.shellFamily, ""),
    domainKind: normalizeString(domain.domainKind, ""),
    actionIds: normalizeArray(domain.operations).map((operation) => normalizeString(operation.id, "")).filter(Boolean),
    stateKeys: Object.keys(normalizeObject(domain.state)),
    boundaries: normalizeObject(runtime.boundaries),
  };
}

function createProviderAdapterMatrix(productClass = "") {
  const base = [
    {
      providerId: "nexus-operational-composition",
      providerKind: "internal-adapter",
      capabilityStatus: "available",
      label: "כיוון עבודה ממוקד",
      compositionStyle: "operational-clarity",
      productDirection: "מסך ראשון צפוף, ברור ומכוון פעולה.",
      fit: ["internal-tool", "saas", "commerce-ops", "generic"],
    },
    {
      providerId: "nexus-premium-composition",
      providerKind: "internal-adapter",
      capabilityStatus: "available",
      label: "כיוון פרימיום רגוע",
      compositionStyle: "premium-composed",
      productDirection: "שלד נקי עם היררכיה חזקה, מרווחים מדודים ותחושת מוצר רצינית.",
      fit: ["landing-page", "mobile-app", "saas", "generic"],
    },
    {
      providerId: "nexus-action-simulator-composition",
      providerKind: "internal-adapter",
      capabilityStatus: "available",
      label: "כיוון חי ומדיד",
      compositionStyle: "stateful-simulator",
      productDirection: "שלד שמדגיש פעולה, מצב משתנה והמשך בנייה בתוך אותה אמת.",
      fit: ["mobile-app", "game", "tool", "internal-tool", "generic"],
    },
    {
      providerId: "external-figma-design-provider",
      providerKind: "external-provider",
      capabilityStatus: "unavailable",
      label: "כיוון עיצוב חיצוני",
      compositionStyle: "external-provider",
      productDirection: "ספק עיצוב חיצוני לא מחובר בסביבה הזו.",
      fit: ["mobile-app", "landing-page", "internal-tool", "game", "generic"],
    },
  ];

  return base.filter((provider) => provider.capabilityStatus !== "available" || provider.fit.includes(productClass) || provider.fit.includes("generic"));
}

export function validateSkeletonChoiceCandidate(candidate = {}) {
  const safeCandidate = normalizeObject(candidate);
  const domainFit = normalizeObject(safeCandidate.productDomainFit);
  const actionsStateFit = normalizeObject(safeCandidate.actionsStateFit);
  const hasVisualDirection = Boolean(normalizeString(safeCandidate.visualDirection?.summary, ""));
  const hasDomain = Boolean(normalizeString(domainFit.productDomainSkeletonId, ""));
  const hasActions = normalizeArray(actionsStateFit.actionIds).length > 0;
  const hasState = normalizeArray(actionsStateFit.stateKeys).length > 0;
  return {
    ok: hasVisualDirection && hasDomain && hasActions && hasState,
    reasons: [
      hasVisualDirection ? "" : "missing-visual-direction",
      hasDomain ? "" : "missing-product-domain-fit",
      hasActions ? "" : "missing-action-fit",
      hasState ? "" : "missing-state-fit",
    ].filter(Boolean),
  };
}

function buildCandidate({ provider = {}, index = 0, project = {}, runtimeSkeletonTruth = {}, productDomainSkeleton = {}, truthEnvelope = {} } = {}) {
  const runtime = normalizeObject(runtimeSkeletonTruth);
  const domain = normalizeObject(productDomainSkeleton ?? runtime.productDomainSkeleton);
  const projectId = normalizeString(truthEnvelope.projectId, normalizeString(project.id, "project"));
  const productClass = normalizeString(truthEnvelope.productClass, "generic");
  const label = normalizeString(provider.label, `כיוון ${index + 1}`);
  const actionIds = compactTextParts(truthEnvelope.actionIds);
  const stateKeys = compactTextParts(truthEnvelope.stateKeys);
  const candidate = {
    taskId: "SKELETON-CHOICE-001",
    candidateId: `skeleton-candidate:${projectId}:${index + 1}`,
    projectId,
    runtimeSkeletonId: truthEnvelope.runtimeSkeletonId,
    productDomainSkeletonId: truthEnvelope.productDomainSkeletonId,
    label,
    userFacingLabel: label,
    providerId: normalizeString(provider.providerId, ""),
    providerKind: normalizeString(provider.providerKind, "internal-adapter"),
    providerCapabilityStatus: normalizeString(provider.capabilityStatus, "available"),
    providerMetadataHiddenFromUser: true,
    compositionStyle: normalizeString(provider.compositionStyle, ""),
    productDirection: normalizeString(provider.productDirection, ""),
    isRecommended: index === 0,
    productKindFit: {
      productClass,
      productKind: normalizeString(truthEnvelope.productKind, ""),
      productPattern: normalizeString(truthEnvelope.productPattern, ""),
      shellFamily: normalizeString(truthEnvelope.shellFamily, ""),
      reason: `הכיוון מתאים לדפוס ${normalizeString(truthEnvelope.productPattern, productClass)} בלי להחליף את אמת המוצר.`,
    },
    productDomainFit: {
      productDomainSkeletonId: normalizeString(domain.productDomainSkeletonId, ""),
      domainKind: normalizeString(domain.domainKind, ""),
      modelNames: normalizeArray(domain.models).map((model) => normalizeString(model.name, "")).filter(Boolean),
      operationCount: normalizeArray(domain.operations).length,
    },
    actionsStateFit: {
      actionIds,
      stateKeys,
      canContinueBuild: actionIds.length > 0 && stateKeys.length > 0,
    },
    visualDirection: {
      summary: `${label}: ${normalizeString(provider.productDirection, "כיוון שלד מחובר לאמת המוצר.")}`,
      frameFamily: normalizeString(runtime.previewFrameFamily, ""),
      runtimeFamily: normalizeString(runtime.runtimeFamily, ""),
      firstScreenTitle: normalizeString(runtime.title, normalizeString(project.name, "המוצר")),
    },
    boundaries: {
      simulatedRuntime: true,
      productionImplementation: false,
      externalProviderConnection: provider.providerKind === "external-provider" && provider.capabilityStatus === "available",
      providerIsTruthOwner: false,
      userVisibleProviderName: false,
      boundaryText: "הכיוון משפיע על אופי השלד בתוך Nexus, לא על פרסום, תשלום או חיבור ספק חיצוני.",
    },
  };
  const validation = validateSkeletonChoiceCandidate(candidate);
  return {
    ...candidate,
    validationStatus: validation.ok ? "valid" : "invalid",
    validationReasons: validation.reasons,
  };
}

export function buildSkeletonChoiceTruthEnvelope({
  project = {},
  runtimeSkeletonTruth = {},
  productDomainSkeleton = {},
  previousSkeletonChoiceTruth = null,
  now = new Date().toISOString(),
} = {}) {
  const safeProject = normalizeObject(project);
  const runtime = normalizeObject(runtimeSkeletonTruth);
  const domain = normalizeObject(productDomainSkeleton ?? runtime.productDomainSkeleton);
  const previous = normalizeObject(previousSkeletonChoiceTruth);
  const truthEnvelope = resolveProductTruthEnvelope({ project: safeProject, runtimeSkeletonTruth: runtime, productDomainSkeleton: domain });
  const providerAdapters = createProviderAdapterMatrix(truthEnvelope.productClass);
  const providerFailures = providerAdapters
    .filter((provider) => provider.capabilityStatus !== "available")
    .map((provider) => ({
      providerId: provider.providerId,
      providerKind: provider.providerKind,
      status: "unavailable",
      boundedFailure: true,
      reason: "הספק אינו מחובר בסביבת הריצה הנוכחית, ולכן Nexus לא מציג הצלחת ספק מזויפת.",
    }));
  const candidates = providerAdapters
    .filter((provider) => provider.capabilityStatus === "available")
    .map((provider, index) => buildCandidate({
      provider,
      index,
      project: safeProject,
      runtimeSkeletonTruth: runtime,
      productDomainSkeleton: domain,
      truthEnvelope,
    }))
    .filter((candidate) => candidate.validationStatus === "valid");
  const previousSelectedId = normalizeString(previous.selectedSkeletonCandidateId, "");
  const selectedCandidate = candidates.find((candidate) => candidate.candidateId === previousSelectedId) ?? null;
  const recommendedCandidateId = normalizeString(previous.recommendedCandidateId, candidates[0]?.candidateId ?? "");
  return {
    taskId: "SKELETON-CHOICE-001",
    status: selectedCandidate ? "selected" : "selection-required",
    projectId: truthEnvelope.projectId,
    runtimeSkeletonId: truthEnvelope.runtimeSkeletonId,
    productDomainSkeletonId: truthEnvelope.productDomainSkeletonId,
    productTruthEnvelope: truthEnvelope,
    providerContract: {
      truthOwner: "nexus",
      providersMayCreateDirectionsOnly: true,
      providerNamesHiddenFromUser: true,
      unavailableProvidersFailBoundedly: true,
    },
    candidates,
    providerFailures,
    recommendedCandidateId,
    selectedSkeletonCandidateId: selectedCandidate?.candidateId ?? "",
    selectedDesignProvider: selectedCandidate?.providerId ?? "",
    selectedCompositionStyle: selectedCandidate?.compositionStyle ?? "",
    selectedProductDirection: selectedCandidate?.productDirection ?? "",
    selectionStatus: selectedCandidate ? "locked" : "awaiting-user-choice-or-recommended-approval",
    downstreamHandoff: selectedCandidate
      ? {
          selectedSkeletonCandidateId: selectedCandidate.candidateId,
          selectedDesignProvider: selectedCandidate.providerId,
          selectedCompositionStyle: selectedCandidate.compositionStyle,
          selectedProductDirection: selectedCandidate.productDirection,
          build: true,
          visualBuild: true,
          mutation: true,
          learning: true,
          restore: true,
          history: true,
          release: true,
          verification: true,
        }
      : null,
    selectionHistory: normalizeArray(previous.selectionHistory),
    pendingDirectionSwitch: normalizeObject(previous.pendingDirectionSwitch),
    createdAt: normalizeString(previous.createdAt, now),
    updatedAt: now,
    truthBoundary: "providers-create-directions-nexus-keeps-product-truth",
  };
}

export function selectSkeletonChoiceCandidate({
  skeletonChoiceTruth = {},
  candidateId = "",
  selectedBy = "user",
  approveDirectionSwitch = false,
  now = new Date().toISOString(),
} = {}) {
  const truth = normalizeObject(skeletonChoiceTruth);
  const normalizedCandidateId = normalizeString(candidateId, "");
  const candidate = normalizeArray(truth.candidates).find((item) => normalizeObject(item).candidateId === normalizedCandidateId);
  if (!candidate) {
    return {
      ok: false,
      status: "failed-safely",
      error: "candidate-not-found",
      skeletonChoiceTruth: truth,
    };
  }
  const currentSelectedId = normalizeString(truth.selectedSkeletonCandidateId, "");
  if (currentSelectedId && currentSelectedId !== normalizedCandidateId && approveDirectionSwitch !== true) {
    return {
      ok: false,
      status: "approval-required",
      error: "direction-switch-requires-approval",
      skeletonChoiceTruth: {
        ...truth,
        pendingDirectionSwitch: {
          requestedCandidateId: normalizedCandidateId,
          currentCandidateId: currentSelectedId,
          requestedBy: selectedBy,
          status: "approval-required",
          requestedAt: now,
        },
        updatedAt: now,
      },
    };
  }
  const selectionRecord = {
    selectionId: `skeleton-choice-selection:${truth.projectId}:${Date.parse(now) || Date.now()}`,
    taskId: "SKELETON-CHOICE-001",
    projectId: truth.projectId,
    candidateId: normalizedCandidateId,
    selectedBy,
    status: "selected",
    selectedAt: now,
  };
  return {
    ok: true,
    status: "selected",
    selectedCandidate: candidate,
    selectionRecord,
    skeletonChoiceTruth: {
      ...truth,
      status: "selected",
      selectedSkeletonCandidateId: candidate.candidateId,
      selectedDesignProvider: candidate.providerId,
      selectedCompositionStyle: candidate.compositionStyle,
      selectedProductDirection: candidate.productDirection,
      selectionStatus: "locked",
      downstreamHandoff: {
        selectedSkeletonCandidateId: candidate.candidateId,
        selectedDesignProvider: candidate.providerId,
        selectedCompositionStyle: candidate.compositionStyle,
        selectedProductDirection: candidate.productDirection,
        build: true,
        visualBuild: true,
        mutation: true,
        learning: true,
        restore: true,
        history: true,
        release: true,
        verification: true,
      },
      pendingDirectionSwitch: {},
      selectionHistory: [...normalizeArray(truth.selectionHistory), selectionRecord],
      updatedAt: now,
    },
  };
}
