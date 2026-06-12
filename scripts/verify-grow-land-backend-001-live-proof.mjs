import assert from "node:assert/strict";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

const port = Number.parseInt(process.env.PORT ?? "4028", 10);
const baseUrl = `http://127.0.0.1:${port}`;
const now = Date.now();
const proofRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-grow-land-backend-001-"));
const reportPath = process.env.NEXUS_GROW_LAND_BACKEND_001_REPORT_PATH ?? path.join(proofRoot, "report.json");
const screenshotPath = process.env.NEXUS_GROW_LAND_BACKEND_001_SCREENSHOT_PATH ?? path.join(proofRoot, "growth-land-backend.png");

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
    runtimeId: "grow-land-backend-001-live-proof",
    healthStatus: { status: "healthy" },
    readinessStatus: { status: "ready" },
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

  try {
    const userId = `grow-land-backend-user-${now}`;
    const signup = await apiJson("/api/auth/signup", {
      method: "POST",
      expected: 201,
      body: {
        userInput: {
          userId,
          email: `${userId}@example.test`,
          displayName: "בודק בקאנד דף נחיתה",
        },
        credentials: { password: `secret-${now}` },
      },
    });
    const token = signup.payload.authPayload.tokenBundle.accessToken;
    const projectId = `grow-land-backend-leads-${now}`;

    await apiJson("/api/projects", {
      method: "POST",
      token,
      expected: 201,
      body: {
        id: projectId,
        name: "ניהול לידים ודף נחיתה עצמאי",
        goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
        targetAudience: "בעלי עסקים שמאבדים לידים בגלל חוסר מעקב",
        problem: "אין בעלות ברורה על ליד ואין תזכורת לצעד הבא.",
        coreValue: "לראות מי אחראי, מתי חוזרים ומה הצעד הבא.",
        productDirection: "internal-tool",
        state: {
          artifactExpectation: { projectType: "internal-tool" },
          targetAudience: "בעלי עסקים שמאבדים לידים בגלל חוסר מעקב",
          problem: "אין בעלות ברורה על ליד ואין תזכורת לצעד הבא.",
          coreValue: "לראות מי אחראי, מתי חוזרים ומה הצעד הבא.",
          productDirection: "internal-tool",
          runtimeSkeletonTruth: {
            runtimeSkeletonId: `runtime-skeleton:${projectId}:internal-tool`,
            title: "ניהול לידים",
            productClass: "internal-tool",
          },
          productDomainSkeleton: { productDomainSkeletonId: `product-domain:${projectId}:internal-tool` },
          productOwnedBackendSkeleton: {
            productOwnedBackendSkeletonId: `product-owned-backend:${projectId}:internal-tool`,
            artifactRoot: `nexus-projects/${userId}/${projectId}/product`,
            productionBackend: false,
            models: [],
            persistence: { state: { records: [] } },
            apiBoundary: { endpoints: [] },
          },
        },
      },
    });

    const draft = await apiJson(`/api/projects/${projectId}/landing-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "תכין דף נחיתה לבדיקה",
      },
    });
    assert.equal(draft.payload.landingActionPath.status, "draft-ready");
    assert.equal(draft.payload.landingBackendSync.taskId, "GROW-LAND-BACKEND-001");
    assert.equal(draft.payload.landingBackendSync.status, "package-contract-ready");
    assert.equal(draft.payload.landingBackendSync.storageStatus, "product-owned-local-mock");
    assert.equal(draft.payload.landingBackendSync.packageContract.environment.consumedBy.includes("STANDALONE-ARTIFACT-001"), true);
    assert.equal(draft.payload.landingBackendSync.externalCaptureAllowed, false);

    const submitted = await apiJson(`/api/projects/${projectId}/landing-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "שלח ליד מדף הנחיתה",
        leadSubmission: {
          leadId: "live-lead-1",
          name: "נועה",
          email: "noa@example.test",
          need: "מעקב אחרי לידים",
          consent: true,
          source: "landing-page",
        },
      },
    });
    assert.equal(submitted.payload.landingBackendSync.status, "synced");
    assert.equal(submitted.payload.landingBackendSync.leads.length, 1);
    assert.equal(submitted.payload.landingBackendSync.productBackendLeadMirror.length, 1);
    assert.equal(submitted.payload.productOwnedBackendSkeleton.persistence.state.landingLeads.length, 1);
    assert.equal(
      submitted.payload.productOwnedBackendSkeleton.apiBoundary.endpoints.some((endpoint) => endpoint.operationId === "landing.lead.create"),
      true,
    );
    assert.equal(submitted.payload.landingBackendSync.releaseGate.externalCaptureBlocked, true);

    const blockedPublish = await apiJson(`/api/projects/${projectId}/landing-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "פרסם את דף הנחיתה ותאסוף לידים",
        approvalDecisions: {
          approvals: [
            { action: "release", approved: true },
            { action: "external-visibility", approved: true },
          ],
        },
        releaseGate: { status: "ready", releaseGateId: "release-1" },
      },
    });
    assert.equal(blockedPublish.payload.landingActionPath.status, "release-handoff-ready");
    assert.equal(blockedPublish.payload.landingBackendSync.externalCaptureAllowed, false);
    assert.equal(blockedPublish.payload.landingBackendSync.releaseGate.externalCaptureBlocked, true);

    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
    await page.context().addCookies([
      {
        name: "nexus_access_token",
        value: token,
        domain: "127.0.0.1",
        path: "/",
        httpOnly: false,
        sameSite: "Lax",
      },
    ]);
    await page.addInitScript((appUser) => {
      window.localStorage.setItem("nexus.appUser", JSON.stringify(appUser));
    }, {
      userId,
      email: `${userId}@example.test`,
      displayName: "בודק בקאנד דף נחיתה",
      tokenBundle: signup.payload.authPayload.tokenBundle,
      sessionState: signup.payload.authPayload.sessionState,
    });
    await page.goto(`${baseUrl}/growth?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-landing-backend-task='GROW-LAND-BACKEND-001']", { timeout: 15000 });
    const domState = await page.$eval("[data-landing-backend-task='GROW-LAND-BACKEND-001']", (node) => ({
      status: node.getAttribute("data-landing-backend-status"),
      storage: node.getAttribute("data-landing-backend-storage"),
      artifactBoundary: node.getAttribute("data-landing-backend-artifact-boundary"),
      production: node.getAttribute("data-landing-backend-production"),
      standaloneReady: node.getAttribute("data-landing-backend-standalone-ready"),
      externalAllowed: node.getAttribute("data-landing-backend-external-capture-allowed"),
      externalBlocked: node.getAttribute("data-landing-backend-external-capture-blocked"),
      leadCount: node.getAttribute("data-landing-backend-lead-count"),
      productLeadCount: node.getAttribute("data-landing-backend-product-lead-count"),
      syncDirection: node.getAttribute("data-landing-backend-sync-direction"),
      text: node.innerText,
    }));
    assert.equal(domState.status, "synced");
    assert.equal(domState.storage, "product-owned-local-mock");
    assert.equal(domState.artifactBoundary, "package-contract-ready");
    assert.equal(domState.production, "false");
    assert.equal(domState.standaloneReady, "false");
    assert.equal(domState.externalAllowed, "false");
    assert.equal(domState.externalBlocked, "true");
    assert.equal(domState.leadCount, "1");
    assert.equal(domState.productLeadCount, "1");
    assert.equal(domState.syncDirection, "landing-to-product");
    assert.match(domState.text, /ליד נשמר וסונכרן למוצר/);
    assert.match(domState.text, /זה עדיין לא בקאנד ייצור/);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await browser.close();

    const restored = await apiJson(`/api/projects/${projectId}`, {
      token,
      expected: 200,
    });
    assert.equal(restored.payload.landingBackendSync.status, "synced");
    assert.equal(restored.payload.landingBackendSync.leads.length, 1);
    assert.equal(restored.payload.landingBackendSync.productBackendLeadMirror.length, 1);
    assert.equal(restored.payload.productOwnedBackendSkeleton.persistence.state.landingLeads.length, 1);

    const report = {
      taskId: "GROW-LAND-BACKEND-001",
      projectId,
      reportPath,
      screenshotPath,
      backend: {
        status: restored.payload.landingBackendSync.status,
        storageStatus: restored.payload.landingBackendSync.storageStatus,
        artifactBoundaryStatus: restored.payload.landingBackendSync.artifactBoundaryStatus,
        productionBackend: restored.payload.landingBackendSync.productionBackend,
        standaloneReady: restored.payload.landingBackendSync.standaloneReady,
        externalCaptureAllowed: restored.payload.landingBackendSync.externalCaptureAllowed,
        leadCount: restored.payload.landingBackendSync.leads.length,
        productBackendLeadCount: restored.payload.landingBackendSync.productBackendLeadMirror.length,
        productBackendStateLeadCount: restored.payload.productOwnedBackendSkeleton.persistence.state.landingLeads.length,
      },
      domState,
    };
    await fsPromises.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
