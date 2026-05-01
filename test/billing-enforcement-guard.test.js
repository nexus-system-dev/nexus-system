import test from "node:test";
import assert from "node:assert/strict";

import { createBillingEnforcementGuard } from "../src/core/billing-enforcement-guard.js";

function createBaseInputs(overrides = {}) {
  return {
    workspaceMode: { type: "hybrid" },
    entitlementDecision: { decision: "allowed" },
    billableUsage: {
      billableUsageId: "billable-usage::complete::1::0",
      items: [],
      summary: { summaryStatus: "complete", mappedItems: 1, unknownItems: 0 },
    },
    reasonableUsagePolicy: {
      policyId: "reasonable-usage-policy::hybrid::per-session",
      workspaceMode: "hybrid",
      threshold: {
        type: "per-session",
        amount: 25,
        currency: "USD",
        source: "billing-plan-schema",
      },
      enforcement: {
        enforcementLevel: "balanced",
        withinLimitAction: "allow",
        approachingLimitAction: "contact-support",
        overLimitAction: "upgrade-plan",
      },
      summary: {
        summaryStatus: "complete",
        explanation: "ok",
      },
    },
    costSummary: {
      totalEstimatedCost: 10,
      currency: "USD",
      currencyMismatch: false,
      summary: { summaryStatus: "complete" },
    },
    workspaceBillingState: {
      workspaceBillingStateId: "workspace-billing-state::ws-1::complete::checkout::1",
      workspaceId: "ws-1",
      currentPlanId: null,
      subscriptionStatus: null,
      lastBillingEventType: "checkout",
      source: {
        hasBillingEvents: true,
        eventCount: 1,
      },
      summary: {
        summaryStatus: "complete",
      },
    },
    ...overrides,
  };
}

test("returns allowed decision when entitlement, cost, and billing checks pass", () => {
  const result = createBillingEnforcementGuard(createBaseInputs());

  assert.deepEqual(Object.keys(result), ["billingGuardDecision", "approvalRequest"]);
  assert.equal(result.billingGuardDecision.billingGuardDecisionId, "billing-guard-decision::ws-1::allowed");
  assert.equal(result.billingGuardDecision.decision, "allowed");
  assert.equal(result.billingGuardDecision.allowed, true);
  assert.equal(result.billingGuardDecision.requiresEscalation, false);
  assert.equal(result.billingGuardDecision.primaryFailure, null);
  assert.equal(result.billingGuardDecision.recommendedAction, null);
  assert.equal(result.billingGuardDecision.summary.summaryStatus, "complete");
  assert.equal(
    result.billingGuardDecision.summary.explanation,
    "Billing enforcement allows usage within entitlement, cost, and billing constraints.",
  );
  assert.equal(result.billingGuardDecision.source, "billing-enforcement-guard");
  assert.equal(result.approvalRequest, null);
});

test("billing failure has highest priority over cost and entitlement failures", () => {
  const result = createBillingEnforcementGuard(createBaseInputs({
    entitlementDecision: { decision: "restricted" },
    costSummary: {
      totalEstimatedCost: 40,
      currency: "USD",
      currencyMismatch: false,
      summary: { summaryStatus: "complete" },
    },
    workspaceBillingState: {
      workspaceId: "ws-1",
      lastBillingEventType: "payment-failure",
      source: { hasBillingEvents: true, eventCount: 2 },
      summary: { summaryStatus: "partial" },
    },
  }));

  assert.equal(result.billingGuardDecision.decision, "blocked");
  assert.deepEqual(result.billingGuardDecision.primaryFailure, {
    type: "billing",
    reason: "payment-failure-detected",
  });
  assert.deepEqual(result.billingGuardDecision.recommendedAction, {
    type: "retry-payment",
    reason: "payment-failure-detected",
  });
  assert.equal(
    result.billingGuardDecision.summary.explanation,
    "Billing enforcement blocked usage due to payment-failure-detected.",
  );
});

test("cancel billing evidence blocks usage with billing-cancel-detected", () => {
  const result = createBillingEnforcementGuard(createBaseInputs({
    workspaceBillingState: {
      workspaceId: "ws-1",
      lastBillingEventType: "cancel",
      source: { hasBillingEvents: true, eventCount: 3 },
      summary: { summaryStatus: "partial" },
    },
  }));

  assert.equal(result.billingGuardDecision.decision, "blocked");
  assert.deepEqual(result.billingGuardDecision.primaryFailure, {
    type: "billing",
    reason: "billing-cancel-detected",
  });
});

