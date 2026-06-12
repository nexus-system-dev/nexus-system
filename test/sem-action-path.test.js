import test from "node:test";
import assert from "node:assert/strict";

import { buildGrowthPluginLayer } from "../src/core/growth-plugin-layer.js";
import { buildSemActionPathEnvelope, summarizeSemActionPath } from "../src/core/sem-action-path.js";

const projectWithProductAndMeasurement = {
  id: "sem-leads",
  name: "ניהול לידים",
  goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
  runtimeSkeletonTruth: {
    runtimeSkeletonId: "runtime-sem-leads",
    title: "ניהול לידים",
    productClass: "internal-tool",
  },
  productDomainSkeleton: {
    productDomainSkeletonId: "domain-sem-leads",
  },
  productOwnedBackendSkeleton: {
    productOwnedBackendSkeletonId: "backend-sem-leads",
    productionBackend: false,
  },
};

const measurementTruth = {
  taskId: "GROW-MEASURE-001",
  status: "has-initial-signal",
  records: [{ sourceType: "manual", accepted: true }],
  measurementAvailability: "available",
};

test("GROW-SEM-001 blocks paid campaigns before landing/demo path or measurement truth", () => {
  const noProduct = buildSemActionPathEnvelope({
    project: { id: "idea-only", name: "Idea only" },
    userInput: "תכין מודעה ממומנת",
    measurementTruth,
  });

  assert.equal(noProduct.status, "needs-landing-or-demo");
  assert.equal(noProduct.externalSpendPerformed, false);

  const noMeasurement = buildSemActionPathEnvelope({
    project: projectWithProductAndMeasurement,
    userInput: "תכין מודעה ממומנת",
  });

  assert.equal(noMeasurement.status, "needs-measurement");
  assert.equal(noMeasurement.readiness.measurementPlanReady, false);
});

test("GROW-SEM-001 stays draft-only without provider and never promises paid results", () => {
  const envelope = buildSemActionPathEnvelope({
    project: projectWithProductAndMeasurement,
    userInput: "תכין Google Ads בתקציב קטן",
    measurementTruth,
    requestedBudget: { amount: 500, currency: "USD" },
  });

  assert.equal(envelope.status, "draft-only-provider-missing");
  assert.equal(envelope.budget.hardCapUsd, 50);
  assert.equal(envelope.budget.suggestedAmount, 50);
  assert.equal(envelope.externalSpendPerformed, false);
  assert.equal(envelope.providerTruth.providerConnectionIsNotSpendPermission, true);
  assert.equal(envelope.forbiddenPromises.includes("guarantee-leads"), true);
  assert.doesNotMatch(envelope.userMessage, /לידים מובטחים|מכירות מובטחות|guaranteed/i);
});

test("GROW-SEM-001 treats provider connection as insufficient without spend scope and separate approvals", () => {
  const connectedOnly = buildSemActionPathEnvelope({
    project: projectWithProductAndMeasurement,
    userInput: "תפעיל את הקמפיין",
    measurementTruth,
    providerConnection: {
      provider: "google-ads",
      connected: true,
      scopes: ["ad-draft"],
    },
  });

  assert.equal(connectedOnly.status, "needs-provider-scope");
  assert.equal(connectedOnly.externalSpendPerformed, false);

  const missingApprovals = buildSemActionPathEnvelope({
    project: projectWithProductAndMeasurement,
    userInput: "תפעיל את הקמפיין",
    measurementTruth,
    providerConnection: {
      provider: "google-ads",
      connected: true,
      scopes: ["ad-draft", "spend-approval"],
    },
    approvalDecisions: {
      approvals: [{ action: "campaign", approved: true }],
    },
  });

  assert.equal(missingApprovals.status, "needs-separate-approvals");
  assert.equal(missingApprovals.approval.campaignApproved, true);
  assert.equal(missingApprovals.approval.adApproved, false);
  assert.equal(missingApprovals.externalSpendPerformed, false);
});

