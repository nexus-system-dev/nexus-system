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

function buildGenericWebhookBillingEvent(providerPayload) {
  const normalizedPayload = normalizeObject(providerPayload);
  if (!normalizedPayload) {
    return {
      billingEvent: null,
    };
  }

  const providerEventId = normalizeString(normalizedPayload.providerEventId);

  return {
    billingEvent: {
      eventType: normalizeString(normalizedPayload.providerEventType),
      workspaceId: normalizeString(normalizedPayload.workspaceRef),
      userId: normalizeNullableString(normalizedPayload.customerRef ?? null),
      amount: normalizeAmount(normalizedPayload.amountValue),
      currency: normalizeString(normalizedPayload.currencyCode),
      sourceProvider: "generic-webhook",
      sourceEventId: providerEventId,
      idempotencyKey:
        normalizeNullableString(normalizedPayload.idempotencyKey)
        ?? (providerEventId ? `billing:generic-webhook:${providerEventId}` : null),
      occurredAt: normalizeString(normalizedPayload.occurredAt),
      providerPayload: normalizeObject(normalizedPayload.payload) ?? null,
    },
  };
}

export function createProviderBillingEventAdapter({
  providerType,
  providerPayload,
  workspaceModel,
} = {}) {
  if (providerType !== "generic-webhook") {
    return {
      billingEvent: null,
    };
  }

  const normalizedWorkspaceModel = normalizeObject(workspaceModel);
  const expectedWorkspaceId = normalizeString(normalizedWorkspaceModel?.workspaceId);
  const payloadWorkspaceId = normalizeString(normalizeObject(providerPayload)?.workspaceRef);

  if (expectedWorkspaceId && payloadWorkspaceId && expectedWorkspaceId !== payloadWorkspaceId) {
    return {
      billingEvent: null,
    };
  }

  return buildGenericWebhookBillingEvent(providerPayload);
}
