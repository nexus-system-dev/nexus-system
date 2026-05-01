import { BILLING_EVENT_CANONICAL_CONTRACT } from "./billing-event-normalizer.js";

const PAYING_EVENT_TYPES = new Set(["checkout", "renewal"]);
const ACTIVE_SUBSCRIPTION_EVENT_TYPES = new Set(["checkout", "renewal", "cancel"]);
const KNOWN_EVENT_TYPES = new Set(BILLING_EVENT_CANONICAL_CONTRACT.eventTypes);

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeAmount(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeTimestamp(value) {
  const normalizedValue = normalizeString(value);
  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Date.parse(normalizedValue);
  return Number.isNaN(parsedValue) ? null : { raw: normalizedValue, parsed: parsedValue };
}

function normalizeEventType(value) {
  const normalizedValue = normalizeString(value);
  return normalizedValue && KNOWN_EVENT_TYPES.has(normalizedValue) ? normalizedValue : null;
}

function normalizeBillingEvent(event, inputIndex) {
  const normalizedEvent = normalizeObject(event);
  if (!normalizedEvent) {
    return null;
  }

  const eventType = normalizeEventType(normalizedEvent.eventType);
  const idempotencyKey = normalizeString(normalizedEvent.idempotencyKey);
  const occurredAt = normalizeTimestamp(normalizedEvent.occurredAt);
  const amount = normalizeAmount(normalizedEvent.amount);

  if (!eventType || !idempotencyKey || !occurredAt || amount === null) {
    return null;
  }

  return {
    eventType,
    workspaceId: normalizeString(normalizedEvent.workspaceId),
    userId: normalizeString(normalizedEvent.userId),
    amount,
    idempotencyKey,
    occurredAt: occurredAt.raw,
    occurredAtMs: occurredAt.parsed,
    inputIndex,
  };
}

function isEarlierEvent(candidate, current) {
  if (candidate.occurredAtMs !== current.occurredAtMs) {
    return candidate.occurredAtMs < current.occurredAtMs;
  }

  return candidate.inputIndex < current.inputIndex;
}

function isLaterEvent(candidate, current) {
  if (candidate.occurredAtMs !== current.occurredAtMs) {
    return candidate.occurredAtMs > current.occurredAtMs;
  }

  return candidate.inputIndex > current.inputIndex;
}

function dedupeBillingEvents(normalizedBillingEvents) {
  const retainedEvents = [];
  const seenIdempotencyKeys = new Set();
  let ignoredEvents = 0;

  for (const [inputIndex, event] of normalizedBillingEvents.entries()) {
    const normalizedEvent = normalizeBillingEvent(event, inputIndex);
    if (!normalizedEvent) {
      ignoredEvents += 1;
      continue;
    }

    if (seenIdempotencyKeys.has(normalizedEvent.idempotencyKey)) {
      ignoredEvents += 1;
      continue;
    }

    seenIdempotencyKeys.add(normalizedEvent.idempotencyKey);
    retainedEvents.push(normalizedEvent);
  }

  return {
    retainedEvents,
    ignoredEvents,
  };
}

function buildPayingUserMetricsId({
  payingUsers,
  convertedUsers,
  activeSubscriptions,
  countedEvents,
  ignoredEvents,
  summaryStatus,
}) {
  return `paying-user-metrics:${summaryStatus}:${payingUsers}:${convertedUsers}:${activeSubscriptions}:${countedEvents}:${ignoredEvents}`;
}

export function createPayingUserTracker({
  normalizedBillingEvents = [],
} = {}) {
  const billingEvents = Array.isArray(normalizedBillingEvents) ? normalizedBillingEvents : [];
  const { retainedEvents, ignoredEvents: initialIgnoredEvents } = dedupeBillingEvents(billingEvents);
  let ignoredEvents = initialIgnoredEvents;

  const payingUsers = new Set();
  const firstPaidEventByUser = new Map();
  const latestRelevantEventByWorkspace = new Map();

  for (const event of retainedEvents) {
    const isQualifyingPaidEvent = PAYING_EVENT_TYPES.has(event.eventType) && event.amount > 0;
    if (isQualifyingPaidEvent) {
      if (event.userId) {
        payingUsers.add(event.userId);
        const existingFirstPaidEvent = firstPaidEventByUser.get(event.userId);
        if (!existingFirstPaidEvent || isEarlierEvent(event, existingFirstPaidEvent)) {
          firstPaidEventByUser.set(event.userId, event);
        }
      } else {
        ignoredEvents += 1;
      }
    }

    if (ACTIVE_SUBSCRIPTION_EVENT_TYPES.has(event.eventType)) {
      if (event.workspaceId) {
        const existingLatestRelevantEvent = latestRelevantEventByWorkspace.get(event.workspaceId);
        if (!existingLatestRelevantEvent || isLaterEvent(event, existingLatestRelevantEvent)) {
          latestRelevantEventByWorkspace.set(event.workspaceId, event);
        }
      } else {
        ignoredEvents += 1;
      }
    }
  }

  let convertedUsers = 0;
  for (const [userId, firstPaidEvent] of firstPaidEventByUser.entries()) {
    if (payingUsers.has(userId) && firstPaidEvent.eventType === "checkout") {
      convertedUsers += 1;
    }
  }

  let activeSubscriptions = 0;
  for (const latestEvent of latestRelevantEventByWorkspace.values()) {
    if (latestEvent.eventType === "checkout" || latestEvent.eventType === "renewal") {
      activeSubscriptions += 1;
    }
  }

  const countedEvents = retainedEvents.length;
  const summaryStatus = countedEvents === 0 ? "missing-inputs" : "complete";

  return {
    payingUserMetrics: {
      payingUserMetricsId: buildPayingUserMetricsId({
        payingUsers: payingUsers.size,
        convertedUsers,
        activeSubscriptions,
        countedEvents,
        ignoredEvents,
        summaryStatus,
      }),
      payingUsers: payingUsers.size,
      convertedUsers,
      activeSubscriptions,
      summary: {
        summaryStatus,
        countedEvents,
        ignoredEvents,
      },
    },
  };
}
