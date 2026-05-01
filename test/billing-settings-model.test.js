import test from "node:test";
import assert from "node:assert/strict";

import { createBillingSettingsModel } from "../src/core/billing-settings-model.js";

function buildNormalizedBillingEvent(overrides = {}) {
  return {
    eventType: "checkout",
    workspaceId: "workspace-1",
    userId: "user-1",
    amount: 49,
    currency: "usd",
    sourceProvider: "generic-webhook",
    sourceEventId: "billing-event-1",
    idempotencyKey: "billing-event-1",
    occurredAt: "2026-02-01T10:00:00.000Z",
    metadata: {
      unmappedFields: {},
    },
    ...overrides,
  };
}

test("billing settings model top-level shape is exact and excludes future sections", () => {
  const { billingSettingsModel } = createBillingSettingsModel({
    billingPlanSchema: {
      plans: [
        {
          planId: "pro",
          planName: "Pro",
          pricingModel: "flat",
          usageBased: false,
        },
      ],
    },
    subscriptionState: {
      subscriptionStateId: "subscription-state::workspace-1::active::workspace-billing-state",
      workspaceId: "workspace-1",
      status: "active",
      source: "workspace-billing-state",
      summary: "Workspace subscription is active (runtime).",
    },
    workspaceBillingState: {
      workspaceId: "workspace-1",
      currentPlanId: "pro",
      subscriptionStatus: "active",
      lastBillingEventType: "checkout",
      summary: {
        summaryStatus: "complete",
      },
    },
    billingGuardDecision: {
      decision: "allowed",
      summary: {
        summaryStatus: "complete",
        explanation: "Billing enforcement allows usage within entitlement, cost, and billing constraints.",
      },
    },
    normalizedBillingEvents: [buildNormalizedBillingEvent()],
  });

  assert.deepEqual(Object.keys(billingSettingsModel), [
    "currentPlan",
    "subscription",
    "availableActions",
    "history",
  ]);
  assert.equal(Object.hasOwn(billingSettingsModel, "paymentMethod"), false);
  assert.equal(Object.hasOwn(billingSettingsModel, "billingDetails"), false);
  assert.equal(Object.hasOwn(billingSettingsModel, "invoices"), false);
  assert.equal(Object.hasOwn(billingSettingsModel, "usage"), false);
  assert.equal(Object.hasOwn(billingSettingsModel, "warnings"), false);
  assert.equal(Object.hasOwn(billingSettingsModel, "upgradePrompts"), false);
});

test("currentPlan is derived from current runtime evidence only and does not expose selector data", () => {
  const { billingSettingsModel } = createBillingSettingsModel({
    billingPlanSchema: {
      plans: [
        {
          planId: "pro",
          planName: "Pro",
          pricingModel: "flat",
          usageBased: false,
        },
        {
          planId: "enterprise",
          planName: "Enterprise",
          pricingModel: "custom",
          usageBased: false,
        },
      ],
    },
    workspaceBillingState: {
      workspaceId: "workspace-1",
      currentPlanId: "pro",
      subscriptionStatus: "active",
      lastBillingEventType: "checkout",
      summary: {
        summaryStatus: "complete",
      },
    },
    subscriptionState: {
      subscriptionStateId: "subscription-state::workspace-1::active::workspace-billing-state",
      workspaceId: "workspace-1",
      status: "active",
      source: "workspace-billing-state",
      summary: "Workspace subscription is active (runtime).",
    },
  });

  assert.deepEqual(Object.keys(billingSettingsModel.currentPlan), [
    "currentPlanId",
    "plan",
  ]);
  assert.equal(billingSettingsModel.currentPlan.currentPlanId, "pro");
  assert.deepEqual(billingSettingsModel.currentPlan.plan, {
    planId: "pro",
    planName: "Pro",
    pricingModel: "flat",
    usageBased: false,
  });
  assert.equal(Object.hasOwn(billingSettingsModel.currentPlan, "plans"), false);
  assert.equal(Object.hasOwn(billingSettingsModel.currentPlan, "availablePlans"), false);
  assert.equal(Object.hasOwn(billingSettingsModel.currentPlan, "selector"), false);
});

test("subscription is derived from existing runtime state and keeps notices inside subscription", () => {
  const { billingSettingsModel } = createBillingSettingsModel({
    subscriptionState: {
      subscriptionStateId: "subscription-state::workspace-1::past_due::workspace-billing-state",
      workspaceId: "workspace-1",
      status: "past_due",
      source: "workspace-billing-state",
      summary: "Workspace subscription is past due (runtime).",
    },
    workspaceBillingState: {
      workspaceId: "workspace-1",
      currentPlanId: "pro",
      subscriptionStatus: "past_due",
      lastBillingEventType: "payment-failure",
      summary: {
        summaryStatus: "partial",
      },
    },
    billingGuardDecision: {
      decision: "blocked",
      primaryFailure: {
        type: "billing",
        reason: "payment-failure-detected",
      },
      recommendedAction: {
        type: "retry-payment",
        reason: "payment-failure-detected",
      },
      summary: {
        summaryStatus: "partial",
        explanation: "Billing enforcement blocked usage due to payment-failure-detected.",
      },
    },
  });

  assert.equal(billingSettingsModel.subscription.status, "past_due");
  assert.equal(billingSettingsModel.subscription.subscriptionStatus, "past_due");
  assert.equal(billingSettingsModel.subscription.lastBillingEventType, "payment-failure");
  assert.deepEqual(billingSettingsModel.subscription.notice, {
    kind: "failure",
    decision: "blocked",
    reason: "payment-failure-detected",
    message: "Billing enforcement blocked usage due to payment-failure-detected.",
  });
  assert.equal(Object.hasOwn(billingSettingsModel, "warnings"), false);
});

