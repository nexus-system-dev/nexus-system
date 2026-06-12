import assert from "node:assert/strict";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

const port = Number.parseInt(process.env.PORT ?? "4024", 10);
const baseUrl = `http://127.0.0.1:${port}`;
const now = Date.now();
const proofRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-grow-seo-001-"));
const reportPath = process.env.NEXUS_GROW_SEO_001_REPORT_PATH ?? path.join(proofRoot, "report.json");
const screenshotPath = process.env.NEXUS_GROW_SEO_001_SCREENSHOT_PATH ?? path.join(proofRoot, "growth-seo.png");

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
    runtimeId: "grow-seo-001-live-proof",
    healthStatus: { status: "healthy" },
    readinessStatus: { status: "ready" },
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

  try {
    const userId = `grow-seo-user-${now}`;
    const signup = await apiJson("/api/auth/signup", {
      method: "POST",
      expected: 201,
      body: {
        userInput: {
          userId,
          email: `${userId}@example.test`,
          displayName: "בודק SEO",
        },
        credentials: { password: `secret-${now}` },
      },
    });
    const tokenBundle = signup.payload.authPayload.tokenBundle;
    const token = tokenBundle.accessToken;
    const projectId = `grow-seo-leads-${now}`;

    await apiJson("/api/projects", {
      method: "POST",
      token,
      expected: 201,
      body: {
        id: projectId,
        name: "ניהול לידים ו-SEO",
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

    const draft = await apiJson(`/api/projects/${projectId}/growth-agent`, {
      method: "POST",
      token,
      expected: 200,
      body: { userInput: "תכין SEO לעמוד הזה בעברית" },
    });
    assert.equal(draft.payload.seoActionPath.taskId, "GROW-SEO-001");
    assert.equal(draft.payload.seoActionPath.status, "draft-ready");
    assert.equal(draft.payload.seoActionPath.productBasis.direction, "rtl");
    assert.equal(draft.payload.seoActionPath.externalPublicationPerformed, false);

    const needsApproval = await apiJson(`/api/projects/${projectId}/seo-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: { userInput: "apply SEO updates" },
    });
    assert.equal(needsApproval.payload.seoActionPath.status, "needs-approval");
    assert.equal(needsApproval.payload.seoActionPath.visiblePageUpdated, false);

    const applied = await apiJson(`/api/projects/${projectId}/seo-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "apply SEO updates",
        approvalDecisions: {
          approvals: [
            { action: "apply-seo", approved: true },
          ],
        },
      },
    });
    assert.equal(applied.payload.seoActionPath.status, "applied-to-visual-build");
    assert.equal(applied.payload.seoActionPath.visiblePageUpdated, true);
    assert.equal(applied.payload.seoActionPath.externalPublicationPerformed, false);

    const publicGate = await apiJson(`/api/projects/${projectId}/seo-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: { userInput: "publish this SEO page publicly" },
    });
    assert.equal(publicGate.payload.seoActionPath.status, "needs-share-or-release");
    assert.equal(publicGate.payload.seoActionPath.externalPublicationPerformed, false);

    const missingProvider = await apiJson(`/api/projects/${projectId}/seo-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "show Search Console rankings and search volume",
        searchConsoleConnection: { connected: false },
      },
    });
    assert.equal(missingProvider.payload.seoActionPath.status, "draft-mode-search-console-missing");
    assert.equal(missingProvider.payload.seoActionPath.providerTruth.realProviderDataAvailable, false);
    assert.equal(missingProvider.payload.seoActionPath.providerTruth.searchVolumeIsHypothesis, true);

    const withProvider = await apiJson(`/api/projects/${projectId}/seo-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
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
      },
    });
    assert.equal(withProvider.payload.seoActionPath.status, "draft-ready-with-provider-data");
    assert.equal(withProvider.payload.seoActionPath.providerTruth.realProviderDataAvailable, true);

    const appUser = {
      userId,
      email: `${userId}@example.test`,
      displayName: "בודק SEO",
      tokenBundle,
    };
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript((storedUser) => {
      localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
    }, appUser);
    await page.goto(`${baseUrl}/growth?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-seo-action-task='GROW-SEO-001']", { timeout: 20_000 });
    const domState = await page.evaluate(() => {
      const root = document.querySelector("[data-seo-action-task='GROW-SEO-001']");
      const text = document.body.innerText || "";
      return {
        status: root?.getAttribute("data-seo-action-status"),
        language: root?.getAttribute("data-seo-action-language"),
        direction: root?.getAttribute("data-seo-action-direction"),
        realProviderData: root?.getAttribute("data-seo-action-real-provider-data"),
        hypothesis: root?.getAttribute("data-seo-action-search-volume-hypothesis"),
        publicPublished: root?.getAttribute("data-seo-action-external-published"),
        hasHebrewTitle: /ניהול לידים/u.test(text),
        hasNoFakeClaim: !/מקום ראשון|תנועה מובטחת|מכירות מובטחות|guaranteed|first page/i.test(text),
        hasHypothesisBoundary: /נשארים השערה/u.test(text),
      };
    });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await browser.close();

    assert.equal(domState.status, "draft-ready-with-provider-data");
    assert.equal(domState.language, "he");
    assert.equal(domState.direction, "rtl");
    assert.equal(domState.realProviderData, "true");
    assert.equal(domState.publicPublished, "false");
    assert.equal(domState.hasHebrewTitle, true);
    assert.equal(domState.hasNoFakeClaim, true);
    assert.equal(domState.hasHypothesisBoundary, true);

    const restored = await apiJson(`/api/projects/${projectId}`, { token, expected: 200 });
    assert.equal(restored.payload.seoActionPath.status, "draft-ready-with-provider-data");
    assert.equal(restored.payload.state.seoActionPath.status, "draft-ready-with-provider-data");
    assert.equal(restored.payload.context.seoActionPath.status, "draft-ready-with-provider-data");

    const report = {
      taskId: "GROW-SEO-001",
      status: "passed",
      projectId,
      checkpoints: {
        draft: draft.payload.seoActionPath.status,
        needsApproval: needsApproval.payload.seoActionPath.status,
        applied: applied.payload.seoActionPath.status,
        publicGate: publicGate.payload.seoActionPath.status,
        missingProvider: missingProvider.payload.seoActionPath.status,
        withProvider: withProvider.payload.seoActionPath.status,
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
