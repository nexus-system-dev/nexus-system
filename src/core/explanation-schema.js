function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function createExplanationType(explanationType, available, summary, dependsOn = []) {
  return {
    explanationType,
    available,
    summary,
    dependsOn,
  };
}

function hasApprovalExplanation(projectState, decisionContext) {
  return projectState.approvalStatus?.status === "missing"
    || projectState.approvalStatus?.status === "pending"
    || projectState.approvalRequest?.status === "pending"
    || decisionContext.activeBottleneck?.blockerType === "approval-blocker"
    || decisionContext.policyTrace?.requiresApproval === true
    || decisionContext.policyTrace?.finalDecision === "requires-approval";
}

export function defineExplanationSchema({
  projectState = null,
  decisionContext = null,
} = {}) {
  const normalizedProjectState = normalizeObject(projectState);
  const normalizedDecisionContext = normalizeObject(decisionContext);

  const whyThisTask = createExplanationType(
    "why-this-task",
    normalizedDecisionContext.activeBottleneck != null || normalizedDecisionContext.decisionIntelligence != null,
    normalizedDecisionContext.activeBottleneck?.reason
      ?? normalizedDecisionContext.decisionIntelligence?.summary
      ?? "No task selection explanation available yet",
    ["activeBottleneck", "decisionIntelligence"],
  );

  const whyBlocked = createExplanationType(
    "why-blocked",
    normalizedProjectState.bottleneckState?.summary?.isBlocked === true,
    normalizedProjectState.bottleneckState?.reason
      ?? normalizedProjectState.unblockPlan?.nextActions?.[0]?.label
      ?? "No active blocker explanation available",
    ["updatedBottleneckState", "unblockPlan"],
  );

  const whyApproval = createExplanationType(
    "why-approval",
    hasApprovalExplanation(normalizedProjectState, normalizedDecisionContext),
    normalizedDecisionContext.policyTrace?.summary
      ?? normalizedDecisionContext.activeBottleneck?.reason
      ?? normalizedDecisionContext.policyDecision?.reason
      ?? "No approval explanation required right now",
    ["approvalStatus", "approvalRequest", "policyTrace", "activeBottleneck"],
  );

  const whatChanged = createExplanationType(
    "what-changed",
    normalizedProjectState.diffPreview != null || normalizedProjectState.failureSummary != null,
    normalizedProjectState.diffPreview?.headline
      ?? normalizedProjectState.failureSummary?.headline
      ?? "No recent change explanation available yet",
    ["diffPreview", "failureSummary"],
  );

  const whatNext = createExplanationType(
    "what-next",
    Array.isArray(normalizedProjectState.unblockPlan?.nextActions)
      && normalizedProjectState.unblockPlan.nextActions.length > 0,
    normalizedProjectState.unblockPlan?.nextActions?.[0]?.label
      ?? "No next action is available yet",
    ["unblockPlan"],
  );

  const explanations = [whyThisTask, whyBlocked, whyApproval, whatChanged, whatNext];

  return {
    explanationSchema: {
      schemaId: `explanation-schema:${normalizedProjectState.projectId ?? "unknown"}`,
      projectId: normalizedProjectState.projectId ?? null,
      explanationTypes: explanations,
      summary: {
        totalTypes: explanations.length,
        availableTypes: explanations.filter((item) => item.available).length,
        hasBlockingExplanation: whyBlocked.available,
      },
    },
  };
}
