import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCanonicalBillingEventInput,
  buildWorkspaceBillingIdempotencyEnvelope,
  buildWorkspaceBillingPayload,
  buildWorkspaceBillingResult,
  validateWorkspaceBillingActionInput,
  WORKSPACE_BILLING_EVENT_TYPES,
} from "../src/core/workspace-billing-action-service.js";

test("same canonical request derives the same idempotency envelope", () => {
  const normalizedInput = {
    planId: "pro",
    billingCycle: "monthly",
  };

  const firstEnvelope = buildWorkspaceBillingIdempotencyEnvelope({
    workspaceId: "workspace-1",
    actionType: "create-checkout",
    normalizedInput,
  });
  const secondEnvelope = buildWorkspaceBillingIdempotencyEnvelope({
    workspaceId: "workspace-1",
    actionType: "create-checkout",
    normalizedInput,
  });

  assert.equal(firstEnvelope, secondEnvelope);
  assert.equal(firstEnvelope, "billing-action::workspace-1::create-checkout::create-checkout::pro::monthly");
});

test("update-billing-details uses deterministic serialized updated fields in the idempotency envelope", () => {
  const envelope = buildWorkspaceBillingIdempotencyEnvelope({
    workspaceId: "workspace-1",
    actionType: "update-billing-details",
    normalizedInput: {
      taxId: "123",
      billingEmail: "billing@example.com",
    },
  });

  assert.equal(
    envelope,
    'billing-action::workspace-1::update-billing-details::update-billing-details::{"billingEmail":"billing@example.com","taxId":"123"}',
  );
});

test("workspace billing result shapes match the locked contracts", () => {
  assert.deepEqual(
    buildWorkspaceBillingResult({
      actionType: "create-checkout",
      normalizedInput: { planId: "pro", billingCycle: "yearly" },
    }),
    {
      selectedPlanId: "pro",
      selectedBillingCycle: "yearly",
    },
  );
  assert.deepEqual(
    buildWorkspaceBillingResult({
      actionType: "change-plan",
      normalizedInput: { targetPlanId: "enterprise" },
    }),
    {
      targetPlanId: "enterprise",
    },
  );
  assert.deepEqual(
    buildWorkspaceBillingResult({
      actionType: "cancel-subscription",
      normalizedInput: { cancelMode: "end-of-cycle" },
    }),
    {
      cancelMode: "end-of-cycle",
    },
  );
  assert.deepEqual(
    buildWorkspaceBillingResult({
      actionType: "retry-payment",
      normalizedInput: {},
    }),
    {},
  );
  assert.deepEqual(
    buildWorkspaceBillingResult({
      actionType: "update-payment-method",
      normalizedInput: { paymentMethodRef: "pm_1" },
    }),
    {
      updatedPaymentMethodRef: "pm_1",
    },
  );
  assert.deepEqual(
    buildWorkspaceBillingResult({
      actionType: "update-billing-details",
      normalizedInput: { billingEmail: "billing@example.com" },
    }),
    {
      updatedBillingDetails: {
        billingEmail: "billing@example.com",
      },
    },
  );
});

test("billing action payload shape stays canonical", () => {
  const billingPayload = buildWorkspaceBillingPayload({
    workspaceId: "workspace-1",
    actionType: "retry-payment",
    status: "accepted",
    emittedEventType: "retry",
    stateRefreshRequired: true,
    result: {},
  });

  assert.deepEqual(Object.keys(billingPayload), [
    "billingActionId",
    "workspaceId",
    "actionType",
    "status",
    "source",
    "emittedEventType",
    "stateRefreshRequired",
    "result",
  ]);
  assert.equal(billingPayload.source, "billing-action-api");
});

test("canonical billing event input maps all six actions to the locked emitted event types", () => {
  for (const [actionType, emittedEventType] of Object.entries(WORKSPACE_BILLING_EVENT_TYPES)) {
    const canonicalEvent = buildCanonicalBillingEventInput({
      workspaceId: "workspace-1",
      userId: "user-1",
      actionType,
      normalizedInput: {},
      currency: "usd",
      idempotencyEnvelope: `billing-action::workspace-1::${actionType}::fingerprint`,
    });

    assert.equal(canonicalEvent.billingEvent.eventType, emittedEventType);
    assert.equal(canonicalEvent.billingEvent.amount, 0);
    assert.equal(canonicalEvent.billingEvent.sourceProvider, "billing-action-api");
  }
});

test("validation enforces the exact action input contracts", () => {
  assert.equal(validateWorkspaceBillingActionInput("create-checkout", { planId: "pro", billingCycle: "monthly" }).isValid, true);
  assert.equal(validateWorkspaceBillingActionInput("create-checkout", { planId: "pro" }).isValid, false);
  assert.equal(validateWorkspaceBillingActionInput("change-plan", { targetPlanId: "enterprise" }).isValid, true);
  assert.equal(validateWorkspaceBillingActionInput("cancel-subscription", { cancelMode: "immediate" }).isValid, true);
  assert.equal(validateWorkspaceBillingActionInput("cancel-subscription", { cancelMode: "later" }).isValid, false);
  assert.equal(validateWorkspaceBillingActionInput("retry-payment", {}).isValid, true);
  assert.equal(validateWorkspaceBillingActionInput("retry-payment", { unexpected: true }).isValid, false);
  assert.equal(validateWorkspaceBillingActionInput("update-payment-method", { paymentMethodRef: "pm_1" }).isValid, true);
  assert.equal(validateWorkspaceBillingActionInput("update-billing-details", { billingEmail: "billing@example.com" }).isValid, true);
  assert.equal(validateWorkspaceBillingActionInput("update-billing-details", {}).isValid, false);
});
