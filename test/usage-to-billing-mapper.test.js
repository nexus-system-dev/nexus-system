import test from "node:test";
import assert from "node:assert/strict";

import { createUsageToBillingMapper } from "../src/core/usage-to-billing-mapper.js";

function buildCostSummary(overrides = {}) {
  return {
    breakdown: {
      model: {
        quantity: 100,
        unit: "token",
        totalCost: 1,
      },
      workspace: {
        quantity: 2,
        unit: "workspace-minute",
        totalCost: 3,
      },
      build: {
        quantity: 4,
        unit: "build-minute",
        totalCost: 5,
      },
      providerOperation: {
        quantity: 1,
        unit: "operation",
        totalCost: 2,
      },
      storage: {
        quantity: 6,
        unit: "gb-month",
        totalCost: 4,
      },
    },
    totalEstimatedCost: 999,
    currency: "usd",
    ...overrides,
  };
}

test("missing costSummary returns missing-inputs", () => {
  const { billableUsage } = createUsageToBillingMapper();

  assert.deepEqual(billableUsage, {
    billableUsageId: "billable-usage::missing-inputs::0::0",
    items: [],
    summary: {
      summaryStatus: "missing-inputs",
      mappedItems: 0,
      unknownItems: 0,
    },
  });
});

test("missing breakdown returns missing-inputs", () => {
  const { billableUsage } = createUsageToBillingMapper({
    costSummary: {},
  });

  assert.equal(billableUsage.summary.summaryStatus, "missing-inputs");
  assert.deepEqual(billableUsage.items, []);
});

test("unusable breakdown returns missing-inputs", () => {
  const { billableUsage } = createUsageToBillingMapper({
    costSummary: {
      breakdown: {
        model: null,
        workspace: "nope",
      },
    },
  });

  assert.equal(billableUsage.summary.summaryStatus, "missing-inputs");
  assert.deepEqual(billableUsage.items, []);
});

test("model maps to ai/token", () => {
  const { billableUsage } = createUsageToBillingMapper({
    costSummary: {
      breakdown: {
        model: {
          quantity: 100,
          unit: "token",
        },
      },
    },
  });

  assert.deepEqual(billableUsage.items[0], {
    dimension: "ai",
    unit: "token",
    quantity: 100,
    sourceDimension: "model",
  });
});

test("workspace maps to workspace/workspace-minute", () => {
  const { billableUsage } = createUsageToBillingMapper({
    costSummary: {
      breakdown: {
        workspace: {
          quantity: 2,
          unit: "workspace-minute",
        },
      },
    },
  });

  assert.deepEqual(billableUsage.items[0], {
    dimension: "workspace",
    unit: "workspace-minute",
    quantity: 2,
    sourceDimension: "workspace",
  });
});

test("build maps to build/build-minute", () => {
  const { billableUsage } = createUsageToBillingMapper({
    costSummary: {
      breakdown: {
        build: {
          quantity: 4,
          unit: "build-minute",
        },
      },
    },
  });

  assert.deepEqual(billableUsage.items[0], {
    dimension: "build",
    unit: "build-minute",
    quantity: 4,
    sourceDimension: "build",
  });
});

test("providerOperation maps to providerOperation/operation", () => {
  const { billableUsage } = createUsageToBillingMapper({
    costSummary: {
      breakdown: {
        providerOperation: {
          quantity: 1,
          unit: "operation",
        },
      },
    },
  });

  assert.deepEqual(billableUsage.items[0], {
    dimension: "providerOperation",
    unit: "operation",
    quantity: 1,
    sourceDimension: "providerOperation",
  });
});

test("storage maps to unknown", () => {
  const { billableUsage } = createUsageToBillingMapper({
    costSummary: {
      breakdown: {
        storage: {
          quantity: 6,
          unit: "gb-month",
        },
      },
    },
  });

  assert.deepEqual(billableUsage.items[0], {
    dimension: "unknown",
    unit: "gb-month",
    quantity: 6,
    sourceDimension: "storage",
  });
});

