function normalizeProjectState(projectState = null) {
  return projectState && typeof projectState === "object" && !Array.isArray(projectState)
    ? projectState
    : {};
}

function normalizePolicyTrace(policyTrace = null) {
  return policyTrace && typeof policyTrace === "object" && !Array.isArray(policyTrace)
    ? policyTrace
    : {};
}

function normalizeLearningInsights(learningInsights = null) {
  return learningInsights && typeof learningInsights === "object" && !Array.isArray(learningInsights)
    ? learningInsights
    : {};
}

function buildBlockers(projectState, policyTrace) {
  const blockers = [];

  if (projectState.bottleneck?.title) {
    blockers.push({
      blockerId: "project-bottleneck",
      type: "bottleneck",
      title: projectState.bottleneck.title,
      reason: projectState.bottleneck.reason ?? null,
    });
  }

  if (Array.isArray(projectState.failureSummary?.categories)) {
    for (const category of projectState.failureSummary.categories) {
      blockers.push({
        blockerId: `failure-${category}`,
        type: "failure",
        title: category,
        reason: projectState.failureSummary.bottleneck ?? null,
      });
    }
  }

  if (Array.isArray(policyTrace.blockingSources)) {
    for (const source of policyTrace.blockingSources) {
      blockers.push({
        blockerId: `policy-${source}`,
        type: "policy",
        title: source,
        reason: policyTrace.reason ?? null,
      });
    }
  }

  return blockers;
}

export function createProjectBrainWorkspace({
  projectState = null,
  policyTrace = null,
  learningInsights = null,
} = {}) {
  const normalizedProjectState = normalizeProjectState(projectState);
  const normalizedPolicyTrace = normalizePolicyTrace(policyTrace);
  const normalizedLearningInsights = normalizeLearningInsights(learningInsights);
  const blockers = buildBlockers(normalizedProjectState, normalizedPolicyTrace);
  const nextAction = normalizedProjectState.recommendedActions?.[0] ?? null;

  return {
    projectBrainWorkspace: {
      workspaceId: `project-brain:${normalizedProjectState.projectId ?? "unknown-project"}`,
      overview: {
        projectId: normalizedProjectState.projectId ?? null,
        domain: normalizedProjectState.domain ?? null,
        currentPhase: normalizedProjectState.lifecycle?.phase ?? null,
        nextAction: nextAction?.title ?? nextAction?.text ?? null,
      },
      systemUnderstanding: {
        bottleneck: normalizedProjectState.bottleneck ?? null,
        businessBottleneck: normalizedProjectState.businessBottleneck ?? null,
        decisionIntelligence: normalizedProjectState.decisionIntelligence ?? null,
      },
      blockers,
      reasoning: {
        policyTrace: normalizedPolicyTrace,
        failureSummary: normalizedProjectState.failureSummary ?? null,
        recommendedActions: Array.isArray(normalizedProjectState.recommendedActions)
          ? normalizedProjectState.recommendedActions
          : [],
      },
      learningInsights: {
        summary: normalizedLearningInsights.summary ?? null,
        items: Array.isArray(normalizedLearningInsights.items) ? normalizedLearningInsights.items : [],
      },
      summary: {
        blockerCount: blockers.length,
        hasNextAction: Boolean(nextAction),
        requiresApproval: Boolean(normalizedPolicyTrace.requiresApproval),
      },
    },
  };
}