test("availableActions contain only real supported actions and explicitly exclude renew", () => {
  const { billingSettingsModel } = createBillingSettingsModel({
    subscriptionState: {
      subscriptionStateId: "subscription-state::workspace-1::past_due::workspace-billing-state",
      workspaceId: "workspace-1",
      status: "past_due",
      source: "workspace-billing-state",
      summary: "Workspace subscription is past due (runtime).",
    },
    workspaceBillingState: {
      workspaceId: "workspace-1",
      currentPlanId: "pro",
      subscriptionStatus: "past_due",
      lastBillingEventType: "payment-failure",
      summary: {
        summaryStatus: "partial",
      },
    },
    billingGuardDecision: {
      decision: "blocked",
      recommendedAction: {
        type: "retry-payment",
        reason: "payment-failure-detected",
      },
      summary: {
        summaryStatus: "partial",
        explanation: "Billing enforcement blocked usage due to payment-failure-detected.",
      },
    },
  });

  assert.deepEqual(
    billingSettingsModel.availableActions.map((action) => action.actionType),
    [
      "create-checkout",
      "change-plan",
      "cancel-subscription",
      "retry-payment",
      "update-payment-method",
      "update-billing-details",
    ],
  );
  assert.equal(
    billingSettingsModel.availableActions.some((action) => action.actionType === "renew"),
    false,
  );
  assert.equal(
    billingSettingsModel.availableActions.find((action) => action.actionType === "change-plan")?.available,
    true,
  );
  assert.equal(
    billingSettingsModel.availableActions.find((action) => action.actionType === "retry-payment")?.available,
    true,
  );
  assert.equal(
    billingSettingsModel.availableActions.find((action) => action.actionType === "retry-payment")?.recommended,
    true,
  );
  assert.equal(
    billingSettingsModel.availableActions.find((action) => action.actionType === "create-checkout")?.available,
    false,
  );
});

test("upgrade prompts stay inside availableActions and do not create a separate top-level section", () => {
  const { billingSettingsModel } = createBillingSettingsModel({
    subscriptionState: {
      subscriptionStateId: "subscription-state::workspace-1::active::workspace-billing-state",
      workspaceId: "workspace-1",
      status: "active",
      source: "workspace-billing-state",
      summary: "Workspace subscription is active (runtime).",
    },
    workspaceBillingState: {
      workspaceId: "workspace-1",
      currentPlanId: "pro",
      subscriptionStatus: "active",
      lastBillingEventType: "checkout",
      summary: {
        summaryStatus: "complete",
      },
    },
    billingGuardDecision: {
      decision: "blocked",
      primaryFailure: {
        type: "entitlement",
        reason: "entitlement-restricted",
      },
      recommendedAction: {
        type: "upgrade-plan",
        reason: "entitlement-restricted",
      },
      summary: {
        summaryStatus: "partial",
        explanation: "Billing enforcement blocked usage due to entitlement-restricted.",
      },
    },
  });

  assert.equal(
    billingSettingsModel.availableActions.find((action) => action.actionType === "change-plan")?.recommended,
    true,
  );
  assert.equal(Object.hasOwn(billingSettingsModel, "upgradePrompts"), false);
});

test("history is derived only from normalized billing events for the active workspace", () => {
  const { billingSettingsModel } = createBillingSettingsModel({
    subscriptionState: {
      subscriptionStateId: "subscription-state::workspace-1::active::workspace-billing-state",
      workspaceId: "workspace-1",
      status: "active",
      source: "workspace-billing-state",
      summary: "Workspace subscription is active (runtime).",
    },
    workspaceBillingState: {
      workspaceId: "workspace-1",
      currentPlanId: "pro",
      subscriptionStatus: "active",
      lastBillingEventType: "checkout",
      summary: {
        summaryStatus: "complete",
      },
    },
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        sourceEventId: "billing-event-1",
        idempotencyKey: "billing-event-1",
        workspaceId: "workspace-1",
      }),
      buildNormalizedBillingEvent({
        sourceEventId: "billing-event-2",
        idempotencyKey: "billing-event-2",
        workspaceId: "workspace-2",
      }),
    ],
  });

  assert.equal(Array.isArray(billingSettingsModel.history), true);
  assert.equal(billingSettingsModel.history.length, 1);
  assert.equal(billingSettingsModel.history[0].workspaceId, "workspace-1");
  assert.equal(Object.hasOwn(billingSettingsModel, "invoices"), false);
});
