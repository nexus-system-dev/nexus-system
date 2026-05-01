import { BILLING_EVENT_CANONICAL_CONTRACT } from "./billing-event-normalizer.js";

const KNOWN_EVENT_TYPES = new Set(BILLING_EVENT_CANONICAL_CONTRACT.eventTypes);
const ALLOWED_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trial",
  "past_due",
  "canceled",
]);

const EMPTY_WORKSPACE_BILLING_STATE = Object.freeze({
  workspaceBillingStateId: "workspace-billing-state::null::missing-inputs::null::0",
  workspaceId: null,
  currentPlanId: null,
  subscriptionStatus: null,
  lastBillingEventType: null,
  source: {
    hasBillingEvents: false,
    eventCount: 0,
  },
  summary: {
    summaryStatus: "missing-inputs",
  },
});

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeTimestamp(value) {
  const normalizedValue = normalizeString(value);
  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Date.parse(normalizedValue);
  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function normalizeEventType(value) {
  const normalizedValue = normalizeString(value);
  return normalizedValue && KNOWN_EVENT_TYPES.has(normalizedValue) ? normalizedValue : null;
}

function normalizeSubscriptionStatus(value) {
  const normalizedValue = normalizeString(value);
  return normalizedValue && ALLOWED_SUBSCRIPTION_STATUSES.has(normalizedValue) ? normalizedValue : null;
}

function normalizeWorkspaceBillingEvent(event, inputIndex) {
  const normalizedEvent = normalizeObject(event);
  if (!normalizedEvent) {
    return null;
  }

  const workspaceId = normalizeString(normalizedEvent.workspaceId);
  const eventType = normalizeEventType(normalizedEvent.eventType);
  const occurredAtMs = normalizeTimestamp(normalizedEvent.occurredAt);
  if (!workspaceId || !eventType || occurredAtMs === null) {
    return null;
  }

  const unmappedFields = normalizeObject(normalizedEvent.metadata?.unmappedFields) ?? {};
  const planId = normalizeString(unmappedFields.planId);
  const currentPlanId = normalizeString(unmappedFields.currentPlanId);
  const subscriptionStatus = normalizeSubscriptionStatus(unmappedFields.subscriptionStatus);
  const hasPlanConflict = Boolean(planId && currentPlanId && planId !== currentPlanId);

  return {
    workspaceId,
    eventType,
    occurredAtMs,
    inputIndex,
    planId,
    currentPlanId,
    subscriptionStatus,
    hasPlanConflict,
  };
}

function isLaterEvent(candidate, current) {
  if (candidate.occurredAtMs !== current.occurredAtMs) {
    return candidate.occurredAtMs > current.occurredAtMs;
  }

  return candidate.inputIndex > current.inputIndex;
}

function resolveStatusUpdate(event) {
  switch (event.eventType) {
    case "checkout":
    case "renewal":
      return "active";
    case "payment-failure":
      return "past_due";
    case "cancel":
      return "canceled";
    case "subscription-state":
      return event.subscriptionStatus;
    default:
      return null;
  }
}

function resolvePlanUpdate(event) {
  if (event.hasPlanConflict) {
    return null;
  }

  switch (event.eventType) {
    case "checkout":
    case "renewal":
    case "plan-change":
      return event.planId;
    case "subscription-state":
      return event.currentPlanId;
    default:
      return null;
  }
}

function hasTrialFallback(billingPlanSchema) {
  const normalizedSchema = normalizeObject(billingPlanSchema);
  return normalizedSchema?.trialRules?.default?.enabled === true;
}

function buildWorkspaceBillingStateId({
  workspaceId,
  summaryStatus,
  lastBillingEventType,
  eventCount,
}) {
  return `workspace-billing-state::${workspaceId ?? "null"}::${summaryStatus}::${lastBillingEventType ?? "null"}::${eventCount}`;
}

export function createWorkspaceBillingStateSource({
  normalizedBillingEvents = [],
  billingPlanSchema = null,
  workspaceModel = null,
} = {}) {
  const normalizedWorkspaceModel = normalizeObject(workspaceModel);
  const workspaceId = normalizeString(normalizedWorkspaceModel?.workspaceId);
  if (!workspaceId) {
    return {
      workspaceBillingState: EMPTY_WORKSPACE_BILLING_STATE,
    };
  }

  const billingEvents = Array.isArray(normalizedBillingEvents) ? normalizedBillingEvents : [];
  let latestWorkspaceEvent = null;
  let latestStatusEvent = null;
  let latestPlanEvent = null;
  let currentPlanId = null;
  let subscriptionStatus = null;
  let eventCount = 0;
  let hasPlanConflict = false;

  for (const [inputIndex, event] of billingEvents.entries()) {
    const normalizedEvent = normalizeWorkspaceBillingEvent(event, inputIndex);
    if (!normalizedEvent || normalizedEvent.workspaceId !== workspaceId) {
      continue;
    }

    eventCount += 1;
    if (!latestWorkspaceEvent || isLaterEvent(normalizedEvent, latestWorkspaceEvent)) {
      latestWorkspaceEvent = normalizedEvent;
    }

    if (normalizedEvent.hasPlanConflict) {
      hasPlanConflict = true;
    }

    const statusUpdate = resolveStatusUpdate(normalizedEvent);
    if (
      statusUpdate
      && (!latestStatusEvent || isLaterEvent(normalizedEvent, latestStatusEvent))
    ) {
      latestStatusEvent = normalizedEvent;
      subscriptionStatus = statusUpdate;
    }

    const planUpdate = resolvePlanUpdate(normalizedEvent);
    if (
      planUpdate
      && (!latestPlanEvent || isLaterEvent(normalizedEvent, latestPlanEvent))
    ) {
      latestPlanEvent = normalizedEvent;
      currentPlanId = planUpdate;
    }
  }

  if (!subscriptionStatus && hasTrialFallback(billingPlanSchema)) {
    subscriptionStatus = "trial";
  }

  let summaryStatus = "complete";
  if (eventCount === 0 && subscriptionStatus !== "trial") {
    summaryStatus = "missing-inputs";
  } else if (hasPlanConflict || !subscriptionStatus || !currentPlanId) {
    summaryStatus = "partial";
  }

  const lastBillingEventType = latestWorkspaceEvent?.eventType ?? null;

  return {
    workspaceBillingState: {
      workspaceBillingStateId: buildWorkspaceBillingStateId({
        workspaceId,
        summaryStatus,
        lastBillingEventType,
        eventCount,
      }),
      workspaceId,
      currentPlanId,
      subscriptionStatus,
      lastBillingEventType,
      source: {
        hasBillingEvents: eventCount > 0,
        eventCount,
      },
      summary: {
        summaryStatus,
      },
    },
  };
}
