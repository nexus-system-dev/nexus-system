function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function toFiniteNumber(value, fallback = null) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function normalizeAgentBudgetDecision({
  budgetDecision = null,
  agentGovernancePolicy = null,
  taskContext = null,
} = {}) {
  const normalizedBudgetDecision = normalizeObject(budgetDecision);
  const normalizedAgentGovernancePolicy = normalizeObject(agentGovernancePolicy);
  const normalizedTaskContext = normalizeObject(taskContext);
  const spendThresholds = normalizeObject(normalizedAgentGovernancePolicy.spendThresholds);

  if (typeof normalizedBudgetDecision.decision === "string") {
    return {
      decision: normalizedBudgetDecision.decision,
      allowed: normalizedBudgetDecision.allowed !== false,
      perActionLimit: toFiniteNumber(normalizedBudgetDecision.perActionLimit, toFiniteNumber(spendThresholds.perAction, null)),
      perSessionLimit: toFiniteNumber(normalizedBudgetDecision.perSessionLimit, toFiniteNumber(spendThresholds.perSession, null)),
      perDayLimit: toFiniteNumber(normalizedBudgetDecision.perDayLimit, toFiniteNumber(spendThresholds.perDay, null)),
      remainingBudget: toFiniteNumber(normalizedBudgetDecision.remainingBudget, null),
      currency: normalizedBudgetDecision.currency ?? spendThresholds.currency ?? "usd",
      source: "provided",
    };
  }

  const estimatedCost = toFiniteNumber(normalizedTaskContext.estimatedCost, null);
  const perActionLimit = toFiniteNumber(spendThresholds.perAction, null);
  const perSessionLimit = toFiniteNumber(spendThresholds.perSession, null);
  const perDayLimit = toFiniteNumber(spendThresholds.perDay, null);
  const remainingBudget = perSessionLimit;
  const exceedsPerAction = estimatedCost !== null && perActionLimit !== null && estimatedCost > perActionLimit;
  const exceedsSession = estimatedCost !== null && remainingBudget !== null && estimatedCost > remainingBudget;

  return {
    decision: exceedsPerAction || exceedsSession ? "requires-escalation" : "allowed",
    allowed: !(exceedsPerAction || exceedsSession),
    perActionLimit,
    perSessionLimit,
    perDayLimit,
    remainingBudget,
    currency: spendThresholds.currency ?? "usd",
    source: "policy-fallback",
  };
}
