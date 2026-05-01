import test from "node:test";
import assert from "node:assert/strict";

import { createReasonableUsagePolicyResolver } from "../src/core/reasonable-usage-policy-resolver.js";

function buildWorkspaceMode(type = "user-only") {
  return { type };
}

function buildWorkspaceModeDefinitions(overrides = {}) {
  return {
    "user-only": {
      actor: "user",
      aiUsageLevel: "none",
      expectedCostProfile: "low",
      enforcementLevel: "lenient",
    },
    hybrid: {
      actor: "user+system",
      aiUsageLevel: "medium",
      expectedCostProfile: "medium",
      enforcementLevel: "balanced",
    },
    autonomous: {
      actor: "system",
      aiUsageLevel: "high",
      expectedCostProfile: "high",
      enforcementLevel: "strict",
    },
    ...overrides,
  };
}

function buildBillingPlanSchema(overrides = {}) {
  return {
    limits: {
      spendThresholds: {
        perAction: 5,
        perSession: 25,
        perDay: 100,
      },
    },
    ...overrides,
  };
}

function buildCostSummary(overrides = {}) {
  return {
    currency: "usd",
    currencyMismatch: false,
    summary: {
      summaryStatus: "complete",
    },
    ...overrides,
  };
}

test("reasonable usage resolver returns the exact top-level contract shape", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("user-only"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: { items: [] },
    costSummary: buildCostSummary(),
  });

  assert.deepEqual(Object.keys(reasonableUsagePolicy), [
    "policyId",
    "workspaceMode",
    "threshold",
    "enforcement",
    "summary",
  ]);
  assert.deepEqual(Object.keys(reasonableUsagePolicy.threshold), [
    "type",
    "amount",
    "currency",
    "source",
  ]);
  assert.deepEqual(Object.keys(reasonableUsagePolicy.enforcement), [
    "enforcementLevel",
    "withinLimitAction",
    "approachingLimitAction",
    "overLimitAction",
  ]);
  assert.deepEqual(Object.keys(reasonableUsagePolicy.summary), [
    "summaryStatus",
    "explanation",
  ]);
});

test("policyId format is correct for per-session policy", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("hybrid"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary(),
  });

  assert.equal(reasonableUsagePolicy.policyId, "reasonable-usage-policy::hybrid::per-session");
});

test("workspaceMode is copied correctly", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("autonomous"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary(),
  });

  assert.equal(reasonableUsagePolicy.workspaceMode, "autonomous");
});

test("threshold type resolves to per-session by default", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("user-only"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary(),
  });

  assert.equal(reasonableUsagePolicy.threshold.type, "per-session");
  assert.equal(reasonableUsagePolicy.threshold.amount, 25);
});

test("threshold falls back to per-action when perSession is missing", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("user-only"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema({
      limits: {
        spendThresholds: {
          perAction: 5,
          perDay: 100,
        },
      },
    }),
    billableUsage: {},
    costSummary: buildCostSummary(),
  });

  assert.equal(reasonableUsagePolicy.threshold.type, "per-action");
  assert.equal(reasonableUsagePolicy.threshold.amount, 5);
  assert.equal(reasonableUsagePolicy.summary.summaryStatus, "partial");
});

test("resolver does not use perDay as default in v1", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("user-only"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema({
      limits: {
        spendThresholds: {
          perDay: 100,
        },
      },
    }),
    billableUsage: {},
    costSummary: buildCostSummary(),
  });

  assert.equal(reasonableUsagePolicy.threshold.type, null);
  assert.equal(reasonableUsagePolicy.policyId, "reasonable-usage-policy::user-only::missing-threshold");
});

test("threshold source is exactly billing-plan-schema", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("hybrid"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary(),
  });

  assert.equal(reasonableUsagePolicy.threshold.source, "billing-plan-schema");
});

test("threshold currency comes only from usable costSummary currency", () => {
  const completePolicy = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("hybrid"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary({ currency: "eur" }),
  });
  const missingCurrencyPolicy = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("hybrid"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary({ currency: null }),
  });
  const mismatchedCurrencyPolicy = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("hybrid"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary({ currency: "usd", currencyMismatch: true }),
  });

  assert.equal(completePolicy.reasonableUsagePolicy.threshold.currency, "eur");
  assert.equal(missingCurrencyPolicy.reasonableUsagePolicy.threshold.currency, null);
  assert.equal(mismatchedCurrencyPolicy.reasonableUsagePolicy.threshold.currency, null);
});

test("only finite threshold values greater than zero are treated as usable", () => {
  const cases = [0, -1, Number.NaN, Number.POSITIVE_INFINITY, null];

  for (const perSession of cases) {
    const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
      workspaceMode: buildWorkspaceMode("user-only"),
      workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
      billingPlanSchema: buildBillingPlanSchema({
        limits: {
          spendThresholds: {
            perSession,
            perAction: null,
          },
        },
      }),
      billableUsage: {},
      costSummary: buildCostSummary(),
    });

    assert.equal(reasonableUsagePolicy.threshold.type, null);
  }
});

