import test from "node:test";
import assert from "node:assert/strict";

import { buildEmailActionPathEnvelope, summarizeEmailActionPath } from "../src/core/email-action-path.js";
import { buildGrowthPluginLayer } from "../src/core/growth-plugin-layer.js";

const projectWithProduct = {
  id: "email-leads",
  name: "ניהול לידים",
  goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
  runtimeSkeletonTruth: {
    runtimeSkeletonId: "runtime-email-leads",
    title: "ניהול לידים",
    productClass: "internal-tool",
  },
  productDomainSkeleton: {
    productDomainSkeletonId: "domain-email-leads",
  },
  productOwnedBackendSkeleton: {
    productOwnedBackendSkeletonId: "backend-email-leads",
    productionBackend: false,
  },
};

const measurementTruth = {
  taskId: "GROW-MEASURE-001",
  status: "has-initial-signal",
  records: [{ sourceType: "manual", accepted: true }],
  measurementAvailability: "available",
};

test("GROW-EMAIL-001 routes email requests through the email plugin and drafts by default", () => {
  const pluginLayer = buildGrowthPluginLayer({
    project: projectWithProduct,
    userInput: "תכין רצף מיילים קצר",
  });
  assert.equal(pluginLayer.primaryPlugin.pluginId, "email-draft");
  assert.equal(pluginLayer.primaryPlugin.registryTaskId, "GROW-PLUG-002");

  const envelope = buildEmailActionPathEnvelope({
    project: projectWithProduct,
    userInput: "תכין רצף מיילים קצר",
    measurementTruth,
  });
  assert.equal(envelope.status, "sequence-draft-ready");
  assert.equal(envelope.sendTruth.draftOnlyByDefault, true);
  assert.equal(envelope.sendTruth.fullAudienceSendDefault, false);
  assert.equal(envelope.sendTruth.externalSendPerformed, false);
  assert.equal(envelope.sendTruth.campaignApprovalCanPrepareSequenceOnly, true);
  assert.equal(envelope.sendTruth.everyRealEmailRequiresSeparateApproval, true);
  assert.equal(envelope.draft.sequence[0].subjectVariants.length, 2);
});

test("GROW-EMAIL-001 blocks real sends without provider, lawful audience source, scopes, and explicit approval", () => {
  const noAudience = buildEmailActionPathEnvelope({
    project: projectWithProduct,
    userInput: "שלח את המייל לרשימה",
    measurementTruth,
  });
  assert.equal(noAudience.status, "needs-audience-source");
  assert.equal(noAudience.sendTruth.externalSendPerformed, false);

  const connectedOnly = buildEmailActionPathEnvelope({
    project: projectWithProduct,
    userInput: "שלח את המייל לרשימה",
    measurementTruth,
    audienceInput: {
      source: "waitlist",
      lawfulBasis: "explicit signup",
      ownershipConfirmed: true,
      permissionConfirmed: true,
      addresses: ["a@example.com", "a@example.com", "bad-address"],
    },
    providerConnection: {
      provider: "mailchimp",
      connected: true,
      scopes: ["email-draft"],
    },
  });
  assert.equal(connectedOnly.status, "needs-provider-scope");
  assert.equal(connectedOnly.audienceTruth.cleanedCount, 1);
  assert.equal(connectedOnly.audienceTruth.duplicateCount, 1);
  assert.equal(connectedOnly.audienceTruth.invalidCount, 1);

  const missingApprovals = buildEmailActionPathEnvelope({
    project: projectWithProduct,
    userInput: "שלח את המייל לרשימה",
    measurementTruth,
    audienceInput: {
      source: "waitlist",
      lawfulBasis: "explicit signup",
      ownershipConfirmed: true,
      permissionConfirmed: true,
      addresses: ["a@example.com"],
    },
    providerConnection: {
      provider: "mailchimp",
      connected: true,
      scopes: ["email-draft", "test-send", "send"],
    },
    approvalDecisions: {
      approvals: [{ action: "campaign", approved: true }],
    },
  });
  assert.equal(missingApprovals.status, "needs-send-approval");
  assert.equal(missingApprovals.approval.campaignApproved, true);
  assert.equal(missingApprovals.approval.sendApproved, false);
});

