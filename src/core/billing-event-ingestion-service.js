import { createNormalizedBillingEvent } from "./billing-event-normalizer.js";

function normalizeExistingEvents(existingNormalizedBillingEvents) {
  return Array.isArray(existingNormalizedBillingEvents) ? existingNormalizedBillingEvents : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function ingestBillingEvent({
  billingEvent,
  existingNormalizedBillingEvents,
} = {}) {
  const storedEvents = normalizeExistingEvents(existingNormalizedBillingEvents);
  const { normalizedBillingEvent } = createNormalizedBillingEvent({
    billingEvent,
  });

  if (!normalizedBillingEvent) {
    return {
      normalizedBillingEvent: null,
      normalizedBillingEvents: storedEvents,
      ingestStatus: "rejected",
      wasDuplicate: false,
    };
  }

  const normalizedIdempotencyKey = normalizeString(normalizedBillingEvent.idempotencyKey);
  const duplicateEvent = storedEvents.find((event) => normalizeString(event?.idempotencyKey) === normalizedIdempotencyKey) ?? null;
  if (duplicateEvent) {
    return {
      normalizedBillingEvent: duplicateEvent,
      normalizedBillingEvents: storedEvents,
      ingestStatus: "duplicate",
      wasDuplicate: true,
    };
  }

  return {
    normalizedBillingEvent,
    normalizedBillingEvents: [...storedEvents, normalizedBillingEvent],
    ingestStatus: "accepted",
    wasDuplicate: false,
  };
}