test("no usable threshold sets null threshold type and missing-threshold policyId", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("autonomous"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema({
      limits: {
        spendThresholds: {
          perSession: null,
          perAction: null,
        },
      },
    }),
    billableUsage: {},
    costSummary: buildCostSummary(),
  });

  assert.equal(reasonableUsagePolicy.threshold.type, null);
  assert.equal(reasonableUsagePolicy.threshold.amount, null);
  assert.equal(reasonableUsagePolicy.policyId, "reasonable-usage-policy::autonomous::missing-threshold");
});

test("user-only resolves to lenient enforcement posture", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("user-only"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary(),
  });

  assert.equal(reasonableUsagePolicy.enforcement.enforcementLevel, "lenient");
});

test("hybrid resolves to balanced enforcement posture", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("hybrid"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary(),
  });

  assert.equal(reasonableUsagePolicy.enforcement.enforcementLevel, "balanced");
});

test("autonomous resolves to strict enforcement posture", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("autonomous"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary(),
  });

  assert.equal(reasonableUsagePolicy.enforcement.enforcementLevel, "strict");
});

test("invalid workspaceMode type returns missing-inputs", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: { type: "expert-mode" },
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary(),
  });

  assert.equal(reasonableUsagePolicy.summary.summaryStatus, "missing-inputs");
});

test("missing definition for current mode returns missing-inputs", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("hybrid"),
    workspaceModeDefinitions: {
      "user-only": buildWorkspaceModeDefinitions()["user-only"],
    },
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary(),
  });

  assert.equal(reasonableUsagePolicy.summary.summaryStatus, "missing-inputs");
});

test("missing required definition fields returns missing-inputs", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("hybrid"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions({
      hybrid: {
        actor: "user+system",
        aiUsageLevel: "medium",
        expectedCostProfile: "medium",
      },
    }),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary(),
  });

  assert.equal(reasonableUsagePolicy.summary.summaryStatus, "missing-inputs");
});

test("complete summary status requires valid mode definitions threshold and usable currency", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("hybrid"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary(),
  });

  assert.equal(reasonableUsagePolicy.summary.summaryStatus, "complete");
});

test("partial summary status applies when threshold is usable but secondary context is weak", () => {
  const withPartialCostSummary = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("hybrid"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary({
      summary: {
        summaryStatus: "partial",
      },
    }),
  });
  const withCurrencyMismatch = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("hybrid"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: {},
    costSummary: buildCostSummary({
      currencyMismatch: true,
    }),
  });

  assert.equal(withPartialCostSummary.reasonableUsagePolicy.summary.summaryStatus, "partial");
  assert.equal(withCurrencyMismatch.reasonableUsagePolicy.summary.summaryStatus, "partial");
});

test("missing-inputs applies when no usable policy can be produced", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("user-only"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: null,
    billableUsage: {},
    costSummary: buildCostSummary(),
  });

  assert.equal(reasonableUsagePolicy.summary.summaryStatus, "missing-inputs");
});

test("policy contains no decision blocked or requires-escalation fields and no raw passthrough", () => {
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode: buildWorkspaceMode("user-only"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    billableUsage: { items: [{ dimension: "ai", quantity: 999 }] },
    costSummary: buildCostSummary({
      breakdown: {
        model: {
          quantity: 999,
          unit: "token",
        },
      },
    }),
  });

  assert.equal(Object.hasOwn(reasonableUsagePolicy, "decision"), false);
  assert.equal(Object.hasOwn(reasonableUsagePolicy, "blocked"), false);
  assert.equal(Object.hasOwn(reasonableUsagePolicy, "requires-escalation"), false);
  assert.equal(Object.hasOwn(reasonableUsagePolicy, "costSummary"), false);
  assert.equal(Object.hasOwn(reasonableUsagePolicy, "billableUsage"), false);
});

test("changing billableUsage does not change threshold selection or enforcement posture", () => {
  const baseInputs = {
    workspaceMode: buildWorkspaceMode("autonomous"),
    workspaceModeDefinitions: buildWorkspaceModeDefinitions(),
    billingPlanSchema: buildBillingPlanSchema(),
    costSummary: buildCostSummary(),
  };
  const firstPolicy = createReasonableUsagePolicyResolver({
    ...baseInputs,
    billableUsage: {
      items: [],
    },
  });
  const secondPolicy = createReasonableUsagePolicyResolver({
    ...baseInputs,
    billableUsage: {
      items: [
        {
          dimension: "ai",
          unit: "token",
          quantity: 1_000_000,
          sourceDimension: "model",
        },
      ],
    },
  });

  assert.equal(firstPolicy.reasonableUsagePolicy.threshold.type, secondPolicy.reasonableUsagePolicy.threshold.type);
  assert.equal(firstPolicy.reasonableUsagePolicy.threshold.amount, secondPolicy.reasonableUsagePolicy.threshold.amount);
  assert.equal(
    firstPolicy.reasonableUsagePolicy.enforcement.enforcementLevel,
    secondPolicy.reasonableUsagePolicy.enforcement.enforcementLevel,
  );
});
