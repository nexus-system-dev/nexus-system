import assert from "node:assert/strict";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

const port = Number.parseInt(process.env.PORT ?? "4026", 10);
const baseUrl = `http://127.0.0.1:${port}`;
const now = Date.now();
const proofRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-grow-email-001-"));
const reportPath = process.env.NEXUS_GROW_EMAIL_001_REPORT_PATH ?? path.join(proofRoot, "report.json");
const screenshotPath = process.env.NEXUS_GROW_EMAIL_001_SCREENSHOT_PATH ?? path.join(proofRoot, "growth-email.png");

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
    runtimeId: "grow-email-001-live-proof",
    healthStatus: { status: "healthy" },
    readinessStatus: { status: "ready" },
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

  try {
    const userId = `grow-email-user-${now}`;
    const signup = await apiJson("/api/auth/signup", {
      method: "POST",
      expected: 201,
      body: {
        userInput: {
          userId,
          email: `${userId}@example.test`,
          displayName: "בודק אימייל",
        },
        credentials: { password: `secret-${now}` },
      },
    });
    const tokenBundle = signup.payload.authPayload.tokenBundle;
    const token = tokenBundle.accessToken;
    const projectId = `grow-email-leads-${now}`;

    await apiJson("/api/projects", {
      method: "POST",
      token,
      expected: 201,
      body: {
        id: projectId,
        name: "ניהול לידים ואימייל",
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

    const measurement = await apiJson(`/api/projects/${projectId}/growth-measurement`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        record: {
          sourceType: "manual",
          hypothesis: "נמען בדיקה יבין את המסר.",
          result: "בודק אחד הבין את המסר.",
          accepted: true,
        },
        externalAction: {
          actionType: "email-draft",
          draftOnly: true,
          successMetric: "נמען בדיקה אחד מבין את ההצעה.",
        },
      },
    });
    assert.equal(measurement.payload.growthMeasurementTruth.taskId, "GROW-MEASURE-001");

    const draft = await apiJson(`/api/projects/${projectId}/growth-agent`, {
      method: "POST",
      token,
      expected: 200,
      body: { userInput: "תכין רצף מיילים קצר" },
    });
    assert.equal(draft.payload.emailActionPath.taskId, "GROW-EMAIL-001");
    assert.equal(draft.payload.emailActionPath.status, "sequence-draft-ready");
    assert.equal(draft.payload.emailActionPath.sendTruth.externalSendPerformed, false);
    assert.equal(draft.payload.emailActionPath.sendTruth.fullAudienceSendDefault, false);

    const missingAudience = await apiJson(`/api/projects/${projectId}/email-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "שלח את המייל לרשימה",
        providerConnection: {
          provider: "mailchimp",
          connected: true,
          scopes: ["email-draft", "test-send", "send"],
        },
      },
    });
    assert.equal(missingAudience.payload.emailActionPath.status, "needs-audience-source");
    assert.equal(missingAudience.payload.emailActionPath.sendTruth.externalSendPerformed, false);

    const testSend = await apiJson(`/api/projects/${projectId}/email-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "שליחת בדיקה בג׳ימייל",
        providerConnection: {
          provider: "gmail",
          connected: true,
          scopes: ["email-draft", "test-send"],
        },
        approvalDecisions: {
          approvals: [{ action: "test-send", approved: true }],
        },
      },
    });
    assert.equal(testSend.payload.emailActionPath.status, "test-send-ready");
    assert.equal(testSend.payload.emailActionPath.sendTruth.testSendPrepared, true);
    assert.equal(testSend.payload.emailActionPath.sendTruth.externalSendPerformed, false);

    const gmailBroad = await apiJson(`/api/projects/${projectId}/email-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "שלח קמפיין רחב בג׳ימייל לרשימה",
        providerConnection: {
          provider: "gmail",
          connected: true,
          scopes: ["email-draft", "test-send", "send"],
        },
        audienceInput: {
          source: "waitlist",
          lawfulBasis: "explicit signup",
          ownershipConfirmed: true,
          permissionConfirmed: true,
          addresses: ["a@example.com"],
        },
      },
    });
    assert.equal(gmailBroad.payload.emailActionPath.status, "gmail-broad-campaign-blocked");
    assert.equal(gmailBroad.payload.emailActionPath.sendTruth.externalSendPerformed, false);

    const ready = await apiJson(`/api/projects/${projectId}/email-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "שלח את המייל לרשימה דרך SendGrid",
        providerConnection: {
          provider: "sendgrid",
          connected: true,
          scopes: ["email-draft", "test-send", "send", "read-results"],
        },
        audienceInput: {
          source: "waitlist",
          lawfulBasis: "explicit signup",
          ownershipConfirmed: true,
          permissionConfirmed: true,
          addresses: ["first@example.com", "second@example.com", "second@example.com", "bad-address"],
        },
        approvalDecisions: {
          approvals: [
            { action: "campaign", approved: true },
            { action: "content", approved: true },
            { action: "audience-source", approved: true },
            { action: "send", approved: true },
          ],
        },
      },
    });
    assert.equal(ready.payload.emailActionPath.status, "one-email-send-ready");
    assert.equal(ready.payload.emailActionPath.audienceTruth.cleanedCount, 2);
    assert.equal(ready.payload.emailActionPath.audienceTruth.duplicateCount, 1);
    assert.equal(ready.payload.emailActionPath.audienceTruth.invalidCount, 1);
    assert.equal(ready.payload.emailActionPath.sendTruth.sequenceSendReadyCount, 1);
    assert.equal(ready.payload.emailActionPath.sendTruth.externalSendPerformed, false);

    const results = await apiJson(`/api/projects/${projectId}/email-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "מה תוצאות המייל",
        providerConnection: {
          provider: "sendgrid",
          connected: true,
          scopes: ["read-results"],
        },
        providerResults: { sent: 2, opened: 1, clicks: 1, replies: 0, campaignStatus: "sent" },
      },
    });
    assert.equal(results.payload.emailActionPath.status, "results-received");
    assert.equal(results.payload.emailActionPath.resultTruth.providerResultsAvailable, true);
    assert.equal(results.payload.emailActionPath.resultTruth.metricsFabricated, false);

    const appUser = {
      userId,
      email: `${userId}@example.test`,
      displayName: "בודק אימייל",
      tokenBundle,
    };
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript((storedUser) => {
      localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
    }, appUser);
    await page.goto(`${baseUrl}/growth?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-email-action-task='GROW-EMAIL-001']", { timeout: 20_000 });
    const domState = await page.evaluate(() => {
      const root = document.querySelector("[data-email-action-task='GROW-EMAIL-001']");
      const text = document.body.innerText || "";
      return {
        status: root?.getAttribute("data-email-action-status"),
        provider: root?.getAttribute("data-email-action-provider"),
        providerConnected: root?.getAttribute("data-email-action-provider-connected"),
        externalSend: root?.getAttribute("data-email-action-external-send"),
        perEmailApproval: root?.getAttribute("data-email-action-per-email-approval"),
        fullAudienceDefault: root?.getAttribute("data-email-action-full-audience-default"),
        fabricatedMetricsBlocked: root?.getAttribute("data-email-action-fabricated-metrics-blocked"),
        metricsFabricated: root?.getAttribute("data-email-action-metrics-fabricated"),
        hasNoFakeClaim: !/פתיחות מובטחות|תגובות מובטחות|לידים מובטחים|מכירות מובטחות|guaranteed/i.test(text),
        hasPerEmailBoundary: /כל אימייל אמיתי דורש אישור נפרד/u.test(text),
      };
    });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await browser.close();

    assert.equal(domState.status, "results-received");
    assert.equal(domState.provider, "sendgrid");
    assert.equal(domState.providerConnected, "true");
    assert.equal(domState.externalSend, "false");
    assert.equal(domState.perEmailApproval, "true");
    assert.equal(domState.fullAudienceDefault, "false");
    assert.equal(domState.fabricatedMetricsBlocked, "true");
    assert.equal(domState.metricsFabricated, "false");
    assert.equal(domState.hasNoFakeClaim, true);
    assert.equal(domState.hasPerEmailBoundary, true);

    const restored = await apiJson(`/api/projects/${projectId}`, { token, expected: 200 });
    assert.equal(restored.payload.emailActionPath.status, "results-received");
    assert.equal(restored.payload.context.emailActionPath.status, "results-received");
    assert.equal(restored.payload.state.emailActionPath.status, "results-received");

    const report = {
      taskId: "GROW-EMAIL-001",
      projectId,
      reportPath,
      screenshotPath,
      statuses: {
        draft: draft.payload.emailActionPath.status,
        missingAudience: missingAudience.payload.emailActionPath.status,
        testSend: testSend.payload.emailActionPath.status,
        gmailBroad: gmailBroad.payload.emailActionPath.status,
        ready: ready.payload.emailActionPath.status,
        results: results.payload.emailActionPath.status,
      },
      domState,
      restoredStatus: restored.payload.emailActionPath.status,
    };
    await fsPromises.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
