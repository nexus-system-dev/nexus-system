function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeFiniteNumber(value, fallback = null) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isUsableThresholdAmount(value) {
  return Number.isFinite(value) && value > 0;
}

function createCheck(type, status, reason) {
  return { type, status, reason };
}

function resolveEntitlementCheck(entitlementDecision) {
  const decision = normalizeString(normalizeObject(entitlementDecision).decision);

  if (decision === "allowed") {
    return createCheck("entitlement", "passed", "entitlement-allowed");
  }

  if (decision === "restricted") {
    return createCheck("entitlement", "failed", "entitlement-restricted");
  }

  if (decision === "blocked") {
    return createCheck("entitlement", "failed", "entitlement-blocked");
  }

  return createCheck("entitlement", "unknown", "entitlement-missing");
}

function resolveCostCheck(reasonableUsagePolicy, costSummary) {
  const normalizedPolicy = normalizeObject(reasonableUsagePolicy);
  const normalizedThreshold = normalizeObject(normalizedPolicy.threshold);
  const normalizedCostSummary = normalizeObject(costSummary);
  const totalEstimatedCost = normalizeFiniteNumber(normalizedCostSummary.totalEstimatedCost);
  const thresholdAmount = normalizeFiniteNumber(normalizedThreshold.amount);
  const currency = normalizeString(normalizedThreshold.currency);

  if (totalEstimatedCost === null) {
    return createCheck("cost", "unknown", "cost-summary-missing");
  }

  if (!isUsableThresholdAmount(thresholdAmount) || normalizeString(normalizedThreshold.type) === null) {
    return createCheck("cost", "unknown", "threshold-missing");
  }

  if (normalizedCostSummary.currencyMismatch === true) {
    return createCheck("cost", "unknown", "currency-mismatch");
  }

  if (!currency) {
    return createCheck("cost", "unknown", "missing-cost-currency");
  }

  if (totalEstimatedCost > thresholdAmount) {
    return createCheck("cost", "failed", "cost-threshold-exceeded");
  }

  return createCheck("cost", "passed", "cost-within-threshold");
}

function resolveBillingCheck(workspaceBillingState) {
  const normalizedState = normalizeObject(workspaceBillingState);
  const summaryStatus = normalizeString(normalizedState.summary?.summaryStatus);
  const lastBillingEventType = normalizeString(normalizedState.lastBillingEventType);
  const eventCount = normalizeFiniteNumber(normalizedState.source?.eventCount, 0);

  if (lastBillingEventType === "payment-failure") {
    return createCheck("billing", "failed", "payment-failure-detected");
  }

  if (lastBillingEventType === "cancel") {
    return createCheck("billing", "failed", "billing-cancel-detected");
  }

  if (lastBillingEventType === "retry") {
    return createCheck("billing", "unknown", "billing-retry-pending");
  }

  if (summaryStatus === "partial") {
    return createCheck("billing", "unknown", "billing-evidence-partial");
  }

  if (summaryStatus === "missing-inputs" || eventCount <= 0) {
    return createCheck("billing", "unknown", "billing-evidence-missing");
  }

  return createCheck("billing", "passed", "billing-evidence-clear");
}

function compareCheckPriority(left, right) {
  const priority = {
    billing: 3,
    cost: 2,
    entitlement: 1,
  };

  return (priority[left.type] ?? 0) - (priority[right.type] ?? 0);
}

function resolvePrimaryFailure(checks) {
  return checks
    .filter((check) => check.status === "failed")
    .sort((left, right) => compareCheckPriority(right, left))[0] ?? null;
}

function resolveDominantUnknown(checks) {
  return checks
    .filter((check) => check.status === "unknown")
    .sort((left, right) => compareCheckPriority(right, left))[0] ?? null;
}

function resolveSummaryStatus({ workspaceId, guardChecks }) {
  const hasUsableWorkspaceId = typeof workspaceId === "string" && workspaceId.length > 0;
  const unknownChecks = guardChecks.filter((check) => check.status === "unknown");

  if (!hasUsableWorkspaceId || unknownChecks.length === guardChecks.length) {
    return "missing-inputs";
  }

  if (unknownChecks.length > 0) {
    return "partial";
  }

  return "complete";
}

function buildSummaryExplanation({ decision, reason, summaryStatus }) {
  if (summaryStatus === "missing-inputs") {
    return "Billing enforcement could not evaluate required inputs safely.";
  }

  if (decision === "blocked") {
    return `Billing enforcement blocked usage due to ${reason}.`;
  }

  if (decision === "requires-escalation") {
    return `Billing enforcement requires escalation due to ${reason}.`;
  }

  return "Billing enforcement allows usage within entitlement, cost, and billing constraints.";
}

function buildRecommendedAction({ decision, primaryFailure, dominantUnknown }) {
  if (decision === "allowed") {
    return null;
  }

  if (decision === "requires-escalation") {
    return {
      type: "contact-support",
      reason: dominantUnknown.reason,
    };
  }

  if (!primaryFailure) {
    return null;
  }

  return {
    type: primaryFailure.type === "billing" ? "retry-payment" : "upgrade-plan",
    reason: primaryFailure.reason,
  };
}

export function createBillingEnforcementGuard({
  workspaceMode,
  entitlementDecision,
  billableUsage,
  reasonableUsagePolicy,
  costSummary,
  workspaceBillingState,
} = {}) {
  void workspaceMode;
  void billableUsage;

  const normalizedWorkspaceBillingState = normalizeObject(workspaceBillingState);
  const workspaceId = normalizeString(normalizedWorkspaceBillingState.workspaceId);
  const effectiveWorkspaceId = workspaceId ?? "unknown-workspace";
  const entitlementCheck = resolveEntitlementCheck(entitlementDecision);
  const costCheck = resolveCostCheck(reasonableUsagePolicy, costSummary);
  const billingCheck = resolveBillingCheck(workspaceBillingState);
  const guardChecks = [entitlementCheck, costCheck, billingCheck];
  const primaryFailure = resolvePrimaryFailure(guardChecks);
  const dominantUnknown = resolveDominantUnknown(guardChecks);

  let decision = "allowed";
  if (primaryFailure) {
    decision = "blocked";
  } else if (dominantUnknown) {
    decision = "requires-escalation";
  }

  const summaryStatus = resolveSummaryStatus({
    workspaceId,
    guardChecks,
  });
  const summaryReason = primaryFailure?.reason ?? dominantUnknown?.reason ?? "entitlement-allowed";
  const recommendedAction = buildRecommendedAction({
    decision,
    primaryFailure,
    dominantUnknown,
  });

  return {
    billingGuardDecision: {
      billingGuardDecisionId: `billing-guard-decision::${effectiveWorkspaceId}::${decision}`,
      decision,
      allowed: decision === "allowed",
      requiresEscalation: decision === "requires-escalation",
      guardChecks,
      primaryFailure: primaryFailure
        ? {
            type: primaryFailure.type,
            reason: primaryFailure.reason,
          }
        : null,
      recommendedAction,
      summary: {
        summaryStatus,
        explanation: buildSummaryExplanation({
          decision,
          reason: summaryReason,
          summaryStatus,
        }),
      },
      source: "billing-enforcement-guard",
    },
    approvalRequest: decision === "requires-escalation" && dominantUnknown
      ? {
          requestType: "billing-enforcement",
          reason: dominantUnknown.reason,
          relatedDecision: "billingGuardDecision",
          requiredAction: "contact-support",
        }
      : null,
  };
}
