import test from "node:test";
import assert from "node:assert/strict";

import { defineBillingPlanSchema } from "../src/core/billing-plan-schema.js";

function buildPlatformCostMetric(overrides = {}) {
  return {
    usageType: "workspace",
    unit: "workspace-minute",
    pricingModel: "per-unit",
    ...overrides,
  };
}

function buildAgentGovernancePolicy(overrides = {}) {
  return {
    spendThresholds: {
      perAction: 5,
      perSession: 25,
      perDay: 100,
      currency: "usd",
    },
    ...overrides,
  };
}

function buildReliabilitySlaModel(overrides = {}) {
  return {
    serviceTier: "standard",
    ...overrides,
  };
}

test("billing plan schema returns minimal canonical billing schema", () => {
  const { billingPlanSchema } = defineBillingPlanSchema({
    platformCostMetric: buildPlatformCostMetric(),
    agentGovernancePolicy: buildAgentGovernancePolicy(),
    reliabilitySlaModel: buildReliabilitySlaModel(),
  });

  assert.equal(typeof billingPlanSchema.billingPlanSchemaId, "string");
  assert.equal(Array.isArray(billingPlanSchema.plans), true);
  assert.equal(billingPlanSchema.plans.length >= 1, true);
  assert.equal(billingPlanSchema.plans[0].planId, "default");
  assert.equal(billingPlanSchema.plans[0].planName, "Default Plan");
  assert.equal(billingPlanSchema.plans[0].pricingModel, "per-unit");
  assert.equal(billingPlanSchema.plans[0].usageBased, true);
  assert.deepEqual(billingPlanSchema.usageDimensions, [
    {
      usageType: "workspace",
      unit: "workspace-minute",
    },
  ]);
  assert.deepEqual(billingPlanSchema.limits, {
    spendThresholds: {
      perAction: 5,
      perSession: 25,
      perDay: 100,
    },
  });
  assert.deepEqual(billingPlanSchema.entitlements, {
    default: {
      features: [],
      limits: {},
    },
  });
  assert.deepEqual(billingPlanSchema.trialRules, {
    default: {
      enabled: false,
      durationDays: null,
    },
  });
});

test("billing plan schema stays valid when inputs are missing", () => {
  const { billingPlanSchema } = defineBillingPlanSchema();

  assert.equal(Array.isArray(billingPlanSchema.plans), true);
  assert.equal(billingPlanSchema.plans.length, 1);
  assert.equal(billingPlanSchema.plans[0].pricingModel, null);
  assert.deepEqual(billingPlanSchema.usageDimensions, [
    {
      usageType: "unknown",
      unit: null,
    },
  ]);
  assert.deepEqual(billingPlanSchema.limits, {
    spendThresholds: {
      perAction: null,
      perSession: null,
      perDay: null,
    },
  });
});

test("billing plan schema does not treat service tier as billing plan", () => {
  const { billingPlanSchema } = defineBillingPlanSchema({
    platformCostMetric: buildPlatformCostMetric(),
    agentGovernancePolicy: buildAgentGovernancePolicy(),
    reliabilitySlaModel: buildReliabilitySlaModel({
      serviceTier: "enterprise",
    }),
  });

  assert.equal(billingPlanSchema.plans[0].planId, "default");
  assert.equal(billingPlanSchema.plans[0].planName, "Default Plan");
  assert.match(billingPlanSchema.billingPlanSchemaId, /enterprise/);
});
