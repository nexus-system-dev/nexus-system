import test from "node:test";
import assert from "node:assert/strict";

import { createSubscriptionLifecycle } from "../src/core/subscription-lifecycle-module.js";

function buildBillingPlanSchema(overrides = {}) {
  return {
    billingPlanSchemaId: "billing-plan-schema:workspace:standard",
    trialRules: {
      default: {
        enabled: false,
        durationDays: null,
      },
    },
    ...overrides,
  };
}

test("subscription lifecycle returns runtime trial when runtime status is valid", () => {
  const { subscriptionState } = createSubscriptionLifecycle({
    workspaceBillingState: {
      summary: {
        summaryStatus: "partial",
      },
      subscriptionStatus: "trial",
    },
    billingPlanSchema: buildBillingPlanSchema({
      trialRules: {
        default: {
          enabled: false,
          durationDays: 14,
        },
      },
    }),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(subscriptionState.workspaceId, "workspace-1");
  assert.equal(subscriptionState.status, "trial");
  assert.equal(subscriptionState.source, "workspace-billing-state");
  assert.equal(subscriptionState.subscriptionStateId, "subscription-state::workspace-1::trial::workspace-billing-state");
  assert.equal(subscriptionState.summary, "Workspace is in trial period (runtime).");
});

test("subscription lifecycle returns runtime active when runtime status is valid", () => {
  const { subscriptionState } = createSubscriptionLifecycle({
    workspaceBillingState: {
      subscriptionStatus: "active",
      currentPlanId: "pro",
    },
    billingPlanSchema: buildBillingPlanSchema(),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(subscriptionState.status, "active");
  assert.equal(subscriptionState.source, "workspace-billing-state");
  assert.equal(subscriptionState.subscriptionStateId, "subscription-state::workspace-1::active::workspace-billing-state");
  assert.equal(subscriptionState.summary, "Workspace subscription is active (runtime).");
});

test("subscription lifecycle returns runtime past_due when runtime status is valid", () => {
  const { subscriptionState } = createSubscriptionLifecycle({
    workspaceBillingState: {
      subscriptionStatus: "past_due",
    },
    billingPlanSchema: buildBillingPlanSchema(),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(subscriptionState.status, "past_due");
  assert.equal(subscriptionState.source, "workspace-billing-state");
  assert.equal(subscriptionState.summary, "Workspace subscription is past due (runtime).");
});

test("subscription lifecycle returns runtime canceled when runtime status is valid", () => {
  const { subscriptionState } = createSubscriptionLifecycle({
    workspaceBillingState: {
      subscriptionStatus: "canceled",
    },
    billingPlanSchema: buildBillingPlanSchema(),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(subscriptionState.status, "canceled");
  assert.equal(subscriptionState.source, "workspace-billing-state");
  assert.equal(subscriptionState.summary, "Workspace subscription is canceled (runtime).");
});

test("subscription lifecycle uses runtime status even when workspace billing summary is partial", () => {
  const { subscriptionState } = createSubscriptionLifecycle({
    workspaceBillingState: {
      summary: {
        summaryStatus: "partial",
      },
      subscriptionStatus: "active",
    },
    billingPlanSchema: buildBillingPlanSchema({
      trialRules: {
        default: {
          enabled: true,
          durationDays: 14,
        },
      },
    }),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(subscriptionState.status, "active");
  assert.equal(subscriptionState.source, "workspace-billing-state");
});

test("subscription lifecycle falls back to schema trial when runtime status is missing", () => {
  const { subscriptionState } = createSubscriptionLifecycle({
    workspaceBillingState: {
      lastBillingEventType: "cancel",
      subscriptionStatus: null,
    },
    billingPlanSchema: buildBillingPlanSchema({
      trialRules: {
        default: {
          enabled: true,
          durationDays: 14,
        },
      },
    }),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(subscriptionState.source, "billing-plan-schema");
  assert.equal(subscriptionState.status, "trial");
  assert.equal(subscriptionState.summary, "Workspace is in trial period (schema fallback).");
});

test("subscription lifecycle falls back to active when runtime status is missing and schema trial is disabled", () => {
  const { subscriptionState } = createSubscriptionLifecycle({
    workspaceBillingState: {
      subscriptionStatus: null,
    },
    billingPlanSchema: buildBillingPlanSchema(),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(subscriptionState.status, "active");
  assert.equal(subscriptionState.source, "fallback-default");
  assert.equal(subscriptionState.summary, "Workspace subscription is active (default fallback; runtime evidence present but status unavailable).");
});

test("subscription lifecycle falls back to active when no runtime state and no schema trial", () => {
  const { subscriptionState } = createSubscriptionLifecycle({
    billingPlanSchema: null,
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(subscriptionState.status, "active");
  assert.equal(subscriptionState.source, "fallback-default");
  assert.equal(subscriptionState.summary, "Workspace subscription is active (default fallback).");
});

test("subscription lifecycle does not use lastBillingEventType as status source", () => {
  const { subscriptionState } = createSubscriptionLifecycle({
    workspaceBillingState: {
      lastBillingEventType: "cancel",
      subscriptionStatus: "not-supported",
    },
    billingPlanSchema: buildBillingPlanSchema(),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(subscriptionState.status, "active");
  assert.equal(subscriptionState.source, "fallback-default");
});

test("subscription lifecycle keeps deterministic subscriptionStateId", () => {
  const { subscriptionState } = createSubscriptionLifecycle({
    workspaceBillingState: {
      subscriptionStatus: "past_due",
    },
    billingPlanSchema: buildBillingPlanSchema(),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(subscriptionState.subscriptionStateId, "subscription-state::workspace-1::past_due::workspace-billing-state");
});

test("subscription lifecycle returns a valid object when workspace model is missing", () => {
  const { subscriptionState } = createSubscriptionLifecycle({
    workspaceBillingState: {
      subscriptionStatus: "active",
    },
    billingPlanSchema: buildBillingPlanSchema(),
    workspaceModel: null,
  });

  assert.equal(typeof subscriptionState.subscriptionStateId, "string");
  assert.equal(subscriptionState.workspaceId, null);
  assert.equal(subscriptionState.status, "active");
  assert.equal(subscriptionState.source, "workspace-billing-state");
  assert.equal(subscriptionState.subscriptionStateId, "subscription-state::null::active::workspace-billing-state");
});
