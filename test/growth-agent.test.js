import test from "node:test";
import assert from "node:assert/strict";

import { buildGrowthAgentEnvelope } from "../src/core/growth-agent.js";

const leadProject = {
  id: "growth-leads",
  name: "ניהול לידים",
  goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
  artifactExpectation: { projectType: "internal-tool" },
  runtimeSkeletonTruth: {
    runtimeSkeletonId: "runtime-skeleton:growth-leads:internal-tool",
    title: "ניהול לידים",
    productClass: "internal-tool",
  },
  productDomainSkeleton: {
    productDomainSkeletonId: "product-domain:growth-leads:internal-tool",
  },
  productOwnedBackendSkeleton: {
    productOwnedBackendSkeletonId: "product-owned-backend:growth-leads:internal-tool",
    productionBackend: false,
  },
  releaseWorkspace: {
    workspaceId: "release-run:growth-leads:private-deployment",
  },
};

test("GROW-AGT-001 blocks generic growth before product truth exists", () => {
  const envelope = buildGrowthAgentEnvelope({
    project: {
      id: "vague-growth",
      name: "רעיון לא ברור",
      goal: "משהו לעסקים",
    },
    userInput: "How do I bring users?",
  });

  assert.equal(envelope.taskId, "GROW-AGT-001");
  assert.equal(envelope.status, "needs-product-first");
  assert.equal(envelope.readiness.canRunGrowth, false);
  assert.equal(envelope.campaignExecution.isCampaign, false);
  assert.match(envelope.userMessage, /מוקדם מדי/);
  assert.doesNotMatch(envelope.recommendedAction, /TikTok|SEO|Facebook|campaign/i);
});

test("GROW-AGT-001 recommends one product-connected audience test for lead skeleton", () => {
  const envelope = buildGrowthAgentEnvelope({
    project: leadProject,
    userInput: "How do I start checking if this is interesting?",
  });

  assert.equal(envelope.status, "recommended");
  assert.equal(envelope.opportunityType, "audience-test");
  assert.equal(envelope.readiness.canRunGrowth, true);
  assert.equal(envelope.requiresAgent, "none");
  assert.match(envelope.targetAudience, /לידים|וואטסאפ/);
  assert.match(envelope.recommendedAction, /אחראי, תזכורת וצעד הבא/);
  assert.match(envelope.successMetric, /3 מתוך 5/);
  assert.doesNotMatch(
    [
      envelope.recommendedAction,
      envelope.successMetric,
      envelope.userMessage,
      envelope.growthPluginLayer.primaryPlugin.label,
      envelope.growthPluginLayer.primaryPlugin.smallSuccessMetric,
    ].join(" "),
    /conversion|revenue|virality|TikTok|SEO/i,
  );
  assert.equal(envelope.growthPluginLayer.taskId, "GROW-PLUG-001");
  assert.equal(envelope.growthPluginLayer.registry.taskId, "GROW-PLUG-002");
  assert.equal(envelope.growthPluginLayer.registry.marketplaceMode, false);
  assert.equal(envelope.growthPluginLayer.primaryPlugin.pluginId, "audience-understanding-test");
  assert.equal(envelope.growthPluginLayer.selectionPolicy.onePrimaryRecommendation, true);
});

test("GROW-AGT-001 routes product-changing growth to Mutation", () => {
  const envelope = buildGrowthAgentEnvelope({
    project: leadProject,
    userInput: "Add follow-up today to the product",
  });

  assert.equal(envelope.status, "handoff-required");
  assert.equal(envelope.opportunityType, "product-improvement");
  assert.equal(envelope.requiresAgent, "mutation-change-agent");
  assert.equal(envelope.requiresApproval, true);
  assert.match(envelope.userMessage, /סוכן שינוי/);
});

