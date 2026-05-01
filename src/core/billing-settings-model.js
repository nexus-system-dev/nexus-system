import { WORKSPACE_BILLING_ACTIONS } from "./workspace-billing-action-service.js";

const SUPPORTED_SUBSCRIPTION_STATUSES = new Set([
  "trial",
  "active",
  "past_due",
  "canceled",
]);

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeSubscriptionStatus(value) {
  const normalizedValue = normalizeString(value);
  return normalizedValue && SUPPORTED_SUBSCRIPTION_STATUSES.has(normalizedValue)
    ? normalizedValue
    : null;
}

function resolveWorkspaceId(workspaceBillingState, subscriptionState) {
  return normalizeString(workspaceBillingState?.workspaceId)
    ?? normalizeString(subscriptionState?.workspaceId)
    ?? null;
}

function resolveCurrentPlan(currentPlanId, billingPlanSchema) {
  const plans = normalizeArray(normalizeObject(billingPlanSchema)?.plans)
    .filter((plan) => normalizeObject(plan))
    .map((plan) => ({
      planId: normalizeString(plan.planId),
      planName: normalizeString(plan.planName),
      pricingModel: normalizeString(plan.pricingModel),
      usageBased: plan.usageBased === true,
    }));
  const matchedPlan = currentPlanId
    ? plans.find((plan) => plan.planId === currentPlanId) ?? null
    : null;

  return {
    currentPlanId,
    plan: matchedPlan,
  };
}

function resolveSubscriptionNotice({
  subscriptionState,
  workspaceBillingState,
  billingGuardDecision,
}) {
  const guardDecision = normalizeObject(billingGuardDecision);
  const primaryFailure = normalizeObject(guardDecision?.primaryFailure);
  const summary = normalizeObject(guardDecision?.summary);
  const workspaceState = normalizeObject(workspaceBillingState);

  if (normalizeString(guardDecision?.decision) && normalizeString(guardDecision?.decision) !== "allowed") {
    return {
      kind: primaryFailure ? "failure" : "notice",
      decision: normalizeString(guardDecision?.decision),
      reason: normalizeString(primaryFailure?.reason)
        ?? normalizeString(guardDecision?.recommendedAction?.reason)
        ?? null,
      message: normalizeString(summary?.explanation),
    };
  }

  if (
    normalizeSubscriptionStatus(workspaceState?.subscriptionStatus) === "past_due"
    || normalizeString(workspaceState?.lastBillingEventType) === "payment-failure"
  ) {
    return {
      kind: "warning",
      decision: null,
      reason: normalizeString(workspaceState?.lastBillingEventType) ?? "past_due",
      message: normalizeString(normalizeObject(subscriptionState)?.summary),
    };
  }

  return null;
}

function resolveSubscription({
  subscriptionState,
  workspaceBillingState,
  billingGuardDecision,
}) {
  const normalizedSubscriptionState = normalizeObject(subscriptionState);
  const normalizedWorkspaceBillingState = normalizeObject(workspaceBillingState);

  return {
    subscriptionStateId: normalizeString(normalizedSubscriptionState?.subscriptionStateId),
    workspaceId: resolveWorkspaceId(normalizedWorkspaceBillingState, normalizedSubscriptionState),
    status: normalizeSubscriptionStatus(normalizedSubscriptionState?.status),
    source: normalizeString(normalizedSubscriptionState?.source),
    summary: normalizeString(normalizedSubscriptionState?.summary),
    currentPlanId: normalizeString(normalizedWorkspaceBillingState?.currentPlanId),
    subscriptionStatus: normalizeSubscriptionStatus(normalizedWorkspaceBillingState?.subscriptionStatus),
    lastBillingEventType: normalizeString(normalizedWorkspaceBillingState?.lastBillingEventType),
    summaryStatus: normalizeString(normalizedWorkspaceBillingState?.summary?.summaryStatus),
    notice: resolveSubscriptionNotice({
      subscriptionState: normalizedSubscriptionState,
      workspaceBillingState: normalizedWorkspaceBillingState,
      billingGuardDecision,
    }),
  };
}

function resolveRecommendedActionType({
  workspaceBillingState,
  billingGuardDecision,
}) {
  const recommendedAction = normalizeString(normalizeObject(billingGuardDecision)?.recommendedAction?.type);
  const currentPlanId = normalizeString(normalizeObject(workspaceBillingState)?.currentPlanId);

  if (recommendedAction === "retry-payment") {
    return "retry-payment";
  }

  if (recommendedAction === "upgrade-plan") {
    return currentPlanId ? "change-plan" : "create-checkout";
  }

  return null;
}