test("retry billing evidence requires escalation and creates approval request", () => {
  const result = createBillingEnforcementGuard(createBaseInputs({
    workspaceBillingState: {
      workspaceId: "ws-1",
      lastBillingEventType: "retry",
      source: { hasBillingEvents: true, eventCount: 1 },
      summary: { summaryStatus: "partial" },
    },
  }));

  assert.equal(result.billingGuardDecision.decision, "requires-escalation");
  assert.equal(result.billingGuardDecision.allowed, false);
  assert.equal(result.billingGuardDecision.requiresEscalation, true);
  assert.equal(result.billingGuardDecision.summary.summaryStatus, "partial");
  assert.deepEqual(result.billingGuardDecision.recommendedAction, {
    type: "contact-support",
    reason: "billing-retry-pending",
  });
  assert.deepEqual(result.approvalRequest, {
    requestType: "billing-enforcement",
    reason: "billing-retry-pending",
    relatedDecision: "billingGuardDecision",
    requiredAction: "contact-support",
  });
});

test("billing partial evidence becomes dominant unknown reason", () => {
  const result = createBillingEnforcementGuard(createBaseInputs({
    workspaceBillingState: {
      workspaceId: "ws-1",
      lastBillingEventType: "checkout",
      source: { hasBillingEvents: true, eventCount: 1 },
      summary: { summaryStatus: "partial" },
    },
  }));

  const billingCheck = result.billingGuardDecision.guardChecks.find((check) => check.type === "billing");
  assert.deepEqual(billingCheck, {
    type: "billing",
    status: "unknown",
    reason: "billing-evidence-partial",
  });
  assert.equal(result.billingGuardDecision.summary.summaryStatus, "partial");
});

test("missing billing evidence becomes billing-evidence-missing", () => {
  const result = createBillingEnforcementGuard(createBaseInputs({
    workspaceBillingState: {
      workspaceId: "ws-1",
      lastBillingEventType: null,
      source: { hasBillingEvents: false, eventCount: 0 },
      summary: { summaryStatus: "missing-inputs" },
    },
  }));

  const billingCheck = result.billingGuardDecision.guardChecks.find((check) => check.type === "billing");
  assert.deepEqual(billingCheck, {
    type: "billing",
    status: "unknown",
    reason: "billing-evidence-missing",
  });
});

test("cost check passes within threshold and fails when threshold exceeded", () => {
  const passed = createBillingEnforcementGuard(createBaseInputs({
    workspaceBillingState: {
      workspaceId: "ws-1",
      lastBillingEventType: "checkout",
      source: { hasBillingEvents: true, eventCount: 1 },
      summary: { summaryStatus: "complete" },
    },
  }));
  const failed = createBillingEnforcementGuard(createBaseInputs({
    costSummary: {
      totalEstimatedCost: 30,
      currency: "USD",
      currencyMismatch: false,
      summary: { summaryStatus: "complete" },
    },
    workspaceBillingState: {
      workspaceId: "ws-1",
      lastBillingEventType: "checkout",
      source: { hasBillingEvents: true, eventCount: 1 },
      summary: { summaryStatus: "complete" },
    },
  }));

  assert.deepEqual(passed.billingGuardDecision.guardChecks.find((check) => check.type === "cost"), {
    type: "cost",
    status: "passed",
    reason: "cost-within-threshold",
  });
  assert.deepEqual(failed.billingGuardDecision.primaryFailure, {
    type: "cost",
    reason: "cost-threshold-exceeded",
  });
  assert.deepEqual(failed.billingGuardDecision.recommendedAction, {
    type: "upgrade-plan",
    reason: "cost-threshold-exceeded",
  });
});

