function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function createMemoryLayer({
  layerId,
  title,
  status,
  scope,
  storedInputs = [],
  decisionImpact = [],
  continuityRule,
} = {}) {
  return {
    layerId,
    title,
    status: normalizeString(status, "next"),
    scope: normalizeString(scope, "learning scope is not yet defined"),
    storedInputs: normalizeArray(storedInputs).map((item) => normalizeString(item)).filter(Boolean),
    decisionImpact: normalizeArray(decisionImpact).map((item) => normalizeString(item)).filter(Boolean),
    continuityRule: normalizeString(
      continuityRule,
      "learning truth must survive restore and stay attached to the correct project or system scope",
    ),
  };
}

function createLearningInput({
  inputId,
  label,
  status,
  source,
  decisionUse,
} = {}) {
  return {
    inputId,
    label,
    status: normalizeString(status, "next"),
    source: normalizeString(source, "not-yet-connected"),
    decisionUse: normalizeString(decisionUse, "not yet connected back into a visible decision"),
  };
}

function createDecisionImpact({
  impactId,
  label,
  status,
  currentEffect,
  nextRequirement,
} = {}) {
  return {
    impactId,
    label,
    status: normalizeString(status, "next"),
    currentEffect: normalizeString(currentEffect, "not yet changing product behavior visibly"),
    nextRequirement: normalizeString(
      nextRequirement,
      "later implementation must turn this into visible product behavior",
    ),
  };
}

function summarizeInputs(learningInputs = []) {
  return normalizeArray(learningInputs).reduce((summary, item) => {
    if (item.status === "live") {
      summary.live += 1;
    } else if (item.status === "partial") {
      summary.partial += 1;
    } else {
      summary.next += 1;
    }
    return summary;
  }, { live: 0, partial: 0, next: 0 });
}

function summarizeImpacts(decisionImpacts = []) {
  return normalizeArray(decisionImpacts).reduce((summary, item) => {
    if (item.status === "live") {
      summary.live += 1;
    } else if (item.status === "partial") {
      summary.partial += 1;
    } else {
      summary.next += 1;
    }
    return summary;
  }, { live: 0, partial: 0, next: 0 });
}

