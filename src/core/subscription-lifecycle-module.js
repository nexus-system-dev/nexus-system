const VALID_RUNTIME_STATUSES = new Set(["trial", "active", "past_due", "canceled"]);

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function resolveRuntimeStatus(workspaceBillingState) {
  const normalizedWorkspaceBillingState = normalizeObject(workspaceBillingState);
  const runtimeStatus = normalizedWorkspaceBillingState?.subscriptionStatus;

  if (typeof runtimeStatus === "string" && VALID_RUNTIME_STATUSES.has(runtimeStatus)) {
    return runtimeStatus;
  }

  return null;
}

function buildSummary({ source, status, hasUsableRuntimeState, hasValidRuntimeStatus }) {
  if (source === "workspace-billing-state") {
    if (status === "trial") {
      return "Workspace is in trial period (runtime).";
    }

    if (status === "active") {
      return "Workspace subscription is active (runtime).";
    }

    if (status === "past_due") {
      return "Workspace subscription is past due (runtime).";
    }

    return "Workspace subscription is canceled (runtime).";
  }

  if (source === "billing-plan-schema") {
    return "Workspace is in trial period (schema fallback).";
  }

  if (hasUsableRuntimeState && !hasValidRuntimeStatus) {
    return "Workspace subscription is active (default fallback; runtime evidence present but status unavailable).";
  }

  return "Workspace subscription is active (default fallback).";
}

export function createSubscriptionLifecycle({
  workspaceBillingState = null,
  billingPlanSchema = null,
  workspaceModel = null,
} = {}) {
  const normalizedBillingPlanSchema = normalizeObject(billingPlanSchema);
  const normalizedWorkspaceModel = normalizeObject(workspaceModel);
  const normalizedWorkspaceBillingState = normalizeObject(workspaceBillingState);
  const workspaceId = normalizeString(normalizedWorkspaceModel?.workspaceId, null);
  const runtimeStatus = resolveRuntimeStatus(workspaceBillingState);
  const hasUsableRuntimeState = normalizedWorkspaceBillingState !== null;
  const hasValidRuntimeStatus = runtimeStatus !== null;

  let status = "active";
  let source = "fallback-default";

  if (hasValidRuntimeStatus) {
    status = runtimeStatus;
    source = "workspace-billing-state";
  } else if (normalizedBillingPlanSchema?.trialRules?.default?.enabled === true) {
    status = "trial";
    source = "billing-plan-schema";
  }

  return {
    subscriptionState: {
      subscriptionStateId: `subscription-state::${workspaceId ?? "null"}::${status}::${source}`,
      workspaceId,
      status,
      source,
      summary: buildSummary({
        source,
        status,
        hasUsableRuntimeState,
        hasValidRuntimeStatus,
      }),
    },
  };
}