test("recognized dimension with unexpected unit maps to unknown", () => {
  const { billableUsage } = createUsageToBillingMapper({
    costSummary: {
      breakdown: {
        model: {
          quantity: 100,
          unit: "request",
        },
      },
    },
  });

  assert.deepEqual(billableUsage.items[0], {
    dimension: "unknown",
    unit: "request",
    quantity: 100,
    sourceDimension: "model",
  });
});

test("quantity zero is valid", () => {
  const { billableUsage } = createUsageToBillingMapper({
    costSummary: {
      breakdown: {
        build: {
          quantity: 0,
          unit: "build-minute",
        },
      },
    },
  });

  assert.equal(billableUsage.summary.summaryStatus, "complete");
  assert.equal(billableUsage.items[0].quantity, 0);
});

test("missing or unusable quantity produces no item", () => {
  const { billableUsage } = createUsageToBillingMapper({
    costSummary: {
      breakdown: {
        model: {
          quantity: null,
          unit: "token",
        },
        workspace: {
          quantity: "2",
          unit: "workspace-minute",
        },
      },
    },
  });

  assert.deepEqual(billableUsage.items, []);
  assert.equal(billableUsage.summary.summaryStatus, "missing-inputs");
});

test("unknown with missing quantity produces no item", () => {
  const { billableUsage } = createUsageToBillingMapper({
    costSummary: {
      breakdown: {
        storage: {
          quantity: null,
          unit: "gb-month",
        },
      },
    },
  });

  assert.deepEqual(billableUsage.items, []);
});

test("item order is deterministic and exact", () => {
  const { billableUsage } = createUsageToBillingMapper({
    costSummary: buildCostSummary({
      breakdown: {
        storage: {
          quantity: 6,
          unit: "gb-month",
        },
        providerOperation: {
          quantity: 1,
          unit: "operation",
        },
        build: {
          quantity: 4,
          unit: "build-minute",
        },
        workspace: {
          quantity: 2,
          unit: "workspace-minute",
        },
        model: {
          quantity: 100,
          unit: "token",
        },
        customDimension: {
          quantity: 7,
          unit: "seat",
        },
      },
    }),
  });

  assert.deepEqual(
    billableUsage.items.map((item) => `${item.dimension}:${item.sourceDimension}`),
    [
      "ai:model",
      "workspace:workspace",
      "build:build",
      "providerOperation:providerOperation",
      "unknown:storage",
      "unknown:customDimension",
    ],
  );
});

test("summary counts are correct", () => {
  const { billableUsage } = createUsageToBillingMapper({
    costSummary: buildCostSummary({
      breakdown: {
        model: {
          quantity: 100,
          unit: "token",
        },
        storage: {
          quantity: 6,
          unit: "gb-month",
        },
        build: {
          quantity: null,
          unit: "build-minute",
        },
      },
    }),
  });

  assert.deepEqual(billableUsage.summary, {
    summaryStatus: "complete",
    mappedItems: 1,
    unknownItems: 1,
  });
});

test("billableUsageId format is exact", () => {
  const { billableUsage } = createUsageToBillingMapper({
    costSummary: {
      breakdown: {
        model: {
          quantity: 100,
          unit: "token",
        },
        storage: {
          quantity: 6,
          unit: "gb-month",
        },
      },
    },
  });

  assert.equal(billableUsage.billableUsageId, "billable-usage::complete::1::1");
});

test("billingPlanSchema does not affect output in v1", () => {
  const costSummary = {
    breakdown: {
      model: {
        quantity: 100,
        unit: "token",
      },
    },
  };

  const firstResult = createUsageToBillingMapper({
    costSummary,
    billingPlanSchema: null,
  });
  const secondResult = createUsageToBillingMapper({
    costSummary,
    billingPlanSchema: {
      plans: [{ planId: "enterprise" }],
      usageDimensions: [{ usageType: "provider-operation", unit: "operation" }],
    },
  });

  assert.deepEqual(firstResult, secondResult);
});

test("no raw costSummary passthrough occurs", () => {
  const { billableUsage } = createUsageToBillingMapper({
    costSummary: buildCostSummary(),
  });

  assert.equal("costSummaryId" in billableUsage, false);
  assert.equal("totalEstimatedCost" in billableUsage, false);
  assert.equal("currency" in billableUsage, false);
  assert.equal("breakdown" in billableUsage, false);
});