test("GROW-SEM-001 prepares Google Ads activation only after all approvals and scopes", () => {
  const envelope = buildSemActionPathEnvelope({
    project: projectWithProductAndMeasurement,
    userInput: "תפעיל את הקמפיין ב-Google Ads",
    measurementTruth,
    providerConnection: {
      provider: "google-ads",
      connected: true,
      scopes: ["ad-draft", "spend-approval", "read-results"],
    },
    approvalDecisions: {
      approvals: [
        { action: "campaign", approved: true },
        { action: "ad", approved: true },
        { action: "budget", approved: true },
        { action: "activation", approved: true },
      ],
    },
  });

  assert.equal(envelope.status, "ready-for-provider-activation");
  assert.equal(envelope.activationPrepared, true);
  assert.equal(envelope.externalSpendPerformed, false);
  assert.equal(envelope.readiness.canPrepareActivation, true);

  const summary = summarizeSemActionPath(envelope);
  assert.equal(summary.taskId, "GROW-SEM-001");
  assert.equal(summary.canPrepareActivation, true);
  assert.equal(summary.externalSpendPerformed, false);
});

test("GROW-SEM-001 routes paid social boosts to SEM as draft-only first-release work", () => {
  const pluginLayer = buildGrowthPluginLayer({
    project: projectWithProductAndMeasurement,
    userInput: "תעשה boost לפוסט באינסטגרם בתקציב קטן",
  });
  assert.equal(pluginLayer.primaryPlugin.pluginId, "paid-test-draft");
  assert.equal(pluginLayer.primaryPlugin.registryCapability, "sem-paid-test");
  assert.equal(pluginLayer.primaryPlugin.registryTaskId, "GROW-PLUG-002");

  const envelope = buildSemActionPathEnvelope({
    project: projectWithProductAndMeasurement,
    userInput: "תעשה boost לפוסט באינסטגרם בתקציב קטן",
    measurementTruth,
  });

  assert.equal(envelope.status, "draft-only-provider");
  assert.equal(envelope.handoffs.paidSocialRoutedToSem, true);
  assert.equal(envelope.externalSpendPerformed, false);
});

test("GROW-SEM-001 routes page/message changes outward and safe stop never edits ads or budget", () => {
  const handoff = buildSemActionPathEnvelope({
    project: projectWithProductAndMeasurement,
    userInput: "שנה את המסר בדף הנחיתה למשהו אגרסיבי יותר",
    measurementTruth,
  });

  assert.equal(handoff.status, "handoff-required");
  assert.equal(handoff.handoffs.visualBuildRequiredForLandingChanges, true);
  assert.equal(handoff.handoffs.mutationRequiredForMessageChanges, true);

  const stopped = buildSemActionPathEnvelope({
    project: projectWithProductAndMeasurement,
    userInput: "עצור את הקמפיין",
    measurementTruth,
    providerConnection: {
      provider: "google-ads",
      connected: true,
      scopes: ["ad-draft", "spend-approval"],
    },
    safeStopSignal: { trigger: "high-cpc" },
  });

  assert.equal(stopped.status, "stopped-safely");
  assert.equal(stopped.safeStop.stopped, true);
  assert.equal(stopped.safeStop.adsModified, false);
  assert.equal(stopped.safeStop.budgetModified, false);
});

test("GROW-SEM-001 reads paid metrics only from provider truth and never fabricates results", () => {
  const missing = buildSemActionPathEnvelope({
    project: projectWithProductAndMeasurement,
    userInput: "מה התוצאות של המודעות",
    measurementTruth,
    providerConnection: { provider: "google-ads", connected: true, scopes: ["read-results"] },
  });

  assert.equal(missing.status, "draft-mode-provider-results-missing");
  assert.equal(missing.resultTruth.fabricatedResultsBlocked, true);
  assert.equal(missing.resultTruth.providerResultsAvailable, false);

  const withResults = buildSemActionPathEnvelope({
    project: projectWithProductAndMeasurement,
    userInput: "מה התוצאות של המודעות",
    measurementTruth,
    providerConnection: { provider: "google-ads", connected: true, scopes: ["read-results"] },
    providerResults: { spend: 12, clicks: 20, impressions: 900, cpc: 0.6, conversions: 0 },
  });

  assert.equal(withResults.status, "results-received");
  assert.equal(withResults.resultTruth.providerResultsAvailable, true);
  assert.equal(withResults.resultTruth.metrics.clicks, 20);
  assert.equal(withResults.externalSpendPerformed, false);
});
