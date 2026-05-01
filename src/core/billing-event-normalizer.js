const BILLING_EVENT_CONTRACT = Object.freeze({
  eventTypes: Object.freeze([
    "checkout",
    "renewal",
    "payment-failure",
    "retry",
    "cancel",
    "plan-change",
    "subscription-state",
    "payment-method-update",
    "billing-details-update",
  ]),
  orderedTopLevelFields: Object.freeze([
    "eventType",
    "workspaceId",
    "userId",
    "amount",
    "currency",
    "sourceProvider",
    "sourceEventId",
    "idempotencyKey",
    "occurredAt",
    "metadata",
  ]),
  requiredFields: Object.freeze([
    "eventType",
    "workspaceId",
    "amount",
    "currency",
    "sourceProvider",
    "sourceEventId",
    "idempotencyKey",
    "occurredAt",
  ]),
});

const ALLOWED_TOP_LEVEL_FIELDS = new Set(BILLING_EVENT_CONTRACT.orderedTopLevelFields);
const KNOWN_EVENT_TYPES = new Set(BILLING_EVENT_CONTRACT.eventTypes);

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeNullableString(value) {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeString(value);
}

function normalizeAmount(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeTimestamp(value) {
  const normalizedValue = normalizeString(value);
  if (!normalizedValue) {
    return null;
  }

  return Number.isNaN(Date.parse(normalizedValue)) ? null : normalizedValue;
}

function normalizeEventType(value) {
  const normalizedValue = normalizeString(value);
  return normalizedValue && KNOWN_EVENT_TYPES.has(normalizedValue) ? normalizedValue : null;
}

function hasRequiredFields(normalizedBillingEvent) {
  return BILLING_EVENT_CONTRACT.requiredFields.every((field) => normalizedBillingEvent[field] !== null);
}

function collectUnmappedFields(billingEvent) {
  const unmappedFields = {};

  for (const [key, value] of Object.entries(billingEvent)) {
    if (!ALLOWED_TOP_LEVEL_FIELDS.has(key)) {
      unmappedFields[key] = value;
    }
  }

  return unmappedFields;
}

function buildMetadata(unmappedFields) {
  return {
    unmappedFields,
  };
}

export function createNormalizedBillingEvent({
  billingEvent = null,
} = {}) {
  const normalizedInput = normalizeObject(billingEvent);
  if (!normalizedInput) {
    return {
      normalizedBillingEvent: null,
    };
  }

  const unmappedFields = collectUnmappedFields(normalizedInput);
  const normalizedBillingEvent = {
    eventType: normalizeEventType(normalizedInput.eventType),
    workspaceId: normalizeString(normalizedInput.workspaceId),
    userId: normalizeNullableString(normalizedInput.userId),
    amount: normalizeAmount(normalizedInput.amount),
    currency: normalizeString(normalizedInput.currency),
    sourceProvider: normalizeString(normalizedInput.sourceProvider),
    sourceEventId: normalizeString(normalizedInput.sourceEventId),
    idempotencyKey: normalizeString(normalizedInput.idempotencyKey),
    occurredAt: normalizeTimestamp(normalizedInput.occurredAt),
    metadata: buildMetadata(unmappedFields),
  };

  if (!hasRequiredFields(normalizedBillingEvent)) {
    return {
      normalizedBillingEvent: null,
    };
  }

  return {
    normalizedBillingEvent,
  };
}

export const BILLING_EVENT_CANONICAL_CONTRACT = BILLING_EVENT_CONTRACT;
