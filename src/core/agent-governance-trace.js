function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeTraceCheck(check = null, source) {
  const normalizedCheck = normalizeObject(check);

  return {
    checkId: normalizedCheck.checkId ?? `${source}:unknown-check`,
    status: normalizedCheck.status ?? "pass",
    reason: normalizedCheck.reason ?? null,
    source,
    observedValue: Object.hasOwn(normalizedCheck, "observedValue") ? normalizedCheck.observedValue : null,
    limitValue: Object.hasOwn(normalizedCheck, "limitValue") ? normalizedCheck.limitValue : null,
    checkType: normalizedCheck.checkType ?? null,
    operationType: normalizedCheck.operationType ?? null,
    requiredAction: normalizedCheck.requiredAction ?? null,
    action: normalizedCheck.action ?? null,
  };
}

function countChecks(checks, status) {
  return checks.filter((check) => check.status === status).length;
}

export function createAgentGovernanceTrace({
  agentGovernancePolicy = null,
  sandboxDecision = null,
  agentLimitDecision = null,
} = {}) {
  const normalizedPolicy = normalizeObject(agentGovernancePolicy);
  const normalizedSandboxDecision = normalizeObject(sandboxDecision);
  const normalizedLimitDecision = normalizeObject(agentLimitDecision);

  const limitChecks = normalizeArray(normalizedLimitDecision.limitChecks).map((check) => normalizeTraceCheck(check, "limit"));
  const costChecks = normalizeArray(normalizedLimitDecision.costChecks).map((check) => normalizeTraceCheck(check, "cost"));
  const providerSideEffectChecks = normalizeArray(normalizedLimitDecision.providerSideEffectChecks)
    .map((check) => normalizeTraceCheck(check, "provider"));
  const hardBlockChecks = normalizeArray(normalizedLimitDecision.hardBlockChecks).map((check) => normalizeTraceCheck(check, "hard-block"));
  const allChecks = [...hardBlockChecks, ...providerSideEffectChecks, ...costChecks, ...limitChecks];
  const finalDecision = normalizedLimitDecision.decision ?? "allowed";
  const escalationHint = normalizedLimitDecision.escalationHint ?? null;

  return {
    agentGovernanceTrace: {
      agentGovernanceTraceId: `agent-governance-trace:${normalizedPolicy.agentType ?? "unknown-agent"}:${normalizedLimitDecision.taskType ?? normalizedSandboxDecision.taskType ?? "generic"}:${normalizedLimitDecision.scopeId ?? "unknown-scope"}`,
      agentType: normalizedPolicy.agentType ?? "unknown-agent",
      taskType: normalizedLimitDecision.taskType ?? normalizedSandboxDecision.taskType ?? "generic",
      scopeType: normalizedLimitDecision.scopeType ?? null,
      scopeId: normalizedLimitDecision.scopeId ?? null,
      sandboxLevel: normalizedPolicy.sandboxLevel ?? "read-only",
      finalDecision,
      limitChecks,
      costChecks,
      providerSideEffectChecks,
      hardBlockChecks,
      allChecks,
      escalationHint,
      summary: {
        totalChecks: allChecks.length,
        blockedCount: countChecks(allChecks, "blocked"),
        escalatedCount: countChecks(allChecks, "requires-escalation"),
        passedCount: countChecks(allChecks, "pass"),
        isBlocked: finalDecision === "blocked",
        requiresEscalation: finalDecision === "requires-escalation",
        hasEscalationHint: escalationHint !== null,
      },
    },
  };
}
