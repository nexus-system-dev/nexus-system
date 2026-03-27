function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildImpactSignals(impactSummary) {
  const normalizedImpactSummary = normalizeObject(impactSummary);
  const signals = [];

  if (normalizedImpactSummary.codeImpact === "present") {
    signals.push("code-impact");
  }
  if (normalizedImpactSummary.migrationImpact === "present") {
    signals.push("migration-impact");
  }
  if (normalizedImpactSummary.infraImpact === "present") {
    signals.push("infra-impact");
  }
  if (normalizedImpactSummary.requiresApproval === true) {
    signals.push("approval-required");
  }
  if (normalizedImpactSummary.hasUncertainty === true) {
    signals.push("uncertain-impact");
  }

  return signals;
}

function buildLearningReasons(learningTrace) {
  const normalizedLearningTrace = normalizeObject(learningTrace);
  const traceSteps = normalizeArray(normalizedLearningTrace.traceSteps);

  return traceSteps.map((step, index) => {
    const normalizedStep = normalizeObject(step);
    return {
      reasonId: normalizedStep.stepId ?? `learning-reason-${index + 1}`,
      label: normalizedStep.title ?? normalizedStep.pattern ?? `Learning trace ${index + 1}`,
      explanation: normalizedStep.reasoning ?? normalizedStep.summary ?? null,
      source: normalizedStep.source ?? normalizedStep.kind ?? "learning-trace",
    };
  });
}

function buildPolicyReasons(policyTrace) {
  const normalizedPolicyTrace = normalizeObject(policyTrace);
  const traceSteps = normalizeArray(normalizedPolicyTrace.traceSteps);

  return traceSteps.map((step, index) => {
    const normalizedStep = normalizeObject(step);
    return {
      reasonId: `policy-reason-${index + 1}`,
      label: normalizedStep.step ?? `Policy step ${index + 1}`,
      explanation: normalizedStep.reason ?? normalizedPolicyTrace.reason ?? null,
      decision: normalizedStep.decision ?? normalizedPolicyTrace.finalDecision ?? "unknown",
    };
  });
}

function buildHeadline(impactSummary, policyTrace, learningTrace) {
  const normalizedImpactSummary = normalizeObject(impactSummary);
  const normalizedPolicyTrace = normalizeObject(policyTrace);
  const normalizedLearningTrace = normalizeObject(learningTrace);

  if (normalizedPolicyTrace.requiresApproval === true) {
    return "This recommendation needs approval before it can move forward.";
  }

  if (normalizedImpactSummary.totalChanges > 0) {
    return "This recommendation was selected because it has clear impact on the current project state.";
  }

  if (normalizedLearningTrace.recommendationReasoning) {
    return "This recommendation follows a learning pattern the system trusts right now.";
  }

  return "No recommendation reasoning is available yet.";
}

export function createRecommendationReasoningPanelContract({
  impactSummary = null,
  learningTrace = null,
  policyTrace = null,
} = {}) {
  const normalizedImpactSummary = normalizeObject(impactSummary);
  const normalizedLearningTrace = normalizeObject(learningTrace);
  const normalizedPolicyTrace = normalizeObject(policyTrace);
  const learningReasons = buildLearningReasons(normalizedLearningTrace);
  const policyReasons = buildPolicyReasons(normalizedPolicyTrace);

  return {
    reasoningPanel: {
      panelId: `reasoning-panel:${normalizedPolicyTrace.actionType ?? "project"}`,
      headline: buildHeadline(normalizedImpactSummary, normalizedPolicyTrace, normalizedLearningTrace),
      impact: {
        totalChanges: normalizedImpactSummary.totalChanges ?? 0,
        signals: buildImpactSignals(normalizedImpactSummary),
        affectedAreas: [
          ...normalizeArray(normalizedImpactSummary.affectedCodePaths),
          ...normalizeArray(normalizedImpactSummary.affectedMigrationPaths),
          ...normalizeArray(normalizedImpactSummary.affectedInfraAreas),
        ],
      },
      learning: {
        recommendationReasoning: normalizedLearningTrace.recommendationReasoning ?? null,
        reasons: learningReasons,
      },
      policy: {
        finalDecision: normalizedPolicyTrace.finalDecision ?? "unknown",
        requiresApproval: normalizedPolicyTrace.requiresApproval === true,
        blockingSources: normalizeArray(normalizedPolicyTrace.blockingSources),
        reasons: policyReasons,
      },
      summary: {
        hasImpactSignals: buildImpactSignals(normalizedImpactSummary).length > 0,
        hasLearningReasons: learningReasons.length > 0,
        hasPolicyReasons: policyReasons.length > 0,
      },
    },
  };
}
