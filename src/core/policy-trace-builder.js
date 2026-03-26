function normalizeDecision(decision) {
  return decision && typeof decision === "object" ? decision : {};
}

export function createPolicyTraceBuilder({
  policyDecision,
  enforcementResult,
} = {}) {
  const normalizedPolicyDecision = normalizeDecision(policyDecision);
  const normalizedEnforcementResult = normalizeDecision(enforcementResult);
  const traceSteps = [
    {
      step: "policy-decision",
      decision: normalizedPolicyDecision.decision ?? "unknown",
      reason: normalizedPolicyDecision.reason ?? "Policy decision reason is missing",
    },
    {
      step: "enforcement",
      decision: normalizedEnforcementResult.decision ?? "unknown",
      reason: normalizedEnforcementResult.reason ?? "Enforcement reason is missing",
    },
  ];

  return {
    policyTrace: {
      actionType: normalizedPolicyDecision.actionType ?? null,
      actorType: normalizedPolicyDecision.actorType ?? null,
      finalDecision: normalizedEnforcementResult.decision ?? normalizedPolicyDecision.decision ?? "unknown",
      reason:
        normalizedEnforcementResult.reason
        ?? normalizedPolicyDecision.reason
        ?? "Policy trace reason is unavailable",
      matchedPolicies: normalizedPolicyDecision.matchedPolicies ?? [],
      blockingSources: normalizedEnforcementResult.blockingSources ?? [],
      requiresApproval: Boolean(
        normalizedPolicyDecision.requiresApproval
        || normalizedEnforcementResult.requiresApproval,
      ),
      traceSteps,
    },
  };
}