function isCancelableStatus(status) {
  return status === "trial" || status === "active" || status === "past_due";
}

function buildActionAvailability({
  actionType,
  workspaceId,
  currentPlanId,
  effectiveStatus,
  lastBillingEventType,
  recommendedActionType,
}) {
  if (!workspaceId) {
    return {
      actionType,
      available: false,
      reason: "missing-workspace",
      recommended: false,
    };
  }

  switch (actionType) {
    case "create-checkout":
      return {
        actionType,
        available: currentPlanId === null,
        reason: currentPlanId ? "current-plan-present" : "checkout-available",
        recommended: recommendedActionType === "create-checkout",
      };
    case "change-plan":
      return {
        actionType,
        available: currentPlanId !== null,
        reason: currentPlanId ? "plan-change-available" : "missing-current-plan",
        recommended: recommendedActionType === "change-plan",
      };
    case "cancel-subscription":
      return {
        actionType,
        available: isCancelableStatus(effectiveStatus),
        reason: isCancelableStatus(effectiveStatus) ? "cancel-available" : "status-not-cancelable",
        recommended: false,
      };
    case "retry-payment": {
      const available = effectiveStatus === "past_due" || lastBillingEventType === "payment-failure";
      return {
        actionType,
        available,
        reason: available ? "retry-available" : "retry-not-needed",
        recommended: recommendedActionType === "retry-payment",
      };
    }
    case "update-payment-method":
      return {
        actionType,
        available: true,
        reason: "supported-action",
        recommended: false,
      };
    case "update-billing-details":
      return {
        actionType,
        available: true,
        reason: "supported-action",
        recommended: false,
      };
    default:
      return {
        actionType,
        available: false,
        reason: "unsupported-action",
        recommended: false,
      };
  }
}

function resolveAvailableActions({
  subscriptionState,
  workspaceBillingState,
  billingGuardDecision,
}) {
  const normalizedSubscriptionState = normalizeObject(subscriptionState);
  const normalizedWorkspaceBillingState = normalizeObject(workspaceBillingState);
  const workspaceId = resolveWorkspaceId(normalizedWorkspaceBillingState, normalizedSubscriptionState);
  const currentPlanId = normalizeString(normalizedWorkspaceBillingState?.currentPlanId);
  const effectiveStatus = normalizeSubscriptionStatus(normalizedSubscriptionState?.status)
    ?? normalizeSubscriptionStatus(normalizedWorkspaceBillingState?.subscriptionStatus);
  const lastBillingEventType = normalizeString(normalizedWorkspaceBillingState?.lastBillingEventType);
  const recommendedActionType = resolveRecommendedActionType({
    workspaceBillingState: normalizedWorkspaceBillingState,
    billingGuardDecision,
  });

  return WORKSPACE_BILLING_ACTIONS.map((actionType) => buildActionAvailability({
    actionType,
    workspaceId,
    currentPlanId,
    effectiveStatus,
    lastBillingEventType,
    recommendedActionType,
  }));
}

function resolveHistory({
  normalizedBillingEvents,
  workspaceBillingState,
  subscriptionState,
}) {
  const workspaceId = resolveWorkspaceId(
    normalizeObject(workspaceBillingState),
    normalizeObject(subscriptionState),
  );
  const billingEvents = normalizeArray(normalizedBillingEvents)
    .filter((event) => normalizeObject(event));

  if (!workspaceId) {
    return billingEvents;
  }

  return billingEvents.filter((event) => normalizeString(event.workspaceId) === workspaceId);
}

export function createBillingSettingsModel({
  billingPlanSchema = null,
  subscriptionState = null,
  workspaceBillingState = null,
  billingGuardDecision = null,
  normalizedBillingEvents = [],
} = {}) {
  const normalizedWorkspaceBillingState = normalizeObject(workspaceBillingState);
  const currentPlanId = normalizeString(normalizedWorkspaceBillingState?.currentPlanId);

  return {
    billingSettingsModel: {
      currentPlan: resolveCurrentPlan(currentPlanId, billingPlanSchema),
      subscription: resolveSubscription({
        subscriptionState,
        workspaceBillingState,
        billingGuardDecision,
      }),
      availableActions: resolveAvailableActions({
        subscriptionState,
        workspaceBillingState,
        billingGuardDecision,
      }),
      history: resolveHistory({
        normalizedBillingEvents,
        workspaceBillingState,
        subscriptionState,
      }),
    },
  };
}
