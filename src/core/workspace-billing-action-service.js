export const WORKSPACE_BILLING_ACTIONS = Object.freeze([
  "create-checkout",
  "change-plan",
  "cancel-subscription",
  "retry-payment",
  "update-payment-method",
  "update-billing-details",
]);

export const WORKSPACE_BILLING_EVENT_TYPES = Object.freeze({
  "create-checkout": "checkout",
  "change-plan": "plan-change",
  "cancel-subscription": "cancel",
  "retry-payment": "retry",
  "update-payment-method": "payment-method-update",
  "update-billing-details": "billing-details-update",
});

const ALLOWED_BILLING_DETAILS_FIELDS = Object.freeze([
  "billingEmail",
  "companyName",
  "taxId",
  "countryCode",
]);

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function stableSerializeObject(value) {
  const normalizedValue = normalizeObject(value) ?? {};
  const sortedEntries = Object.keys(normalizedValue)
    .sort()
    .map((key) => [key, normalizedValue[key]]);
  return JSON.stringify(Object.fromEntries(sortedEntries));
}

export function isWorkspaceBillingActionType(actionType) {
  return WORKSPACE_BILLING_ACTIONS.includes(actionType);
}

export function validateWorkspaceBillingActionInput(actionType, billingInput = {}) {
  const normalizedInput = normalizeObject(billingInput) ?? {};

  switch (actionType) {
    case "create-checkout": {
      const planId = normalizeString(normalizedInput.planId);
      const billingCycle = normalizedInput.billingCycle === "monthly" || normalizedInput.billingCycle === "yearly"
        ? normalizedInput.billingCycle
        : null;

      return planId && billingCycle
        ? {
            isValid: true,
            normalizedInput: { planId, billingCycle },
          }
        : { isValid: false, normalizedInput: null };
    }
    case "change-plan": {
      const targetPlanId = normalizeString(normalizedInput.targetPlanId);
      return targetPlanId
        ? {
            isValid: true,
            normalizedInput: { targetPlanId },
          }
        : { isValid: false, normalizedInput: null };
    }
    case "cancel-subscription": {
      const cancelMode = normalizedInput.cancelMode === "immediate" || normalizedInput.cancelMode === "end-of-cycle"
        ? normalizedInput.cancelMode
        : null;

      return cancelMode
        ? {
            isValid: true,
            normalizedInput: { cancelMode },
          }
        : { isValid: false, normalizedInput: null };
    }
    case "retry-payment":
      return {
        isValid: Object.keys(normalizedInput).length === 0,
        normalizedInput: {},
      };
    case "update-payment-method": {
      const paymentMethodRef = normalizeString(normalizedInput.paymentMethodRef);
      return paymentMethodRef
        ? {
            isValid: true,
            normalizedInput: { paymentMethodRef },
          }
        : { isValid: false, normalizedInput: null };
    }
    case "update-billing-details": {
      const acceptedFields = {};
      for (const field of ALLOWED_BILLING_DETAILS_FIELDS) {
        const value = normalizeString(normalizedInput[field]);
        if (value) {
          acceptedFields[field] = value;
        }
      }

      return Object.keys(acceptedFields).length > 0
        ? {
            isValid: true,
            normalizedInput: acceptedFields,
          }
        : { isValid: false, normalizedInput: null };
    }
    default:
      return {
        isValid: false,
        normalizedInput: null,
      };
  }
}

export function buildWorkspaceBillingIdempotencyEnvelope({
  workspaceId,
  actionType,
  normalizedInput,
}) {
  const safeWorkspaceId = normalizeString(workspaceId) ?? "unknown-workspace";
  const input = normalizeObject(normalizedInput) ?? {};

  let stableActionFingerprint = "unknown";

  switch (actionType) {
    case "create-checkout":
      stableActionFingerprint = `create-checkout::${input.planId}::${input.billingCycle}`;
      break;
    case "change-plan":
      stableActionFingerprint = `change-plan::${input.targetPlanId}`;
      break;
    case "cancel-subscription":
      stableActionFingerprint = `cancel-subscription::${input.cancelMode}`;
      break;
    case "retry-payment":
      stableActionFingerprint = "retry-payment::default";
      break;
    case "update-payment-method":
      stableActionFingerprint = `update-payment-method::${input.paymentMethodRef}`;
      break;
    case "update-billing-details":
      stableActionFingerprint = `update-billing-details::${stableSerializeObject(input)}`;
      break;
    default:
      stableActionFingerprint = `${actionType ?? "unknown"}::unknown`;
  }

  return `billing-action::${safeWorkspaceId}::${actionType}::${stableActionFingerprint}`;
}

export function buildWorkspaceBillingActionId({
  workspaceId,
  actionType,
  status,
}) {
  return `billing-action-result::${workspaceId}::${actionType}::${status}`;
}

export function buildWorkspaceBillingResult({
  actionType,
  normalizedInput,
}) {
  const input = normalizeObject(normalizedInput) ?? {};

  switch (actionType) {
    case "create-checkout":
      return {
        selectedPlanId: input.planId,
        selectedBillingCycle: input.billingCycle,
      };
    case "change-plan":
      return {
        targetPlanId: input.targetPlanId,
      };
    case "cancel-subscription":
      return {
        cancelMode: input.cancelMode,
      };
    case "retry-payment":
      return {};
    case "update-payment-method":
      return {
        updatedPaymentMethodRef: input.paymentMethodRef,
      };
    case "update-billing-details":
      return {
        updatedBillingDetails: { ...input },
      };
    default:
      return {};
  }
}

export function buildWorkspaceBillingPayload({
  workspaceId,
  actionType,
  status,
  emittedEventType,
  stateRefreshRequired,
  result,
}) {
  return {
    billingActionId: buildWorkspaceBillingActionId({
      workspaceId,
      actionType,
      status,
    }),
    workspaceId,
    actionType,
    status,
    source: "billing-action-api",
    emittedEventType,
    stateRefreshRequired,
    result,
  };
}

export function buildCanonicalBillingEventInput({
  workspaceId,
  userId,
  actionType,
  normalizedInput,
  currency,
  idempotencyEnvelope,
}) {
  const emittedEventType = WORKSPACE_BILLING_EVENT_TYPES[actionType] ?? null;
  const sourceEventId = `billing-event::${workspaceId}::${actionType}::${idempotencyEnvelope.split("::").slice(3).join("::")}`;

  return {
    billingEvent: {
      eventType: emittedEventType,
      workspaceId,
      userId: normalizeString(userId),
      amount: 0,
      currency: normalizeString(currency) ?? "usd",
      sourceProvider: "billing-action-api",
      sourceEventId,
      idempotencyKey: idempotencyEnvelope,
      occurredAt: "2026-01-01T00:00:00.000Z",
      actionInput: normalizeObject(normalizedInput) ?? {},
    },
  };
}
