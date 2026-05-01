import test from "node:test";
import assert from "node:assert/strict";

import { resolveEntitlementDecision } from "../src/core/entitlement-decision-resolver.js";

function buildBillingPlanSchema(overrides = {}) {
  return {
    billingPlanSchemaId: "billing-plan-schema:workspace:standard",
    plans: [
      {
        planId: "default",
        planName: "Default Plan",
        pricingModel: "per-unit",
        usageBased: true,
      },
    ],
    usageDimensions: [
      {
        usageType: "workspace",
        unit: "workspace-minute",
      },
    ],
    limits: {
      spendThresholds: {
        perAction: 5,
        perSession: 25,
        perDay: 100,
      },
    },
    entitlements: {
      default: {
        features: ["trial-workspace-access"],
        limits: {},
      },
      pro: {
        features: ["workspace-access", "priority-support"],
        limits: {},
      },
      enterprise: {
        features: ["workspace-access", "priority-support", "sso"],
        limits: {},
      },
    },
    trialRules: {
      default: {
        enabled: false,
        durationDays: null,
      },
    },
    ...overrides,
  };
}

test("entitlement decision resolver returns blocked when billing plan schema is missing", () => {
  const { entitlementDecision } = resolveEntitlementDecision({
    billingPlanSchema: null,
    workspaceModel: null,
  });

  assert.equal(entitlementDecision.decision, "blocked");
  assert.equal(entitlementDecision.source, "fallback-default");
  assert.deepEqual(entitlementDecision.features, []);
  assert.deepEqual(entitlementDecision.limits, {});
});

test("entitlement decision resolver returns restricted when features are empty", () => {
  const { entitlementDecision } = resolveEntitlementDecision({
    billingPlanSchema: buildBillingPlanSchema({
      entitlements: {
        default: {
          features: [],
          limits: {},
        },
      },
    }),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(entitlementDecision.decision, "restricted");
  assert.equal(entitlementDecision.source, "billing-plan-default");
  assert.equal(entitlementDecision.summary, "No features available under default billing plan.");
});

test("entitlement decision resolver returns restricted when limits are missing", () => {
  const { entitlementDecision } = resolveEntitlementDecision({
    billingPlanSchema: buildBillingPlanSchema({
      limits: {},
    }),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(entitlementDecision.decision, "restricted");
  assert.deepEqual(entitlementDecision.features, ["trial-workspace-access"]);
  assert.deepEqual(entitlementDecision.limits, {});
});

test("entitlement decision resolver returns allowed when features and limits exist", () => {
  const { entitlementDecision } = resolveEntitlementDecision({
    billingPlanSchema: buildBillingPlanSchema(),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
    workspaceBillingState: {
      workspaceId: "workspace-1",
      currentPlanId: "pro",
      subscriptionStatus: "active",
    },
  });

  assert.equal(entitlementDecision.decision, "allowed");
  assert.equal(entitlementDecision.source, "workspace-billing-state");
  assert.deepEqual(entitlementDecision.features, ["workspace-access", "priority-support"]);
  assert.deepEqual(entitlementDecision.limits, {
    spendThresholds: {
      perAction: 5,
      perSession: 25,
      perDay: 100,
    },
  });
});

test("entitlement decision resolver uses current plan runtime for upgrade and downgrade transitions", () => {
  const upgrade = resolveEntitlementDecision({
    billingPlanSchema: buildBillingPlanSchema(),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
    workspaceBillingState: {
      workspaceId: "workspace-1",
      currentPlanId: "enterprise",
      subscriptionStatus: "active",
    },
  }).entitlementDecision;
  const downgrade = resolveEntitlementDecision({
    billingPlanSchema: buildBillingPlanSchema(),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
    workspaceBillingState: {
      workspaceId: "workspace-1",
      currentPlanId: "pro",
      subscriptionStatus: "active",
    },
  }).entitlementDecision;

  assert.deepEqual(upgrade.features, ["workspace-access", "priority-support", "sso"]);
  assert.deepEqual(downgrade.features, ["workspace-access", "priority-support"]);
});

test("entitlement decision resolver falls back to default entitlements after cancel removes current plan", () => {
  const { entitlementDecision } = resolveEntitlementDecision({
    billingPlanSchema: buildBillingPlanSchema(),
    workspaceModel: {
      workspaceId: "workspace-1",
    },
    workspaceBillingState: {
      workspaceId: "workspace-1",
      currentPlanId: null,
      subscriptionStatus: "canceled",
    },
  });

  assert.equal(entitlementDecision.source, "billing-plan-default");
  assert.deepEqual(entitlementDecision.features, ["trial-workspace-access"]);
  assert.equal(entitlementDecision.decision, "allowed");
});
