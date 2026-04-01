import { createBudgetConstraintEngine } from "./budget-constraint-engine.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeFiniteNumber(value, fallback = null) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function buildBudgetCheck({
  checkId,
  checkType,
  status,
  value = null,
  limit = null,
  reason = null,
}) {
  return {
    checkId,
    checkType,
    status,
    value,
    limit,
    reason,
  };
}

function resolveSummaryStatus(costSummary = null) {
  const normalized = normalizeObject(costSummary);
  return normalizeString(normalized.summary?.summaryStatus ?? normalized.summaryStatus, "missing-inputs");
}

function resolveCurrency(costSummary = null, spendThresholds = null) {
  const normalizedCostSummary = normalizeObject(costSummary);
  const normalizedThresholds = normalizeObject(spendThresholds);
  const currencyMismatch = normalizedCostSummary.currencyMismatch === true;

  if (currencyMismatch) {
    return {
      currency: null,
      currencyMismatch: true,
    };
  }

  return {
    currency:
      normalizeString(normalizedCostSummary.currency)?.toLowerCase()
      ?? normalizeString(normalizedThresholds.currency)?.toLowerCase()
      ?? "usd",
    currencyMismatch: false,
  };
}

function resolveTotalCost(costSummary = null) {
  const normalized = normalizeObject(costSummary);
  return normalizeFiniteNumber(normalized.totalEstimatedCost ?? normalized.summary?.totalCost, null);
}

function statusFromPolicy(rule = "require-approval") {
  return rule === "block" ? "blocked" : "requires-escalation";
}

function buildApprovalRequest(reason) {
  return {
    requestType: "budget-exceeded",
    reason,
    relatedDecision: "budgetDecision",
    requiredAction: "approve-budget",
  };
}

