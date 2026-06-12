import assert from "node:assert/strict";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

const port = Number.parseInt(process.env.PORT ?? "4023", 10);
const baseUrl = `http://127.0.0.1:${port}`;
const now = Date.now();
const proofRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-grow-agt-002-"));
const reportPath = process.env.NEXUS_GROW_AGT_002_REPORT_PATH ?? path.join(proofRoot, "report.json");
const screenshotPath = process.env.NEXUS_GROW_AGT_002_SCREENSHOT_PATH ?? path.join(proofRoot, "growth-social-campaign.png");

async function apiJson(pathname, { method = "GET", token = null, body = null, expected = null } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (expected && response.status !== expected) {
    throw new Error(`${method} ${pathname} expected ${expected}, got ${response.status}: ${text.slice(0, 800)}`);
  }
  if (!expected && !response.ok) {
    throw new Error(`${method} ${pathname} failed ${response.status}: ${text.slice(0, 800)}`);
  }
  return { status: response.status, payload };
}

async function main() {
  const projectService = new ProjectService({
    eventLogPath: path.join(proofRoot, "events.ndjson"),
  });
  const server = createServer(projectService, {
    runtimeId: "grow-agt-002-live-proof",
    healthStatus: { status: "healthy" },
    readinessStatus: { status: "ready" },
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

  try {
    const userId = `grow-social-user-${now}`;
    const signup = await apiJson("/api/auth/signup", {
      method: "POST",
      expected: 201,
      body: {
        userInput: {
          userId,
          email: `${userId}@example.test`,
          displayName: "בודק קמפיין",
        },
        credentials: { password: `secret-${now}` },
      },
    });
    const tokenBundle = signup.payload.authPayload.tokenBundle;
    const token = tokenBundle.accessToken;
    const projectId = `grow-social-leads-${now}`;

    await apiJson("/api/projects", {
      method: "POST",
      token,
      expected: 201,
      body: {
        id: projectId,
        name: "ניהול לידים וקמפיין",
        goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
        state: {
          artifactExpectation: { projectType: "internal-tool" },
          runtimeSkeletonTruth: {
            runtimeSkeletonId: `runtime-skeleton:${projectId}:internal-tool`,
            title: "ניהול לידים",
            productClass: "internal-tool",
          },
          productDomainSkeleton: { productDomainSkeletonId: `product-domain:${projectId}:internal-tool` },
          productOwnedBackendSkeleton: {
            productOwnedBackendSkeletonId: `product-owned-backend:${projectId}:internal-tool`,
            productionBackend: false,
          },
        },
      },
    });

    const afterDraft = await apiJson(`/api/projects/${projectId}/growth-agent`, {
      method: "POST",
      token,
      expected: 200,
      body: { userInput: "Create a three-day campaign for the lead management demo." },
    });
    if (!afterDraft.payload.socialCampaignExecutionAgent) {
      throw new Error(`growth-agent did not create social campaign truth: ${JSON.stringify({
        growthStatus: afterDraft.payload.growthAgent?.status,
        opportunityType: afterDraft.payload.growthAgent?.opportunityType,
        requiresAgent: afterDraft.payload.growthAgent?.requiresAgent,
        primaryPlugin: afterDraft.payload.growthAgent?.growthPluginLayer?.primaryPlugin?.pluginId,
        productTruth: {
          runtime: Boolean(afterDraft.payload.runtimeSkeletonTruth),
          domain: Boolean(afterDraft.payload.productDomainSkeleton),
          backend: Boolean(afterDraft.payload.productOwnedBackendSkeleton),
          stateRuntime: Boolean(afterDraft.payload.state?.runtimeSkeletonTruth),
        },
      }, null, 2)}`);
    }
    assert.equal(afterDraft.payload.socialCampaignExecutionAgent.taskId, "GROW-AGT-002");
    assert.equal(afterDraft.payload.socialCampaignExecutionAgent.status, "ready-for-approval");
    assert.equal(afterDraft.payload.socialCampaignExecutionAgent.sequence.length, 3);
    assert.equal(afterDraft.payload.socialCampaignExecutionAgent.externalExecutionPerformed, false);

    const needsProvider = await apiJson(`/api/projects/${projectId}/social-campaign-agent`, {
      method: "POST",
      token,
      expected: 200,
      body: { userInput: "Schedule this for Instagram." },
    });
    assert.equal(needsProvider.payload.socialCampaignExecutionAgent.status, "needs-provider");
    assert.equal(needsProvider.payload.socialCampaignExecutionAgent.externalExecutionPerformed, false);

    const needsApproval = await apiJson(`/api/projects/${projectId}/social-campaign-agent`, {
      method: "POST",
      token,
      expected: 200,
      body: {
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
      },
    });
    assert.equal(needsApproval.payload.socialCampaignExecutionAgent.status, "needs-approval");
    assert.equal(needsApproval.payload.socialCampaignExecutionAgent.externalExecutionPerformed, false);

    const scheduled = await apiJson(`/api/projects/${projectId}/social-campaign-agent`, {
      method: "POST",
      token,
      expected: 200,
      body: {
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
      },
    });
    assert.equal(scheduled.payload.socialCampaignExecutionAgent.status, "scheduled");
    assert.equal(scheduled.payload.socialCampaignExecutionAgent.externalExecutionPerformed, true);

    const blocked = await apiJson(`/api/projects/${projectId}/social-campaign-agent`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "Reply to everyone who comments.",
        providerConnection: {
          provider: "instagram",
          connected: true,
          scopes: ["reply"],
        },
      },
    });
    assert.equal(blocked.payload.socialCampaignExecutionAgent.status, "failed-safely");
    assert.equal(blocked.payload.socialCampaignExecutionAgent.externalExecutionPerformed, false);

    const tiktok = await apiJson(`/api/projects/${projectId}/social-campaign-agent`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "Publish this campaign on TikTok.",
        providerConnection: {
          provider: "tiktok",
          connected: true,
          scopes: ["publish"],
        },
        approvalDecisions: {
          postApprovals: [
            { postId: "post-1", provider: "tiktok", action: "publish", approved: true },
          ],
        },
      },
    });
    assert.equal(tiktok.payload.socialCampaignExecutionAgent.status, "ready-for-approval");
    assert.equal(tiktok.payload.socialCampaignExecutionAgent.externalExecutionPerformed, false);

    const results = await apiJson(`/api/projects/${projectId}/social-campaign-agent`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "Read Facebook results and comments.",
        providerConnection: {
          provider: "facebook",
          connected: true,
          scopes: ["read-results"],
        },
        approvalDecisions: {
          readResultsApproved: true,
        },
        providerResults: {
          metrics: { views: 19, clicks: 3 },
          comments: [
            { text: "ברור ומעניין" },
            { text: "המייל שלי test@example.com" },
          ],
        },
      },
    });
    assert.equal(results.payload.socialCampaignExecutionAgent.status, "results-received");
    assert.equal(results.payload.socialCampaignExecutionAgent.resultIntake.fabricatedMetricsBlocked, true);
    assert.equal(results.payload.socialCampaignExecutionAgent.resultIntake.commentsSummary.sensitiveExamplesHidden, true);

    const appUser = {
      userId,
      email: `${userId}@example.test`,
      displayName: "בודק קמפיין",
      tokenBundle,
    };
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript((storedUser) => {
      localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
    }, appUser);
    await page.goto(`${baseUrl}/growth?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-social-campaign-agent-task='GROW-AGT-002']", { timeout: 20_000 });
    const domState = await page.evaluate(() => {
      const root = document.querySelector("[data-social-campaign-agent-task='GROW-AGT-002']");
      const text = document.body.innerText || "";
      return {
        status: root?.getAttribute("data-social-campaign-agent-status"),
        provider: root?.getAttribute("data-social-campaign-provider"),
        externalExecuted: root?.getAttribute("data-social-campaign-external-executed"),
        perPostApproval: root?.getAttribute("data-social-campaign-per-post-approval"),
        fabricatedMetricsBlocked: root?.getAttribute("data-social-campaign-fabricated-metrics-blocked"),
        hasBlockedCopy: /חסום בשחרור הראשון/u.test(text),
        hasDraftOnlyProvider: /tiktok|linkedin|youtube|x/i.test(text),
        hasFakeSuccessClaim: /פורסם בהצלחה אוטומטית|ויראלי|הבאנו מכירות|guaranteed/i.test(text),
      };
    });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await browser.close();

    assert.equal(domState.status, "results-received");
    assert.equal(domState.provider, "facebook");
    assert.equal(domState.externalExecuted, "false");
    assert.equal(domState.perPostApproval, "true");
    assert.equal(domState.fabricatedMetricsBlocked, "true");
    assert.equal(domState.hasBlockedCopy, true);
    assert.equal(domState.hasDraftOnlyProvider, true);
    assert.equal(domState.hasFakeSuccessClaim, false);

    const restored = await apiJson(`/api/projects/${projectId}`, { token, expected: 200 });
    assert.equal(restored.payload.socialCampaignExecutionAgent.status, "results-received");
    assert.equal(restored.payload.state.socialCampaignExecutionAgent.status, "results-received");
    assert.equal(restored.payload.context.socialCampaignExecutionAgent.status, "results-received");

    const report = {
      taskId: "GROW-AGT-002",
      status: "passed",
      projectId,
      checkpoints: {
        draft: afterDraft.payload.socialCampaignExecutionAgent.status,
        needsProvider: needsProvider.payload.socialCampaignExecutionAgent.status,
        needsApproval: needsApproval.payload.socialCampaignExecutionAgent.status,
        approvedSchedule: scheduled.payload.socialCampaignExecutionAgent.status,
        forbiddenAction: blocked.payload.socialCampaignExecutionAgent.status,
        draftOnlyProvider: tiktok.payload.socialCampaignExecutionAgent.status,
        realResults: results.payload.socialCampaignExecutionAgent.status,
      },
      domState,
      reportPath,
      screenshotPath,
    };
    await fsPromises.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