export function createCanonicalLearningSystemContract({
  learningInsights = null,
  outcomeFeedbackState = null,
  userPreferenceSignals = null,
  crossProjectPatternPanel = null,
  approvalStatus = null,
  adaptiveExecutionDecision = null,
  canonicalBacklogRegeneration = null,
  classAwareGenerationContract = null,
  classAwareRuntimeResolver = null,
  classAwarePackagingPreviewContract = null,
  releaseEvidenceHandoffModel = null,
  deploymentStateFeedbackContract = null,
  postReleaseContinuationLoop = null,
} = {}) {
  const insights = normalizeObject(learningInsights);
  const feedbackState = normalizeObject(outcomeFeedbackState);
  const preferenceSignals = normalizeObject(userPreferenceSignals);
  const crossProjectPatterns = normalizeObject(crossProjectPatternPanel);
  const approval = normalizeObject(approvalStatus);
  const adaptiveDecision = normalizeObject(adaptiveExecutionDecision);
  const backlogRegeneration = normalizeObject(canonicalBacklogRegeneration);
  const generationContract = normalizeObject(classAwareGenerationContract);
  const runtimeResolver = normalizeObject(classAwareRuntimeResolver);
  const packagingContract = normalizeObject(classAwarePackagingPreviewContract);
  const releaseEvidence = normalizeObject(releaseEvidenceHandoffModel);
  const deploymentFeedback = normalizeObject(deploymentStateFeedbackContract);
  const continuationLoop = normalizeObject(postReleaseContinuationLoop);

  const insightCount = normalizeArray(insights.items).length;
  const preferenceSignalCount = normalizeArray(preferenceSignals.signals).length;
  const patternCount = normalizeArray(crossProjectPatterns.patterns).length;
  const recommendationHintCount = normalizeArray(crossProjectPatterns.recommendationHints).length;
  const feedbackItemsCount = normalizeArray(feedbackState.feedbackItems).length;

  const memoryLayers = [
    createMemoryLayer({
      layerId: "project-memory",
      title: "Project memory",
      status: insightCount > 0 || feedbackItemsCount > 0 ? "live" : "partial",
      scope: "Stores project-specific outcomes, approvals, continuity state, and product-loop feedback without pretending it is global learning.",
      storedInputs: [
        "execution history",
        "approval records",
        "release evidence",
        "deployment feedback",
        "continuation state",
      ],
      decisionImpact: [
        "next-task framing",
        "continuation quality",
        "project-specific context reuse",
      ],
      continuityRule: "Project memory must stay attached to the same project identity across restore, revisit, rerun, and route transitions.",
    }),
    createMemoryLayer({
      layerId: "user-preference-memory",
      title: "User preference memory",
      status: preferenceSignalCount > 0 || approval.status ? "live" : "partial",
      scope: "Separates stable user preference signals from project truth so approvals and repeated preferences do not get blurred into generic memory.",
      storedInputs: [
        "approval feedback memory",
        "notification and preference signals",
        "explicit user corrections",
      ],
      decisionImpact: [
        "approval-facing explanation style",
        "visible preference reuse",
      ],
      continuityRule: "User preference memory may influence later decisions, but it may not silently overwrite approved project truth.",
    }),
    createMemoryLayer({
      layerId: "system-learning",
      title: "System learning",
      status: patternCount > 0 || recommendationHintCount > 0 ? "partial" : "next",
      scope: "Holds cross-project patterns and safe-to-disclose hints, but stays bounded until those patterns change later Nexus decisions visibly and canonically.",
      storedInputs: [
        "cross-project patterns",
        "recommendation hints",
        "aggregated outcome signals",
      ],
      decisionImpact: [
        "future class-specific behavior",
        "future generation focus",
        "future runtime and release quality improvements",
      ],
      continuityRule: "System learning may not mutate active project truth without visible explanation and must stay distinct from per-project memory.",
    }),
  ];

  const learningInputs = [
    createLearningInput({
      inputId: "onboarding",
      label: "Onboarding",
      status: "partial",
      source: "project intake and onboarding state handoff",
      decisionUse: "Captured in project understanding, but not yet fed back as a stronger adaptive intake loop.",
    }),
    createLearningInput({
      inputId: "execution",
      label: "Execution",
      status: insightCount > 0 || feedbackItemsCount > 0 ? "live" : "partial",
      source: "canonical task results, throughput, and outcome feedback",
      decisionUse: "Feeds project memory and later next-task reasoning.",
    }),
    createLearningInput({
      inputId: "proof",
      label: "Proof",
      status: generationContract.generationIntent?.proofArtifactType ? "partial" : "next",
      source: "class-aware proof artifact expectations",
      decisionUse: "Defines artifact truth, but learning-driven proof improvement is not yet closed.",
    }),
    createLearningInput({
      inputId: "release",
      label: "Release",
      status: releaseEvidence.releaseTarget ? "partial" : "next",
      source: "release evidence and handoff model",
      decisionUse: "Available as release memory, but not yet reused as a learning-driven release policy loop.",
    }),
    createLearningInput({
      inputId: "deployment",
      label: "Deployment",
      status: deploymentFeedback.latestProviderStatus ? "partial" : "next",
      source: "deployment state feedback contract",
      decisionUse: "Provider feedback is stored visibly, but later deployment decisions are not yet learning-optimized.",
    }),
    createLearningInput({
      inputId: "continuation",
      label: "Continuation",
      status: continuationLoop.nextMoveTitle ? "live" : "partial",
      source: "post-release continuation loop",
      decisionUse: "Project continuation state stays connected to the same product truth.",
    }),
    createLearningInput({
      inputId: "reruns",
      label: "Reruns",
      status: adaptiveDecision.loopMode ? "partial" : "next",
      source: "adaptive execution loop and canonical backlog regeneration",
      decisionUse: "Reruns are classified, but visible learning-based improvement remains a later proof requirement.",
    }),
    createLearningInput({
      inputId: "approvals",
      label: "Approvals",
      status: approval.status ? "live" : "partial",
      source: "approval record store and approval status resolver",
      decisionUse: "Approval state already affects user-facing explanation and memory separation.",
    }),
    createLearningInput({
      inputId: "failures",
      label: "Failures",
      status: insightCount > 0 ? "live" : "partial",
      source: "baseline learning insights and outcome feedback",
      decisionUse: "Failure patterns already appear in project memory and recommendation framing.",
    }),
    createLearningInput({
      inputId: "user-edits",
      label: "User edits",
      status: "partial",
      source: "approval feedback memory and explicit user corrections",
      decisionUse: "Edits can be surfaced, but they are not yet closed as a durable learning-driven generation loop.",
    }),
    createLearningInput({
      inputId: "runtime-package-outcomes",
      label: "Runtime / package outcomes",
      status: runtimeResolver.runtimeFamily && packagingContract.packageMode ? "partial" : "next",
      source: "runtime resolver and packaging preview contract",
      decisionUse: "Runtime/package direction is explicit, but not yet improved by later outcome learning.",
    }),
    createLearningInput({
      inputId: "generation-outcomes",
      label: "Generation outcomes",
      status: generationContract.surfaceMutationModel ? "partial" : "next",
      source: "class-aware generation contract and proof artifact intent",
      decisionUse: "Generation outcomes are classified, but not yet upgraded by later learning loops.",
    }),
    createLearningInput({
      inputId: "cross-project-patterns",
      label: "Cross-project patterns",
      status: patternCount > 0 || recommendationHintCount > 0 ? "partial" : "next",
      source: "cross-project pattern disclosure panel",
      decisionUse: "Patterns are disclosed safely, but they do not yet drive broad visible behavior changes.",
    }),
  ];

  const decisionImpacts = [
    createDecisionImpact({
      impactId: "generation-quality",
      label: "generation quality",
      status: "next",
      currentEffect: "Generation remains class-aware, but later learning-driven quality improvement is not yet closed visibly.",
      nextRequirement: "Generation must consume learned failure signals, outcome patterns, and class-specific lessons visibly.",
    }),
    createDecisionImpact({
      impactId: "onboarding-refinement",
      label: "onboarding refinement",
      status: "next",
      currentEffect: "Current onboarding flow exists, but later adaptive intake must become learning-connected instead of fixed-path only.",
      nextRequirement: "Adaptive intake must reuse learned weak-answer patterns and class-specific sufficiency rules.",
    }),
    createDecisionImpact({
      impactId: "runtime-decisions",
      label: "runtime decisions",
      status: "next",
      currentEffect: "Runtime direction is explicit, but not yet improved by learned runtime/package outcomes.",
      nextRequirement: "Later runtime decisions must reuse class-specific outcome memory visibly.",
    }),
    createDecisionImpact({
      impactId: "bootstrap-quality",
      label: "bootstrap quality",
      status: "next",
      currentEffect: "Bootstrap is deterministic, but later bootstrap refinement is not yet learning-driven.",
      nextRequirement: "Later bootstrap choices must improve through stored onboarding, failure, and class outcome signals.",
    }),
    createDecisionImpact({
      impactId: "continuation-quality",
      label: "continuation quality",
      status: continuationLoop.nextMoveTitle ? "partial" : "next",
      currentEffect: "Continuation is bounded and product-connected, with project memory available for later reuse.",
      nextRequirement: "Later continuation moves must improve visibly through stored release, deployment, and rerun outcomes.",
    }),
    createDecisionImpact({
      impactId: "release-decisions",
      label: "release decisions",
      status: releaseEvidence.nextAction || deploymentFeedback.policyDecision ? "partial" : "next",
      currentEffect: "Release and deployment state are visible, but later release choices are not yet learning-optimized.",
      nextRequirement: "Release gating must eventually use stored release and deployment outcomes visibly.",
    }),
    createDecisionImpact({
      impactId: "next-task-selection",
      label: "next-task selection",
      status: backlogRegeneration.regenerationId || adaptiveDecision.decisionId ? "live" : "partial",
      currentEffect: "Adaptive execution and canonical backlog regeneration already use feedback to steer next work.",
      nextRequirement: "Later next-task selection must expose stronger class-specific and cross-project learning effects visibly.",
    }),
    createDecisionImpact({
      impactId: "class-specific-behavior",
      label: "class-specific behavior",
      status: "next",
      currentEffect: "Class-specific behavior exists through class contracts, but not yet through canonical learning loops.",
      nextRequirement: "Later class behavior must improve through stored class outcome patterns instead of static contracts alone.",
    }),
  ];

  const inputSummary = summarizeInputs(learningInputs);
  const impactSummary = summarizeImpacts(decisionImpacts);

  return {
    canonicalLearningSystemContract: {
      contractId: "canonical-learning-system-contract:v1",
      contractFamily: "canonical-learning-system",
      status: "defined",
      statusLabel: "מערכת הלמידה מוגדרת עכשיו כחוזה קנוני אחד",
      contractRule: "Nexus must separate project memory, user preference memory, and system learning, and only call it learning where stored signals change later decisions truthfully.",
      memoryLayers,
      learningInputs,
      decisionImpacts,
      continuityRules: [
        "learning state may not silently reset across restore, revisit, rerun, or route transitions",
        "project memory must stay attached to project identity",
        "system learning may not overwrite active project truth silently",
      ],
      generationIntegrationRules: [
        "generation must later consume learned class signals, failure signals, and outcome patterns from this contract",
        "runtime and release decisions may not claim learning-driven improvement until the visible product proves it",
      ],
      explicitProhibitions: [
        "no hidden AI intuition without canonical trace",
        "no feedback summary treated as proof of learning",
        "no cross-project pattern may silently mutate active project truth",
      ],
      visibleProductExpectations: [
        "smarter generation direction",
        "reduced drift",
        "better continuation decisions",
        "better runtime and release choices where canonically allowed",
      ],
      summary: {
        memoryLayers: memoryLayers.length,
        liveInputs: inputSummary.live,
        partialInputs: inputSummary.partial,
        nextInputs: inputSummary.next,
        liveImpacts: impactSummary.live,
        partialImpacts: impactSummary.partial,
        nextImpacts: impactSummary.next,
        crossProjectPatterns: patternCount,
      },
    },
  };
}
