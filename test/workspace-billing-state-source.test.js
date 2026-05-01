import test from "node:test";
import assert from "node:assert/strict";

import { createNormalizedBillingEvent } from "../src/core/billing-event-normalizer.js";
import { createWorkspaceBillingStateSource } from "../src/core/workspace-billing-state-source.js";

function buildWorkspaceModel(overrides = {}) {
  return {
    workspaceId: "workspace-1",
    ...overrides,
  };
}

function buildBillingPlanSchema(overrides = {}) {
  return {
    trialRules: {
      default: {
        enabled: false,
      },
    },
    ...overrides,
  };
}

function buildNormalizedBillingEvent(overrides = {}) {
  const { normalizedBillingEvent } = createNormalizedBillingEvent({
    billingEvent: {
      eventType: "checkout",
      workspaceId: "workspace-1",
      userId: "user-1",
      amount: 49,
      currency: "usd",
      sourceProvider: "stripe",
      sourceEventId: "evt-1",
      idempotencyKey: "billing:evt-1",
      occurredAt: "2026-04-09T10:00:00.000Z",
      ...overrides,
    },
  });

  return normalizedBillingEvent;
}

test("no workspaceModel returns missing-inputs canonical state", () => {
  const { workspaceBillingState } = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [buildNormalizedBillingEvent()],
    workspaceModel: null,
  });

  assert.deepEqual(workspaceBillingState, {
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
});

test("workspace filtering excludes invalid and cross-workspace events", () => {
  const { workspaceBillingState } = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      null,
      buildNormalizedBillingEvent({
        workspaceId: "workspace-2",
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
      }),
      buildNormalizedBillingEvent({
        sourceEventId: "evt-3",
        idempotencyKey: "billing:evt-3",
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
  });

  assert.equal(workspaceBillingState.source.eventCount, 1);
  assert.equal(workspaceBillingState.workspaceId, "workspace-1");
});

test("lastBillingEventType always follows the latest matching event by time and index", () => {
  const { workspaceBillingState } = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        eventType: "cancel",
        amount: 0,
        sourceEventId: "evt-1",
        idempotencyKey: "billing:evt-1",
        occurredAt: "2026-04-09T10:00:00.000Z",
      }),
      buildNormalizedBillingEvent({
        eventType: "retry",
        amount: 0,
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
        occurredAt: "2026-04-09T11:00:00.000Z",
      }),
      buildNormalizedBillingEvent({
        eventType: "plan-change",
        amount: 0,
        sourceEventId: "evt-3",
        idempotencyKey: "billing:evt-3",
        occurredAt: "2026-04-09T11:00:00.000Z",
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  });

  assert.equal(workspaceBillingState.lastBillingEventType, "plan-change");
});

test("checkout activates subscription and applies usable planId", () => {
  const { workspaceBillingState } = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        planId: "pro",
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  });

  assert.equal(workspaceBillingState.subscriptionStatus, "active");
  assert.equal(workspaceBillingState.currentPlanId, "pro");
  assert.equal(workspaceBillingState.summary.summaryStatus, "complete");
});

test("renewal activates subscription and overrides plan with usable planId", () => {
  const { workspaceBillingState } = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        planId: "starter",
      }),
      buildNormalizedBillingEvent({
        eventType: "renewal",
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
        occurredAt: "2026-04-09T11:00:00.000Z",
        planId: "pro",
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  });

  assert.equal(workspaceBillingState.subscriptionStatus, "active");
  assert.equal(workspaceBillingState.currentPlanId, "pro");
});

test("payment-failure sets past_due and leaves plan unchanged", () => {
  const { workspaceBillingState } = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        planId: "pro",
      }),
      buildNormalizedBillingEvent({
        eventType: "payment-failure",
        amount: 0,
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
        occurredAt: "2026-04-09T11:00:00.000Z",
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  });

  assert.equal(workspaceBillingState.subscriptionStatus, "past_due");
  assert.equal(workspaceBillingState.currentPlanId, "pro");
});

test("retry is trace-only and does not recover past_due", () => {
  const { workspaceBillingState } = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        planId: "pro",
      }),
      buildNormalizedBillingEvent({
        eventType: "payment-failure",
        amount: 0,
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
        occurredAt: "2026-04-09T11:00:00.000Z",
      }),
      buildNormalizedBillingEvent({
        eventType: "retry",
        amount: 0,
        sourceEventId: "evt-3",
        idempotencyKey: "billing:evt-3",
        occurredAt: "2026-04-09T12:00:00.000Z",
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  });

  assert.equal(workspaceBillingState.subscriptionStatus, "past_due");
  assert.equal(workspaceBillingState.lastBillingEventType, "retry");
});

test("cancel sets canceled and retry after cancel does not change it", () => {
  const { workspaceBillingState } = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        planId: "pro",
      }),
      buildNormalizedBillingEvent({
        eventType: "cancel",
        amount: 0,
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
        occurredAt: "2026-04-09T11:00:00.000Z",
      }),
      buildNormalizedBillingEvent({
        eventType: "retry",
        amount: 0,
        sourceEventId: "evt-3",
        idempotencyKey: "billing:evt-3",
        occurredAt: "2026-04-09T12:00:00.000Z",
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  });

  assert.equal(workspaceBillingState.subscriptionStatus, "canceled");
  assert.equal(workspaceBillingState.currentPlanId, "pro");
  assert.equal(workspaceBillingState.lastBillingEventType, "retry");
});