test("GROW-AGT-001 routes client sending to Share Demo and campaign drafts stay approval gated", () => {
  const share = buildGrowthAgentEnvelope({
    project: leadProject,
    userInput: "Prepare something I can send to clients",
  });
  assert.equal(share.status, "handoff-required");
  assert.equal(share.requiresAgent, "share-demo-agent");
  assert.match(share.userMessage, /לא יוצרת קישור ציבורי לבד/);

  const campaign = buildGrowthAgentEnvelope({
    project: leadProject,
    userInput: "Make a short launch campaign for this",
  });
  assert.equal(campaign.status, "needs-approval");
  assert.equal(campaign.opportunityType, "campaign-draft");
  assert.equal(campaign.requiresAgent, "social-campaign-execution-agent");
  assert.equal(campaign.campaignExecution.isCampaign, true);
  assert.deepEqual(campaign.campaignExecution.allowedNow, ["prepare-drafts"]);
  assert.equal(campaign.campaignExecution.requiresExplicitApprovalBeforeExternalAction, true);
  assert.equal(campaign.campaignExecution.forbiddenWithoutApproval.includes("publish"), true);
  assert.equal(campaign.campaignExecution.forbiddenWithoutApproval.includes("spend"), true);
  assert.equal(campaign.growthPluginLayer.primaryPlugin.pluginId, "social-campaign-draft");
  assert.equal(campaign.growthPluginLayer.primaryPlugin.providerRequired, true);
  assert.equal(campaign.socialCampaignExecutionAgent.taskId, "GROW-AGT-002");
  assert.equal(campaign.socialCampaignExecutionAgent.status, "ready-for-approval");
  assert.equal(campaign.socialCampaignExecutionAgent.externalExecutionPerformed, false);
});

test("GROW-AGT-001 keeps email draft requests aligned with GROW-PLUG-001", () => {
  const email = buildGrowthAgentEnvelope({
    project: leadProject,
    userInput: "תכין מייל ראשון ללקוחות",
  });

  assert.equal(email.status, "needs-approval");
  assert.equal(email.requiresAgent, "none");
  assert.equal(email.requiresApproval, true);
  assert.equal(email.campaignExecution.requiresProviderConnection, true);
  assert.equal(email.growthPluginLayer.primaryPlugin.pluginId, "email-draft");
  assert.equal(email.growthPluginLayer.registrySelection.selectedPluginRegistered, true);
  assert.equal(email.growthPluginLayer.primaryPlugin.registryTaskId, "GROW-PLUG-002");
  assert.doesNotMatch(email.userMessage, /דמו|קישור ציבורי/);
});

test("GROW-SEO-001 is carried by Growth Agent as a bounded SEO action path", () => {
  const envelope = buildGrowthAgentEnvelope({
    project: leadProject,
    userInput: "תכין SEO לעמוד הזה",
  });

  assert.equal(envelope.status, "needs-approval");
  assert.equal(envelope.opportunityType, "seo-draft");
  assert.equal(envelope.requiresAgent, "visual-build-agent");
  assert.equal(envelope.seoActionPath.taskId, "GROW-SEO-001");
  assert.equal(envelope.seoActionPath.status, "draft-ready");
  assert.equal(envelope.seoActionPath.providerTruth.searchVolumeIsHypothesis, true);
  assert.equal(envelope.seoActionPath.externalPublicationPerformed, false);
});

test("GROW-MEASURE-001 is carried by the Growth Agent without fake results", () => {
  const envelope = buildGrowthAgentEnvelope({
    project: leadProject,
    userInput: "תגדיר מדידה לדף נחיתה",
  });

  assert.equal(envelope.growthMeasurementTruth.taskId, "GROW-MEASURE-001");
  assert.equal(envelope.growthMeasurementTruth.status, "measurement-not-available-yet");
  assert.equal(envelope.growthMeasurementTruth.externalActionGate.measurementAvailability, "measurement-not-available-yet");
  assert.equal(envelope.growthMeasurementTruth.learningSummary.confidenceLevel, "low");
  assert.match(envelope.growthMeasurementTruth.learningSummary.insight, /אין להסיק הצלחה/);
});
