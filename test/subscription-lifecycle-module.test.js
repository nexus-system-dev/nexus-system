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

test("subscription lifecycle returns trial when billing schema trial is enabled", () => {
  const { subscriptionState } = createSubscriptionLifecycle({
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

  assert.equal(subscriptionState.workspaceId, "workspace-1");
  assert.equal(subscriptionState.status, "trial");
  assert.equal(subscriptionState.source, "billing-plan-schema");
  assert.equal(subscriptionState.summary, "Workspace is currently in trial period");
});

test("subscription lifecycle returns active when trial is disabled", () => {
  const { subscriptionState } = createSubscriptionLifecycle({
    billingPlanSchema: buildBillingPlanSchema(),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(subscriptionState.status, "active");
  assert.equal(subscriptionState.source, "billing-plan-schema");
  assert.equal(subscriptionState.summary, "Workspace is active with no trial");
});

test("subscription lifecycle falls back to active when billing schema is missing", () => {
  const { subscriptionState } = createSubscriptionLifecycle({
    billingPlanSchema: null,
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(subscriptionState.status, "active");
  assert.equal(subscriptionState.source, "fallback-default");
  assert.equal(subscriptionState.summary, "Billing schema missing, defaulting to active");
});

test("subscription lifecycle returns a valid object when workspace model is missing", () => {
  const { subscriptionState } = createSubscriptionLifecycle({
    billingPlanSchema: buildBillingPlanSchema(),
    workspaceModel: null,
  });

  assert.equal(typeof subscriptionState.subscriptionStateId, "string");
  assert.equal(subscriptionState.workspaceId, null);
  assert.equal(subscriptionState.status, "active");
});