export function createUsageBudgetGuard({
  costSummary = null,
  agentGovernancePolicy = null,
  workspaceModel = null,
  pricingMetadata = null,
} = {}) {
  const normalizedCostSummary = normalizeObject(costSummary);
  const normalizedPolicy = normalizeObject(agentGovernancePolicy);
  const spendThresholds = normalizeObject(normalizedPolicy.spendThresholds);
  const escalationRules = normalizeObject(normalizedPolicy.escalationRules);
  const summaryStatus = resolveSummaryStatus(normalizedCostSummary);
  const totalCost = resolveTotalCost(normalizedCostSummary);
  const { currency, currencyMismatch } = resolveCurrency(normalizedCostSummary, spendThresholds);
  const perActionLimit = normalizeFiniteNumber(spendThresholds.perAction, null);
  const perSessionLimit = normalizeFiniteNumber(spendThresholds.perSession, null);
  const perDayLimit = normalizeFiniteNumber(spendThresholds.perDay, null);
  const overrunStatus = statusFromPolicy(escalationRules.onSpendThresholdExceeded);
  const constraintEngine = createBudgetConstraintEngine({
    workspaceModel,
    pricingMetadata,
    overrunStatus,
  });
  const budgetChecks = [];

  budgetChecks.push(buildBudgetCheck({
    checkId: "budget:currency",
    checkType: "currency",
    status: currencyMismatch ? "requires-escalation" : "pass",
    reason: currencyMismatch
      ? "Cost summary contains multiple currencies and cannot be aggregated safely."
      : `Budget evaluation uses ${currency ?? "usd"} as the canonical currency.`,
  }));

  let decision = "allowed";
  let source = "policy-thresholds";
  let primaryReason = null;
  let hardLimitTriggered = false;
  let softLimitTriggered = false;

  if (normalizedCostSummary === null || Object.keys(normalizedCostSummary).length === 0 || summaryStatus === "missing-inputs") {
    decision = "requires-escalation";
    source = "missing-inputs";
    primaryReason = "Cost summary is missing, so budget enforcement cannot evaluate spend safely.";
  } else if (summaryStatus === "partial") {
    decision = "requires-escalation";
    primaryReason = "Cost summary is partial, so budget enforcement requires approval before continuing.";
    softLimitTriggered = true;
  }

  if (perSessionLimit !== null) {
    let status = "pass";
    let reason = "Total cost stays within the per-session limit.";

    if (totalCost === null) {
      status = "requires-escalation";
      reason = "Per-session budget could not be evaluated because total cost is missing.";
    } else if (totalCost > perSessionLimit) {
      status = overrunStatus;
      reason = "Total cost exceeds the per-session limit.";
    }

    budgetChecks.push(buildBudgetCheck({
      checkId: "budget:per-session",
      checkType: "per-session",
      status,
      value: totalCost,
      limit: perSessionLimit,
      reason,
    }));

    if (status !== "pass" && decision !== "blocked") {
      const thresholdClassification = constraintEngine.classifyThreshold(status);
      decision = status === "blocked" ? "blocked" : "requires-escalation";
      hardLimitTriggered ||= thresholdClassification.hardLimitTriggered;
      softLimitTriggered ||= thresholdClassification.softLimitTriggered;
      primaryReason ??= reason;
    }
  } else if (perActionLimit !== null) {
    let status = "pass";
    let reason = "Total cost stays within the per-action fallback limit.";

    if (totalCost === null) {
      status = "requires-escalation";
      reason = "Per-action budget fallback could not be evaluated because total cost is missing.";
    } else if (totalCost > perActionLimit) {
      status = overrunStatus;
      reason = "Total cost exceeds the per-action fallback limit.";
    }

    budgetChecks.push(buildBudgetCheck({
      checkId: "budget:per-action",
      checkType: "per-action",
      status,
      value: totalCost,
      limit: perActionLimit,
      reason,
    }));

    if (status !== "pass" && decision !== "blocked") {
      const thresholdClassification = constraintEngine.classifyThreshold(status);
      decision = status === "blocked" ? "blocked" : "requires-escalation";
      hardLimitTriggered ||= thresholdClassification.hardLimitTriggered;
      softLimitTriggered ||= thresholdClassification.softLimitTriggered;
      primaryReason ??= reason;
    }
  }

  if (currencyMismatch && decision !== "blocked") {
    decision = "requires-escalation";
    softLimitTriggered = true;
    primaryReason ??= "Currency mismatch prevents safe budget enforcement.";
  }

  if (decision === "blocked") {
    hardLimitTriggered = true;
    softLimitTriggered = false;
  } else if (decision === "requires-escalation") {
    softLimitTriggered = true;
  }

  if (source !== "missing-inputs") {
    source = constraintEngine.fallbackApplied ? "policy-thresholds" : "pricing+policy";
  }

  const remainingBudget =
    perSessionLimit !== null && totalCost !== null
      ? perSessionLimit - totalCost
      : null;

  const requiresEscalation = decision === "requires-escalation";
  const approvalRequest = requiresEscalation ? buildApprovalRequest(primaryReason) : null;

  return {
    budgetDecision: {
      decision,
      allowed: decision === "allowed",
      requiresEscalation,
      currency,
      currencyMismatch,
      perActionLimit,
      perSessionLimit,
      perDayLimit,
      totalCost,
      remainingBudget,
      constraintSource: constraintEngine.constraintSource,
      hardLimitTriggered,
      softLimitTriggered,
      budgetChecks,
      escalationHint: requiresEscalation
        ? {
            reason: primaryReason,
            requiredAction: "request-approval",
          }
        : null,
      summary:
        decision === "blocked"
          ? `Budget decision blocked execution because ${primaryReason ?? "a spend threshold was exceeded"}. Constraint mode: ${constraintEngine.constraintSource}.`
          : decision === "requires-escalation"
            ? `Budget decision requires escalation because ${primaryReason ?? "cost data is incomplete or over threshold"}. Constraint mode: ${constraintEngine.constraintSource}.`
            : `Budget decision allows execution within the configured spend thresholds. Constraint mode: ${constraintEngine.constraintSource}.`,
      source,
    },
    approvalRequest,
  };
}