test("renewal after failure or cancel restores active", () => {
  const afterFailure = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        planId: "pro",
      }),
      buildNormalizedBillingEvent({
        eventType: "payment-failure",
        amount: 0,
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
        occurredAt: "2026-04-09T11:00:00.000Z",
      }),
      buildNormalizedBillingEvent({
        eventType: "renewal",
        sourceEventId: "evt-3",
        idempotencyKey: "billing:evt-3",
        occurredAt: "2026-04-09T12:00:00.000Z",
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  }).workspaceBillingState;

  const afterCancel = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        planId: "pro",
      }),
      buildNormalizedBillingEvent({
        eventType: "cancel",
        amount: 0,
        sourceEventId: "evt-4",
        idempotencyKey: "billing:evt-4",
        occurredAt: "2026-04-09T11:00:00.000Z",
      }),
      buildNormalizedBillingEvent({
        eventType: "renewal",
        sourceEventId: "evt-5",
        idempotencyKey: "billing:evt-5",
        occurredAt: "2026-04-09T12:00:00.000Z",
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  }).workspaceBillingState;

  assert.equal(afterFailure.subscriptionStatus, "active");
  assert.equal(afterCancel.subscriptionStatus, "active");
});

test("plan-change updates plan without changing canceled status", () => {
  const { workspaceBillingState } = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        planId: "starter",
      }),
      buildNormalizedBillingEvent({
        eventType: "cancel",
        amount: 0,
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
        occurredAt: "2026-04-09T11:00:00.000Z",
      }),
      buildNormalizedBillingEvent({
        eventType: "plan-change",
        amount: 0,
        sourceEventId: "evt-3",
        idempotencyKey: "billing:evt-3",
        occurredAt: "2026-04-09T12:00:00.000Z",
        planId: "pro",
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  });

  assert.equal(workspaceBillingState.subscriptionStatus, "canceled");
  assert.equal(workspaceBillingState.currentPlanId, "pro");
});

test("subscription-state updates status and plan independently", () => {
  const valid = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        eventType: "subscription-state",
        amount: 0,
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
        subscriptionStatus: "past_due",
        currentPlanId: "enterprise",
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  }).workspaceBillingState;

  const partial = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        planId: "starter",
      }),
      buildNormalizedBillingEvent({
        eventType: "subscription-state",
        amount: 0,
        sourceEventId: "evt-3",
        idempotencyKey: "billing:evt-3",
        occurredAt: "2026-04-09T11:00:00.000Z",
        subscriptionStatus: "invalid-status",
        currentPlanId: "enterprise",
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  }).workspaceBillingState;

  assert.equal(valid.subscriptionStatus, "past_due");
  assert.equal(valid.currentPlanId, "enterprise");
  assert.equal(partial.subscriptionStatus, "active");
  assert.equal(partial.currentPlanId, "enterprise");
});

test("conflicting planId and currentPlanId does not update plan and forces partial", () => {
  const { workspaceBillingState } = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        planId: "starter",
      }),
      buildNormalizedBillingEvent({
        eventType: "subscription-state",
        amount: 0,
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
        occurredAt: "2026-04-09T11:00:00.000Z",
        planId: "pro",
        currentPlanId: "enterprise",
        subscriptionStatus: "active",
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  });

  assert.equal(workspaceBillingState.currentPlanId, "starter");
  assert.equal(workspaceBillingState.subscriptionStatus, "active");
  assert.equal(workspaceBillingState.summary.summaryStatus, "partial");
});

test("trial fallback applies only when no effective status event exists and trial is enabled", () => {
  const fallbackState = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema({
      trialRules: {
        default: {
          enabled: true,
        },
      },
    }),
  }).workspaceBillingState;

  const noFallbackAfterRetry = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        eventType: "retry",
        amount: 0,
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema({
      trialRules: {
        default: {
          enabled: true,
        },
      },
    }),
  }).workspaceBillingState;

  assert.equal(fallbackState.subscriptionStatus, "trial");
  assert.equal(fallbackState.currentPlanId, null);
  assert.equal(fallbackState.summary.summaryStatus, "partial");
  assert.equal(noFallbackAfterRetry.subscriptionStatus, "trial");
});

test("missing inputs summary requires no matching events and no trial fallback", () => {
  const { workspaceBillingState } = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  });

  assert.equal(workspaceBillingState.summary.summaryStatus, "missing-inputs");
  assert.equal(workspaceBillingState.subscriptionStatus, null);
});

test("partial summary when state is buildable but missing one field", () => {
  const { workspaceBillingState } = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        eventType: "payment-failure",
        amount: 0,
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  });

  assert.equal(workspaceBillingState.subscriptionStatus, "past_due");
  assert.equal(workspaceBillingState.currentPlanId, null);
  assert.equal(workspaceBillingState.summary.summaryStatus, "partial");
});

test("workspaceBillingStateId remains deterministic and exact", () => {
  const { workspaceBillingState } = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        eventType: "subscription-state",
        amount: 0,
        subscriptionStatus: "active",
        currentPlanId: "pro",
      }),
    ],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  });

  assert.equal(
    workspaceBillingState.workspaceBillingStateId,
    "workspace-billing-state::workspace-1::complete::subscription-state::1",
  );
});

test("workspaceBillingState exposes no extra fields", () => {
  const { workspaceBillingState } = createWorkspaceBillingStateSource({
    normalizedBillingEvents: [buildNormalizedBillingEvent({ planId: "pro" })],
    workspaceModel: buildWorkspaceModel(),
    billingPlanSchema: buildBillingPlanSchema(),
  });

  assert.deepEqual(Object.keys(workspaceBillingState), [
    "workspaceBillingStateId",
    "workspaceId",
    "currentPlanId",
    "subscriptionStatus",
    "lastBillingEventType",
    "source",
    "summary",
  ]);
  assert.deepEqual(Object.keys(workspaceBillingState.source), [
    "hasBillingEvents",
    "eventCount",
  ]);
  assert.deepEqual(Object.keys(workspaceBillingState.summary), [
    "summaryStatus",
  ]);
});
