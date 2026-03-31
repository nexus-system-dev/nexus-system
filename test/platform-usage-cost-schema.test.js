import test from "node:test";
import assert from "node:assert/strict";

import { definePlatformUsageCostSchema } from "../src/core/platform-usage-cost-schema.js";

test("platform usage cost schema normalizes every canonical usage type and unit mapping", () => {
  const cases = [
    ["model", "token"],
    ["workspace", "workspace-minute"],
    ["storage", "gb-month"],
    ["build", "build-minute"],
    ["provider-operation", "operation"],
  ];

  for (const [usageType, expectedUnit] of cases) {
    const { platformCostMetric } = definePlatformUsageCostSchema({
      usageEvent: {
        usageType,
        scopeType: "project",
        scopeId: "giftwallet",
        quantity: 2,
        unit: null,
      },
      pricingMetadata: {
        unitPrice: 1.5,
        currency: "USD",
        pricingModel: "per-unit",
      },
    });

    assert.equal(platformCostMetric.usageType, usageType);
    assert.equal(platformCostMetric.unit, expectedUnit);
  }
});

test("platform usage cost schema falls back to unknown usage type and unknown cost unit", () => {
  const { platformCostMetric } = definePlatformUsageCostSchema({
    usageEvent: {
      usageType: "gpu-time",
      scopeType: "workspace",
      scopeId: "workspace-1",
      quantity: 5,
      unit: "mystery",
    },
    pricingMetadata: {
      unitPrice: 3,
      currency: null,
      pricingModel: "weird",
    },
  });

  assert.equal(platformCostMetric.usageType, "unknown-usage-type");
  assert.equal(platformCostMetric.unit, "unknown-cost-unit");
  assert.equal(platformCostMetric.pricingModel, "per-unit");
  assert.equal(platformCostMetric.currency, "usd");
});

test("platform usage cost schema computes totalCost deterministically", () => {
  const { platformCostMetric } = definePlatformUsageCostSchema({
    usageEvent: {
      usageType: "build",
      scopeType: "project",
      scopeId: "giftwallet",
      quantity: 10,
      unit: null,
    },
    pricingMetadata: {
      unitPrice: 0.5,
      currency: "usd",
      pricingModel: "fixed",
    },
  });

  assert.equal(platformCostMetric.totalCost, 5);
});

test("platform usage cost schema keeps totalCost at zero when quantity is zero", () => {
  const { platformCostMetric } = definePlatformUsageCostSchema({
    usageEvent: {
      usageType: "model",
      scopeType: "project",
      scopeId: "giftwallet",
      quantity: 0,
      unit: null,
    },
    pricingMetadata: {
      unitPrice: 0.002,
      currency: "usd",
      pricingModel: "tiered",
    },
  });

  assert.equal(platformCostMetric.totalCost, 0);
});

test("platform usage cost schema returns null totalCost when quantity or unit price is missing", () => {
  const { platformCostMetric } = definePlatformUsageCostSchema({
    usageEvent: {
      usageType: "storage",
      scopeType: "project",
      scopeId: "giftwallet",
      quantity: null,
      unit: null,
    },
    pricingMetadata: {
      unitPrice: 2,
      currency: "usd",
      pricingModel: "per-unit",
    },
  });

  assert.equal(platformCostMetric.totalCost, null);
});

test("platform usage cost schema uses recordedAt precedence and defaults", () => {
  const { platformCostMetric: fromRecordedAt } = definePlatformUsageCostSchema({
    usageEvent: {
      usageType: "workspace",
      scopeType: "workspace",
      scopeId: "workspace-1",
      quantity: 1,
      recordedAt: "2025-01-01T00:00:00.000Z",
    },
    pricingMetadata: {},
  });
  const { platformCostMetric: fromTimestamp } = definePlatformUsageCostSchema({
    usageEvent: {
      usageType: "workspace",
      scopeType: "workspace",
      scopeId: "workspace-1",
      quantity: 1,
      timestamp: "2025-01-02T00:00:00.000Z",
    },
    pricingMetadata: {},
  });
  const { platformCostMetric: fallbackNow } = definePlatformUsageCostSchema();

  assert.equal(fromRecordedAt.recordedAt, "2025-01-01T00:00:00.000Z");
  assert.equal(fromTimestamp.recordedAt, "2025-01-02T00:00:00.000Z");
  assert.equal(typeof fallbackNow.recordedAt, "string");
});
