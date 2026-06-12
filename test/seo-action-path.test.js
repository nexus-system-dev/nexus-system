import test from "node:test";
import assert from "node:assert/strict";

import { buildSeoActionPathEnvelope } from "../src/core/seo-action-path.js";

const leadProject = {
  id: "seo-leads",
  name: "ניהול לידים",
  goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
  targetAudience: "בעלי עסקים שמקבלים לידים משיחות ומוואטסאפ",
  runtimeSkeletonTruth: {
    runtimeSkeletonId: "runtime-seo-leads",
    title: "ניהול לידים",
    productClass: "internal-tool",
  },
  productDomainSkeleton: {
    productDomainSkeletonId: "domain-seo-leads",
  },
};

test("GROW-SEO-001 blocks SEO before page demo screen or sharp product truth exists", () => {
  const envelope = buildSeoActionPathEnvelope({
    project: { id: "empty-seo", name: "רעיון" },
    userInput: "תכין SEO",
  });

  assert.equal(envelope.taskId, "GROW-SEO-001");
  assert.equal(envelope.status, "needs-product-first");
  assert.equal(envelope.recommendations, null);
  assert.match(envelope.userMessage, /מוקדם מדי/);
});

test("GROW-SEO-001 drafts product-connected Hebrew RTL SEO without outcome promises", () => {
  const envelope = buildSeoActionPathEnvelope({
    project: leadProject,
    userInput: "תכין SEO לעמוד הזה",
  });

  assert.equal(envelope.status, "draft-ready");
  assert.equal(envelope.productBasis.direction, "rtl");
  assert.equal(envelope.productBasis.language, "he");
  assert.match(envelope.recommendations.title, /ניהול לידים/);
  assert.equal(envelope.recommendations.keywordHypotheses.length, 3);
  assert.equal(envelope.providerTruth.searchVolumeIsHypothesis, true);
  assert.equal(envelope.providerTruth.rankingsAreHypothesis, true);
  assert.equal(envelope.blockedClaims.includes("guarantee-ranking"), true);
  assert.doesNotMatch(
    [
      envelope.userMessage,
      envelope.recommendations.title,
      envelope.recommendations.metaDescription,
      envelope.recommendations.openingCopy,
    ].join(" "),
    /מקום ראשון|תנועה מובטחת|מכירות מובטחות|guaranteed|first page/i,
  );
});

test("GROW-SEO-001 requires approval before applying visible SEO changes", () => {
  const needsApproval = buildSeoActionPathEnvelope({
    project: leadProject,
    userInput: "apply SEO updates",
  });
  assert.equal(needsApproval.status, "needs-approval");
  assert.equal(needsApproval.visiblePageUpdated, false);

  const applied = buildSeoActionPathEnvelope({
    project: leadProject,
    userInput: "apply SEO updates",
    approvalDecisions: {
      approvals: [
        { action: "apply-seo", approved: true },
      ],
    },
  });
  assert.equal(applied.status, "applied-to-visual-build");
  assert.equal(applied.visiblePageUpdated, true);
  assert.equal(applied.externalPublicationPerformed, false);
  assert.equal(applied.handoffs.visualBuildRequired, true);
});

test("GROW-SEO-001 routes product message and public visibility through the right gates", () => {
  const message = buildSeoActionPathEnvelope({
    project: leadProject,
    userInput: "שנה את המסר וההבטחה של העמוד",
  });
  assert.equal(message.status, "handoff-required");
  assert.equal(message.handoffs.mutationRequired, true);

  const publish = buildSeoActionPathEnvelope({
    project: leadProject,
    userInput: "publish this SEO page publicly",
  });
  assert.equal(publish.status, "needs-share-or-release");
  assert.equal(publish.externalPublicationPerformed, false);
  assert.equal(publish.handoffs.shareOrReleaseRequiredForPublicVisibility, true);
});

test("GROW-SEO-001 keeps Search Console optional and blocks fake provider data", () => {
  const missing = buildSeoActionPathEnvelope({
    project: leadProject,
    userInput: "show Search Console rankings and search volume",
    searchConsoleConnection: {
      connected: false,
    },
  });
  assert.equal(missing.status, "draft-mode-search-console-missing");
  assert.equal(missing.providerTruth.realProviderDataAvailable, false);
  assert.equal(missing.providerTruth.searchVolumeIsHypothesis, true);

  const real = buildSeoActionPathEnvelope({
    project: leadProject,
    userInput: "show Search Console rankings and search volume",
    searchConsoleConnection: {
      connected: true,
      readScopeGranted: true,
      realData: {
        clicks: 4,
        impressions: 35,
        queries: ["ניהול לידים"],
      },
    },
  });
  assert.equal(real.status, "draft-ready-with-provider-data");
  assert.equal(real.providerTruth.realProviderDataAvailable, true);
  assert.deepEqual(real.providerTruth.metrics.queries, ["ניהול לידים"]);
});
