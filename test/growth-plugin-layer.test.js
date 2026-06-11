import test from "node:test";
import assert from "node:assert/strict";

import { buildGrowthPluginLayer } from "../src/core/growth-plugin-layer.js";

const leadProject = {
  id: "growth-plugin-leads",
  name: "ניהול לידים",
  goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
  artifactExpectation: { projectType: "internal-tool" },
  runtimeSkeletonTruth: {
    runtimeSkeletonId: "runtime-skeleton:growth-plugin-leads:internal-tool",
    title: "ניהול לידים",
    productClass: "internal-tool",
  },
  productDomainSkeleton: {
    productDomainSkeletonId: "product-domain:growth-plugin-leads:internal-tool",
  },
  productOwnedBackendSkeleton: {
    productOwnedBackendSkeletonId: "product-owned-backend:growth-plugin-leads:internal-tool",
    productionBackend: false,
  },
};

test("GROW-PLUG-001 blocks growth plugins until product, audience, value, and showable artifact exist", () => {
  const layer = buildGrowthPluginLayer({
    project: { id: "empty-growth", name: "רעיון" },
    userInput: "תביא לי לקוחות",
  });

  assert.equal(layer.taskId, "GROW-PLUG-001");
  assert.equal(layer.status, "needs-product-first");
  assert.equal(layer.readiness.canUseGrowthPlugin, false);
  assert.equal(layer.primaryPlugin.pluginId, "product-readiness-blocker");
  assert.equal(layer.primaryPlugin.blockedActions.includes("campaign"), true);
  assert.equal(layer.boundaries.noFabricatedMetrics, true);
});

test("GROW-PLUG-001 chooses one product-connected learning step by default", () => {
  const layer = buildGrowthPluginLayer({
    project: leadProject,
    userInput: "איך מתחילים לבדוק אם זה מעניין?",
  });

  assert.equal(layer.status, "selected");
  assert.equal(layer.selectionPolicy.onePrimaryRecommendation, true);
  assert.equal(layer.selectionPolicy.channelIsSecondary, true);
  assert.equal(layer.primaryPlugin.pluginId, "audience-understanding-test");
  assert.match(layer.primaryPlugin.smallSuccessMetric, /3 מתוך 5/);
  assert.doesNotMatch(
    [
      layer.primaryPlugin.label,
      layer.primaryPlugin.smallSuccessMetric,
      layer.primaryPlugin.whyThisPlugin,
      layer.historySummary.summary,
    ].join(" "),
    /revenue|virality|guarantee|ranking/i,
  );
});

test("GROW-PLUG-001 routes growth goals to bounded plugin capabilities", () => {
  const seo = buildGrowthPluginLayer({
    project: leadProject,
    userInput: "תכין SEO לעמוד הזה",
  });
  assert.equal(seo.primaryPlugin.pluginId, "seo-page-draft");
  assert.equal(seo.primaryPlugin.approvalRequired, true);
  assert.equal(seo.primaryPlugin.blockedActions.includes("promise-ranking"), true);

  const campaign = buildGrowthPluginLayer({
    project: leadProject,
    userInput: "תייצר קמפיין השקה",
  });
  assert.equal(campaign.primaryPlugin.pluginId, "social-campaign-draft");
  assert.equal(campaign.primaryPlugin.providerRequired, true);
  assert.equal(campaign.primaryPlugin.approvalRequired, true);
  assert.equal(campaign.primaryPlugin.handoffRequired, "social-campaign-execution-agent");
  assert.equal(campaign.primaryPlugin.blockedActions.includes("publish"), true);

  const followup = buildGrowthPluginLayer({
    project: leadProject,
    userInput: "תוסיף מעקב היום למוצר",
  });
  assert.equal(followup.primaryPlugin.pluginId, "product-improvement-handoff");
  assert.equal(followup.primaryPlugin.handoffRequired, "mutation-change-agent");

  const email = buildGrowthPluginLayer({
    project: leadProject,
    userInput: "תכין מייל ראשון ללקוחות",
  });
  assert.equal(email.primaryPlugin.pluginId, "email-draft");
  assert.equal(email.primaryPlugin.providerRequired, true);
  assert.equal(email.primaryPlugin.approvalRequired, true);
});

test("GROW-PLUG-001 keeps provider and result boundaries explicit", () => {
  const layer = buildGrowthPluginLayer({
    project: leadProject,
    userInput: "תכין מודעה עם תקציב קטן",
  });

  assert.equal(layer.primaryPlugin.pluginId, "paid-test-draft");
  assert.equal(layer.primaryPlugin.providerRequired, true);
  assert.equal(layer.primaryPlugin.providerScopeRequired.includes("spend-approval"), true);
  assert.equal(layer.boundaries.noExternalActionWithoutApproval, true);
  assert.equal(layer.boundaries.noTrafficRevenueViralityPromise, true);
  assert.equal(layer.historySummary.shouldRecord, true);
});