test("cost unknown reasons cover threshold missing, currency missing, mismatch, and missing summary", () => {
  const thresholdMissing = createBillingEnforcementGuard(createBaseInputs({
    reasonableUsagePolicy: {
      threshold: { type: null, amount: null, currency: null, source: "billing-plan-schema" },
    },
  }));
  const currencyMissing = createBillingEnforcementGuard(createBaseInputs({
    reasonableUsagePolicy: {
      threshold: { type: "per-session", amount: 25, currency: null, source: "billing-plan-schema" },
    },
  }));
  const mismatch = createBillingEnforcementGuard(createBaseInputs({
    costSummary: {
      totalEstimatedCost: 10,
      currency: "USD",
      currencyMismatch: true,
      summary: { summaryStatus: "complete" },
    },
    reasonableUsagePolicy: {
      threshold: { type: "per-session", amount: 25, currency: null, source: "billing-plan-schema" },
    },
  }));
  const costMissing = createBillingEnforcementGuard(createBaseInputs({
    costSummary: null,
  }));

  assert.equal(thresholdMissing.billingGuardDecision.guardChecks.find((check) => check.type === "cost").reason, "threshold-missing");
  assert.equal(currencyMissing.billingGuardDecision.guardChecks.find((check) => check.type === "cost").reason, "missing-cost-currency");
  assert.equal(mismatch.billingGuardDecision.guardChecks.find((check) => check.type === "cost").reason, "currency-mismatch");
  assert.equal(costMissing.billingGuardDecision.guardChecks.find((check) => check.type === "cost").reason, "cost-summary-missing");
});

test("entitlement reasons cover allowed, restricted, blocked, and missing", () => {
  const allowed = createBillingEnforcementGuard(createBaseInputs());
  const restricted = createBillingEnforcementGuard(createBaseInputs({
    entitlementDecision: { decision: "restricted" },
    workspaceBillingState: {
      workspaceId: "ws-1",
      lastBillingEventType: "checkout",
      source: { hasBillingEvents: true, eventCount: 1 },
      summary: { summaryStatus: "complete" },
    },
  }));
  const blocked = createBillingEnforcementGuard(createBaseInputs({
    entitlementDecision: { decision: "blocked" },
    workspaceBillingState: {
      workspaceId: "ws-1",
      lastBillingEventType: "checkout",
      source: { hasBillingEvents: true, eventCount: 1 },
      summary: { summaryStatus: "complete" },
    },
  }));
  const missing = createBillingEnforcementGuard(createBaseInputs({
    entitlementDecision: null,
  }));

  assert.equal(allowed.billingGuardDecision.guardChecks.find((check) => check.type === "entitlement").reason, "entitlement-allowed");
  assert.equal(restricted.billingGuardDecision.guardChecks.find((check) => check.type === "entitlement").reason, "entitlement-restricted");
  assert.equal(blocked.billingGuardDecision.guardChecks.find((check) => check.type === "entitlement").reason, "entitlement-blocked");
  assert.equal(missing.billingGuardDecision.guardChecks.find((check) => check.type === "entitlement").reason, "entitlement-missing");
});

test("summary status is missing-inputs when workspaceId is unusable or all checks are unknown", () => {
  const missingWorkspaceId = createBillingEnforcementGuard(createBaseInputs({
    workspaceBillingState: {
      workspaceId: null,
      lastBillingEventType: null,
      source: { hasBillingEvents: false, eventCount: 0 },
      summary: { summaryStatus: "complete" },
    },
  }));
  const allUnknown = createBillingEnforcementGuard(createBaseInputs({
    entitlementDecision: null,
    reasonableUsagePolicy: {
      threshold: { type: null, amount: null, currency: null, source: "billing-plan-schema" },
    },
    costSummary: null,
    workspaceBillingState: {
      workspaceId: "ws-1",
      lastBillingEventType: null,
      source: { hasBillingEvents: false, eventCount: 0 },
      summary: { summaryStatus: "missing-inputs" },
    },
  }));

  assert.equal(missingWorkspaceId.billingGuardDecision.billingGuardDecisionId, "billing-guard-decision::unknown-workspace::requires-escalation");
  assert.equal(missingWorkspaceId.billingGuardDecision.summary.summaryStatus, "missing-inputs");
  assert.equal(
    missingWorkspaceId.billingGuardDecision.summary.explanation,
    "Billing enforcement could not evaluate required inputs safely.",
  );
  assert.equal(allUnknown.billingGuardDecision.summary.summaryStatus, "missing-inputs");
});

test("summary status is partial when unknown and resolved checks are mixed", () => {
  const result = createBillingEnforcementGuard(createBaseInputs({
    workspaceBillingState: {
      workspaceId: "ws-1",
      lastBillingEventType: "retry",
      source: { hasBillingEvents: true, eventCount: 1 },
      summary: { summaryStatus: "partial" },
    },
  }));

  assert.equal(result.billingGuardDecision.summary.summaryStatus, "partial");
});
