import test from "node:test";
import assert from "node:assert/strict";

import { buildSocialCampaignExecutionAgentEnvelope } from "../src/core/social-campaign-execution-agent.js";

const leadProject = {
  id: "social-leads",
  name: "ניהול לידים",
  goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
  targetAudience: "בעלי עסקים שמקבלים לידים משיחות ומוואטסאפ",
  runtimeSkeletonTruth: {
    runtimeSkeletonId: "runtime-social-leads",
    title: "ניהול לידים",
    productClass: "internal-tool",
  },
  productDomainSkeleton: {
    productDomainSkeletonId: "domain-social-leads",
  },
};

test("GROW-AGT-002 creates product-connected drafts without provider action", () => {
  const envelope = buildSocialCampaignExecutionAgentEnvelope({
    project: leadProject,
    userInput: "Create a three-day campaign for the lead management demo.",
  });

  assert.equal(envelope.taskId, "GROW-AGT-002");
  assert.equal(envelope.agentId, "social-campaign-execution-agent");
  assert.equal(envelope.status, "ready-for-approval");
  assert.equal(envelope.sequence.length, 3);
  assert.deepEqual(envelope.sequence.map((post) => post.purpose), ["problem", "solution", "demo"]);
  assert.equal(envelope.externalExecutionPerformed, false);
  assert.equal(envelope.permissions.approvalRequiredBeforeExternalAction, true);
  assert.equal(envelope.fallback.manualCopyAvailable, true);
});

test("GROW-AGT-002 fails closed when scheduling lacks provider connection", () => {
  const envelope = buildSocialCampaignExecutionAgentEnvelope({
    project: leadProject,
    userInput: "Schedule this for Instagram.",
  });

  assert.equal(envelope.status, "needs-provider");
  assert.equal(envelope.selectedProvider, "instagram");
  assert.equal(envelope.externalExecutionPerformed, false);
  assert.match(envelope.userMessage, /ספק מחובר/);
});

test("GROW-AGT-002 requires per-post approval and campaign approval cannot publish", () => {
  const envelope = buildSocialCampaignExecutionAgentEnvelope({
    project: leadProject,
    userInput: "Publish this post.",
    providerConnection: {
      provider: "facebook",
      connected: true,
      account: "fb-page-1",
      scopes: ["publish"],
    },
    approvalDecisions: {
      campaignApproved: true,
    },
  });

  assert.equal(envelope.status, "needs-approval");
  assert.equal(envelope.selectedProvider, "facebook");
  assert.equal(envelope.approval.campaignApprovalCannotPublishPosts, true);
  assert.equal(envelope.externalExecutionPerformed, false);
  assert.match(envelope.history[0].reason, /אישור קמפיין כללי לא מספיק/);
});

test("GROW-AGT-002 schedules only with V1 provider scope and exact post approval", () => {
  const envelope = buildSocialCampaignExecutionAgentEnvelope({
    project: leadProject,
    userInput: "Schedule this for Instagram.",
    providerConnection: {
      provider: "instagram",
      connected: true,
      account: "ig-account-1",
      scopes: ["schedule"],
    },
    approvalDecisions: {
      postApprovals: [
        { postId: "post-1", provider: "instagram", action: "schedule", approved: true },
      ],
    },
  });

  assert.equal(envelope.status, "scheduled");
  assert.equal(envelope.externalExecutionPerformed, true);
  assert.equal(envelope.sequence[0].externalActionPerformed, true);
  assert.match(envelope.history[0].reason, /אישור נקודתי/);
});

test("GROW-AGT-002 keeps TikTok LinkedIn YouTube and X draft-only in V1", () => {
  for (const provider of ["tiktok", "linkedin", "youtube", "x"]) {
    const envelope = buildSocialCampaignExecutionAgentEnvelope({
      project: leadProject,
      userInput: `Publish this campaign on ${provider}.`,
      providerConnection: {
        provider,
        connected: true,
        scopes: ["publish", "schedule"],
      },
      approvalDecisions: {
        postApprovals: [
          { postId: "post-1", provider, action: "publish", approved: true },
        ],
      },
    });

    assert.equal(envelope.status, "ready-for-approval");
    assert.equal(envelope.externalExecutionPerformed, false);
    assert.equal(envelope.fallback.manualCopyAvailable, true);
    assert.match(envelope.userMessage, /טיוטה בלבד/);
  }
});

test("GROW-AGT-002 blocks replies moderation direct messages ad spend and account edits", () => {
  const cases = [
    ["Reply to everyone who comments.", "reply"],
    ["Delete bad comments.", "moderate"],
    ["Send private message to every lead.", "direct-message"],
    ["Boost this with budget.", "ad-spend"],
    ["Change the page settings.", "account-edit"],
  ];
  for (const [input, action] of cases) {
    const envelope = buildSocialCampaignExecutionAgentEnvelope({
      project: leadProject,
      userInput: input,
      providerConnection: { provider: "instagram", connected: true, scopes: [action] },
    });

    assert.equal(envelope.status, "failed-safely");
    assert.equal(envelope.requestedAction, action);
    assert.equal(envelope.externalExecutionPerformed, false);
  }
});

test("GROW-AGT-002 routes missing creative assets and never invents provider results", () => {
  const missingAsset = buildSocialCampaignExecutionAgentEnvelope({
    project: leadProject,
    userInput: "Make this campaign with a demo video.",
  });
  assert.equal(missingAsset.requiresAgent, "share-demo-agent");
  assert.equal(missingAsset.fallback.missingAsset, "approved-demo-or-creative-asset");

  const noResults = buildSocialCampaignExecutionAgentEnvelope({
    project: leadProject,
    userInput: "Read Facebook results and comments.",
    providerConnection: { provider: "facebook", connected: true, scopes: ["read-results"] },
    approvalDecisions: { readResultsApproved: true },
  });
  assert.equal(noResults.status, "needs-approval");
  assert.equal(noResults.resultIntake.providerResultsAvailable, false);
  assert.equal(noResults.resultIntake.fabricatedMetricsBlocked, true);

  const realResults = buildSocialCampaignExecutionAgentEnvelope({
    project: leadProject,
    userInput: "Read Facebook results and comments.",
    providerConnection: { provider: "facebook", connected: true, scopes: ["read-results"] },
    approvalDecisions: { readResultsApproved: true },
    providerResults: {
      metrics: { views: 14, clicks: 2 },
      comments: [
        { text: "ברור ומעניין" },
        { text: "המייל שלי test@example.com" },
      ],
    },
  });
  assert.equal(realResults.status, "results-received");
  assert.equal(realResults.resultIntake.providerResultsAvailable, true);
  assert.deepEqual(realResults.resultIntake.metrics, { views: 14, clicks: 2 });
  assert.equal(realResults.resultIntake.commentsSummary.sensitiveExamplesHidden, true);
});
