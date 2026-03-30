function normalizeWorkspaceIsolationDecision(workspaceIsolationDecision) {
  return workspaceIsolationDecision && typeof workspaceIsolationDecision === "object"
    ? workspaceIsolationDecision
    : {};
}

function normalizeLearningEvent(learningEvent) {
  return learningEvent && typeof learningEvent === "object" ? learningEvent : {};
}

function collectLeakSignals(workspaceIsolationDecision, learningEvent) {
  const leakSignals = [];
  const triggeredLeakSignals = Array.isArray(workspaceIsolationDecision.triggeredLeakSignals)
    ? workspaceIsolationDecision.triggeredLeakSignals
    : [];

  triggeredLeakSignals.forEach((signal) => leakSignals.push(signal));

  if (learningEvent.crossTenantSource === true) {
    leakSignals.push("cross-tenant-learning-signal");
  }

  if (learningEvent.providerBoundaryBreach === true) {
    leakSignals.push("provider-session-boundary-breach");
  }

  if (learningEvent.sourceWorkspaceId && workspaceIsolationDecision.workspaceId
    && learningEvent.sourceWorkspaceId !== workspaceIsolationDecision.workspaceId) {
    leakSignals.push("learning-workspace-mismatch");
  }

  return Array.from(new Set(leakSignals));
}

function buildChecks(workspaceIsolationDecision, learningEvent, leakSignals) {
  const checks = [];

  if (workspaceIsolationDecision.decision) {
    checks.push(`workspace-isolation:${workspaceIsolationDecision.decision}`);
  }

  if (workspaceIsolationDecision.isBlocked === true) {
    checks.push("workspace-isolation-blocked");
  }

  if (learningEvent.crossTenantSource === true) {
    checks.push("learning-cross-tenant-source");
  }

  if (learningEvent.providerBoundaryBreach === true) {
    checks.push("provider-boundary-breach");
  }

  if (Array.isArray(learningEvent.mixedResources) && learningEvent.mixedResources.length > 0) {
    checks.push("mixed-resource-scope");
  }

  if (leakSignals.length === 0) {
    checks.push("no-cross-tenant-leak-detected");
  }

  return checks;
}

export function createCrossTenantLeakDetector({
  workspaceIsolationDecision = null,
  learningEvent = null,
} = {}) {
  const normalizedWorkspaceIsolationDecision = normalizeWorkspaceIsolationDecision(workspaceIsolationDecision);
  const normalizedLearningEvent = normalizeLearningEvent(learningEvent);
  const leakSignals = collectLeakSignals(
    normalizedWorkspaceIsolationDecision,
    normalizedLearningEvent,
  );
  const severity = normalizedWorkspaceIsolationDecision.isBlocked === true || leakSignals.includes("provider-session-boundary-breach")
    ? "critical"
    : leakSignals.length > 0
      ? "warning"
      : "clear";
  const checks = buildChecks(
    normalizedWorkspaceIsolationDecision,
    normalizedLearningEvent,
    leakSignals,
  );

  return {
    leakageAlert: {
      leakageAlertId: `tenant-leakage:${normalizedWorkspaceIsolationDecision.workspaceIsolationDecisionId ?? "workspace"}`,
      workspaceId: normalizedWorkspaceIsolationDecision.workspaceId ?? null,
      requestWorkspaceId: normalizedWorkspaceIsolationDecision.requestWorkspaceId ?? null,
      severity,
      status: severity === "clear" ? "clear" : "active",
      isActive: severity !== "clear",
      leakSignals,
      checks,
      affectedScopes: [
        normalizedWorkspaceIsolationDecision.resourceType ?? null,
        ...(Array.isArray(normalizedLearningEvent.mixedResources)
          ? normalizedLearningEvent.mixedResources
          : []),
      ].filter(Boolean),
      recommendedAction:
        severity === "critical"
          ? "Block the cross-tenant path and inspect provider and learning boundaries."
          : severity === "warning"
            ? "Review learning and provider inputs before allowing additional state sharing."
            : "No tenant leakage detected.",
      reason:
        severity === "critical"
          ? "Cross-tenant isolation guard or provider boundary reported a leakage risk."
          : severity === "warning"
            ? "Learning or resource signals suggest a possible tenant mixing scenario."
            : "Isolation checks and learning inputs remain inside the tenant boundary.",
    },
  };
}