test("GROW-EMAIL-001 prepares one real email only after all required approvals and still does not perform external send", () => {
  const envelope = buildEmailActionPathEnvelope({
    project: projectWithProduct,
    userInput: "שלח את המייל לרשימה דרך Mailchimp",
    measurementTruth,
    audienceInput: {
      source: "provider-list",
      lawfulBasis: "customers opted in",
      ownershipConfirmed: true,
      permissionConfirmed: true,
      addresses: ["first@example.com", "second@example.com"],
    },
    providerConnection: {
      provider: "mailchimp",
      connected: true,
      scopes: ["email-draft", "test-send", "send", "read-results"],
    },
    approvalDecisions: {
      approvals: [
        { action: "campaign", approved: true },
        { action: "content", approved: true },
        { action: "audience-source", approved: true },
        { action: "send", approved: true },
      ],
    },
  });

  assert.equal(envelope.status, "one-email-send-ready");
  assert.equal(envelope.sendTruth.oneEmailSendPrepared, true);
  assert.equal(envelope.sendTruth.sequenceSendReadyCount, 1);
  assert.equal(envelope.sendTruth.externalSendPerformed, false);
  assert.equal(envelope.approval.campaignApprovalDoesNotSendSequence, true);

  const summary = summarizeEmailActionPath(envelope);
  assert.equal(summary.oneEmailSendPrepared, true);
  assert.equal(summary.externalSendPerformed, false);
});

test("GROW-EMAIL-001 supports test send preparation but blocks broad Gmail campaigns and cold lists", () => {
  const testSend = buildEmailActionPathEnvelope({
    project: projectWithProduct,
    userInput: "שליחת בדיקה בג׳ימייל",
    measurementTruth,
    providerConnection: {
      provider: "gmail",
      connected: true,
      scopes: ["email-draft", "test-send"],
    },
    approvalDecisions: {
      approvals: [{ action: "test-send", approved: true }],
    },
  });
  assert.equal(testSend.status, "test-send-ready");
  assert.equal(testSend.providerTruth.gmailLimited, true);
  assert.equal(testSend.sendTruth.externalSendPerformed, false);

  const gmailBroad = buildEmailActionPathEnvelope({
    project: projectWithProduct,
    userInput: "שלח קמפיין רחב בג׳ימייל לרשימה",
    measurementTruth,
    audienceInput: {
      source: "waitlist",
      lawfulBasis: "explicit signup",
      ownershipConfirmed: true,
      permissionConfirmed: true,
      addresses: ["a@example.com"],
    },
    providerConnection: {
      provider: "gmail",
      connected: true,
      scopes: ["email-draft", "test-send", "send"],
    },
  });
  assert.equal(gmailBroad.status, "gmail-broad-campaign-blocked");
  assert.equal(gmailBroad.sendTruth.externalSendPerformed, false);

  const coldList = buildEmailActionPathEnvelope({
    project: projectWithProduct,
    userInput: "שלח את המייל לרשימה",
    measurementTruth,
    audienceInput: {
      source: "cold scraped list",
      lawfulBasis: "unknown",
      ownershipConfirmed: true,
      permissionConfirmed: true,
      coldList: true,
      addresses: ["cold@example.com"],
    },
    providerConnection: {
      provider: "sendgrid",
      connected: true,
      scopes: ["email-draft", "test-send", "send"],
    },
  });
  assert.equal(coldList.status, "needs-audience-source");
  assert.equal(coldList.audienceTruth.coldListRejected, true);
});

test("GROW-EMAIL-001 routes product/page changes outward and never fabricates metrics", () => {
  const handoff = buildEmailActionPathEnvelope({
    project: projectWithProduct,
    userInput: "שנה את המסר בדף לפני המייל",
    measurementTruth,
  });
  assert.equal(handoff.status, "handoff-required");
  assert.equal(handoff.handoffs.mutationRequiredForProductTruthChanges, true);
  assert.equal(handoff.handoffs.visualBuildRequiredForPageChanges, true);

  const missingResults = buildEmailActionPathEnvelope({
    project: projectWithProduct,
    userInput: "מה תוצאות המייל",
    measurementTruth,
    providerConnection: { provider: "mailchimp", connected: true, scopes: ["read-results"] },
  });
  assert.equal(missingResults.status, "draft-mode-provider-results-missing");
  assert.equal(missingResults.resultTruth.fabricatedResultsBlocked, true);
  assert.equal(missingResults.resultTruth.providerResultsAvailable, false);

  const withResults = buildEmailActionPathEnvelope({
    project: projectWithProduct,
    userInput: "מה תוצאות המייל",
    measurementTruth,
    providerConnection: { provider: "mailchimp", connected: true, scopes: ["read-results"] },
    providerResults: { sent: 5, opened: 2, clicks: 1, replies: 0, campaignStatus: "sent" },
  });
  assert.equal(withResults.status, "results-received");
  assert.equal(withResults.resultTruth.providerResultsAvailable, true);
  assert.equal(withResults.resultTruth.metrics.opened, 2);
  assert.equal(withResults.resultTruth.metricsFabricated, false);
});
