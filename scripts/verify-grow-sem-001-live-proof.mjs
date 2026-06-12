import assert from "node:assert/strict";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

const port = Number.parseInt(process.env.PORT ?? "4025", 10);
const baseUrl = `http://127.0.0.1:${port}`;
const now = Date.now();
const proofRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-grow-sem-001-"));
const reportPath = process.env.NEXUS_GROW_SEM_001_REPORT_PATH ?? path.join(proofRoot, "report.json");
const screenshotPath = process.env.NEXUS_GROW_SEM_001_SCREENSHOT_PATH ?? path.join(proofRoot, "growth-sem.png");

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
    runtimeId: "grow-sem-001-live-proof",
    healthStatus: { status: "healthy" },
    readinessStatus: { status: "ready" },
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

  try {
    const userId = `grow-sem-user-${now}`;
    const signup = await apiJson("/api/auth/signup", {
      method: "POST",
      expected: 201,
      body: {
        userInput: {
          userId,
          email: `${userId}@example.test`,
          displayName: "בודק SEM",
        },
        credentials: { password: `secret-${now}` },
      },
    });
    const tokenBundle = signup.payload.authPayload.tokenBundle;
    const token = tokenBundle.accessToken;
    const projectId = `grow-sem-leads-${now}`;

    await apiJson("/api/projects", {
      method: "POST",
      token,
      expected: 201,
      body: {
        id: projectId,
        name: "ניהול לידים ופרסום ממומן",
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
          hypothesis: "בודק יבין את המסר אחרי דמו קצר.",
          result: "בודק אחד הבין את המסר.",
          accepted: true,
        },
        externalAction: {
          actionType: "paid-test-draft",
          draftOnly: true,
          successMetric: "בודק מבין את המסר לפני הוצאה.",
        },
      },
    });
    assert.equal(measurement.payload.growthMeasurementTruth.taskId, "GROW-MEASURE-001");

    const draft = await apiJson(`/api/projects/${projectId}/growth-agent`, {
      method: "POST",
      token,
      expected: 200,
      body: { userInput: "תכין Google Ads בתקציב קטן" },
    });
    assert.equal(draft.payload.semActionPath.taskId, "GROW-SEM-001");
    assert.equal(draft.payload.semActionPath.status, "draft-only-provider-missing");
    assert.equal(draft.payload.semActionPath.externalSpendPerformed, false);
    assert.equal(draft.payload.semActionPath.budget.hardCapUsd, 50);

    const providerOnly = await apiJson(`/api/projects/${projectId}/sem-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "תפעיל את הקמפיין",
        providerConnection: {
          provider: "google-ads",
          connected: true,
          scopes: ["ad-draft"],
        },
      },
    });
    assert.equal(providerOnly.payload.semActionPath.status, "needs-provider-scope");
    assert.equal(providerOnly.payload.semActionPath.externalSpendPerformed, false);

    const missingApprovals = await apiJson(`/api/projects/${projectId}/sem-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "תפעיל את הקמפיין",
        providerConnection: {
          provider: "google-ads",
          connected: true,
          scopes: ["ad-draft", "spend-approval"],
        },
        approvalDecisions: {
          approvals: [{ action: "campaign", approved: true }],
        },
      },
    });
    assert.equal(missingApprovals.payload.semActionPath.status, "needs-separate-approvals");
    assert.equal(missingApprovals.payload.semActionPath.externalSpendPerformed, false);

    const ready = await apiJson(`/api/projects/${projectId}/sem-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "תפעיל את הקמפיין ב-Google Ads",
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
      },
    });
    assert.equal(ready.payload.semActionPath.status, "ready-for-provider-activation");
    assert.equal(ready.payload.semActionPath.activationPrepared, true);
    assert.equal(ready.payload.semActionPath.externalSpendPerformed, false);

    const paidSocial = await apiJson(`/api/projects/${projectId}/sem-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "תעשה boost לפוסט באינסטגרם בתקציב קטן",
        providerConnection: {
          provider: "instagram-ads",
          connected: true,
          scopes: ["ad-draft", "spend-approval"],
        },
      },
    });
    assert.equal(paidSocial.payload.semActionPath.status, "draft-only-provider");
    assert.equal(paidSocial.payload.semActionPath.handoffs.paidSocialRoutedToSem, true);
    assert.equal(paidSocial.payload.semActionPath.externalSpendPerformed, false);

    const safeStop = await apiJson(`/api/projects/${projectId}/sem-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "עצור את הקמפיין",
        providerConnection: {
          provider: "google-ads",
          connected: true,
          scopes: ["ad-draft", "spend-approval"],
        },
        safeStopSignal: { trigger: "high-cpc" },
      },
    });
    assert.equal(safeStop.payload.semActionPath.status, "stopped-safely");
    assert.equal(safeStop.payload.semActionPath.safeStop.adsModified, false);
    assert.equal(safeStop.payload.semActionPath.safeStop.budgetModified, false);

    const appUser = {
      userId,
      email: `${userId}@example.test`,
      displayName: "בודק SEM",
      tokenBundle,
    };
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript((storedUser) => {
      localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
    }, appUser);
    await page.goto(`${baseUrl}/growth?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-sem-action-task='GROW-SEM-001']", { timeout: 20_000 });
    const domState = await page.evaluate(() => {
      const root = document.querySelector("[data-sem-action-task='GROW-SEM-001']");
      const text = document.body.innerText || "";
      return {
        status: root?.getAttribute("data-sem-action-status"),
        provider: root?.getAttribute("data-sem-action-provider"),
        providerConnected: root?.getAttribute("data-sem-action-provider-connected"),
        spendScope: root?.getAttribute("data-sem-action-spend-scope"),
        budgetCap: root?.getAttribute("data-sem-action-budget-cap-enforced"),
        hardCap: root?.getAttribute("data-sem-action-hard-cap-usd"),
        externalSpend: root?.getAttribute("data-sem-action-external-spend"),
        safeStop: root?.getAttribute("data-sem-action-safe-stop"),
        safeStopAdsModified: root?.getAttribute("data-sem-action-safe-stop-ads-modified"),
        safeStopBudgetModified: root?.getAttribute("data-sem-action-safe-stop-budget-modified"),
        hasNoFakeClaim: !/לידים מובטחים|מכירות מובטחות|תנועה מובטחת|guaranteed|profit/i.test(text),
        hasProviderBoundary: /חיבור ספק אינו הרשאת הוצאה/u.test(text),
      };
    });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await browser.close();

    assert.equal(domState.status, "stopped-safely");
    assert.equal(domState.provider, "google-ads");
    assert.equal(domState.providerConnected, "true");
    assert.equal(domState.spendScope, "true");
    assert.equal(domState.budgetCap, "true");
    assert.equal(domState.hardCap, "50");
    assert.equal(domState.externalSpend, "false");
    assert.equal(domState.safeStop, "true");
    assert.equal(domState.safeStopAdsModified, "false");
    assert.equal(domState.safeStopBudgetModified, "false");
    assert.equal(domState.hasNoFakeClaim, true);
    assert.equal(domState.hasProviderBoundary, true);

    const restored = await apiJson(`/api/projects/${projectId}`, { token, expected: 200 });
    assert.equal(restored.payload.semActionPath.status, "stopped-safely");
    assert.equal(restored.payload.state.semActionPath.status, "stopped-safely");
    assert.equal(restored.payload.context.semActionPath.status, "stopped-safely");

    const report = {
      taskId: "GROW-SEM-001",
      status: "passed",
      projectId,
      checkpoints: {
        draft: draft.payload.semActionPath.status,
        providerOnly: providerOnly.payload.semActionPath.status,
        missingApprovals: missingApprovals.payload.semActionPath.status,
        ready: ready.payload.semActionPath.status,
        paidSocial: paidSocial.payload.semActionPath.status,
        safeStop: safeStop.payload.semActionPath.status,
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
