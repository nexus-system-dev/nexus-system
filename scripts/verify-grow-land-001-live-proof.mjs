import assert from "node:assert/strict";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

const port = Number.parseInt(process.env.PORT ?? "4027", 10);
const baseUrl = `http://127.0.0.1:${port}`;
const now = Date.now();
const proofRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-grow-land-001-"));
const reportPath = process.env.NEXUS_GROW_LAND_001_REPORT_PATH ?? path.join(proofRoot, "report.json");
const screenshotPath = process.env.NEXUS_GROW_LAND_001_SCREENSHOT_PATH ?? path.join(proofRoot, "growth-land.png");

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
    runtimeId: "grow-land-001-live-proof",
    healthStatus: { status: "healthy" },
    readinessStatus: { status: "ready" },
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

  try {
    const userId = `grow-land-user-${now}`;
    const signup = await apiJson("/api/auth/signup", {
      method: "POST",
      expected: 201,
      body: {
        userInput: {
          userId,
          email: `${userId}@example.test`,
          displayName: "בודק דף נחיתה",
        },
        credentials: { password: `secret-${now}` },
      },
    });
    const tokenBundle = signup.payload.authPayload.tokenBundle;
    const token = tokenBundle.accessToken;
    const projectId = `grow-land-leads-${now}`;

    await apiJson("/api/projects", {
      method: "POST",
      token,
      expected: 201,
      body: {
        id: projectId,
        name: "ניהול לידים ודף נחיתה",
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
          hypothesis: "מבקר יבין את הערך של דף הנחיתה.",
          result: "בודק אחד הבין את המסר.",
          accepted: true,
        },
        externalAction: {
          actionType: "landing-experiment-draft",
          draftOnly: true,
          successMetric: "מבקר אחד מבין את ההצעה.",
        },
      },
    });
    assert.equal(measurement.payload.growthMeasurementTruth.taskId, "GROW-MEASURE-001");

    const draft = await apiJson(`/api/projects/${projectId}/growth-agent`, {
      method: "POST",
      token,
      expected: 200,
      body: { userInput: "תכין דף נחיתה לבדיקה" },
    });
    assert.equal(draft.payload.landingActionPath.taskId, "GROW-LAND-001");
    if (draft.payload.landingActionPath.status !== "draft-ready") {
      throw new Error(`landing draft readiness failed: ${JSON.stringify({
        status: draft.payload.landingActionPath.status,
        missing: draft.payload.landingActionPath.readiness?.missing,
        productBasis: draft.payload.landingActionPath.productBasis,
        stateKeys: Object.keys(draft.payload.state ?? {}),
      }, null, 2)}`);
    }
    assert.equal(draft.payload.landingActionPath.status, "draft-ready");
    assert.equal(draft.payload.landingActionPath.visibility.publicVisible, false);
    assert.equal(draft.payload.landingActionPath.externalPublicationPerformed, false);

    const preview = await apiJson(`/api/projects/${projectId}/landing-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "פתח תצוגה מקדימה של דף הנחיתה",
        leadCapture: {
          storage: "nexus-experiment-leads",
          consentText: "אני מאשר/ת שיחזרו אליי לצורך בדיקת התאמה.",
        },
      },
    });
    assert.equal(preview.payload.landingActionPath.status, "preview-ready");
    assert.equal(preview.payload.landingActionPath.visibility.publicVisible, false);
    assert.equal(preview.payload.landingActionPath.leadCapture.consentConfigured, true);

    const blockedPublish = await apiJson(`/api/projects/${projectId}/landing-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: { userInput: "פרסם את דף הנחיתה" },
    });
    assert.equal(blockedPublish.payload.landingActionPath.status, "needs-share-or-release-gate");
    assert.equal(blockedPublish.payload.landingActionPath.externalPublicationPerformed, false);

    const mutationHandoff = await apiJson(`/api/projects/${projectId}/landing-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: { userInput: "שנה את ההבטחה והמחיר בדף הנחיתה" },
    });
    assert.equal(mutationHandoff.payload.landingActionPath.status, "handoff-to-mutation");
    assert.equal(mutationHandoff.payload.landingActionPath.handoffs.mutationRequiredForProductTruthChanges, true);

    const shared = await apiJson(`/api/projects/${projectId}/landing-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "שתף דמו של דף הנחיתה",
        shareDemoAgent: { status: "ready", shareId: "share-live" },
        approvalDecisions: {
          approvals: [{ action: "share-demo", approved: true }],
        },
      },
    });
    assert.equal(shared.payload.landingActionPath.status, "shared-demo-ready");
    assert.equal(shared.payload.landingActionPath.visibility.publicVisible, true);
    assert.equal(shared.payload.landingActionPath.externalPublicationPerformed, false);

    const results = await apiJson(`/api/projects/${projectId}/landing-action-path`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        userInput: "מה תוצאות דף הנחיתה",
        providerResults: { views: 10, clicks: 3, ctaClicks: 2, formSubmissions: 1, manualFeedbackCount: 1 },
      },
    });
    assert.equal(results.payload.landingActionPath.status, "results-received");
    assert.equal(results.payload.landingActionPath.measurement.resultTruthAvailable, true);
    assert.equal(results.payload.landingActionPath.measurement.fabricatedConversionDataBlocked, true);

    const appUser = {
      userId,
      email: `${userId}@example.test`,
      displayName: "בודק דף נחיתה",
      tokenBundle,
    };
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript((storedUser) => {
      localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
    }, appUser);
    await page.goto(`${baseUrl}/growth?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-landing-action-task='GROW-LAND-001']", { timeout: 20_000 });
    const domState = await page.evaluate(() => {
      const root = document.querySelector("[data-landing-action-task='GROW-LAND-001']");
      const text = root?.innerText || "";
      return {
        status: root?.getAttribute("data-landing-action-status"),
        language: root?.getAttribute("data-landing-action-language"),
        direction: root?.getAttribute("data-landing-action-direction"),
        publicVisible: root?.getAttribute("data-landing-action-public-visible"),
        externalPublished: root?.getAttribute("data-landing-action-external-published"),
        leadConsent: root?.getAttribute("data-landing-action-lead-consent"),
        productTruthOwner: root?.getAttribute("data-landing-action-product-truth-owner"),
        fabricatedResultsBlocked: root?.getAttribute("data-landing-action-fabricated-results-blocked"),
        hasNoFakeClaim: !/המרות מובטחות|לידים מובטחים|מכירות מובטחות|guaranteed|revenue|virality/i.test(text),
        hasBoundaryCopy: /דף נחיתה הוא נכס צמיחה פנימי/u.test(text),
      };
    });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await browser.close();

    assert.equal(domState.status, "results-received");
    assert.equal(domState.language, "he");
    assert.equal(domState.direction, "rtl");
    assert.equal(domState.publicVisible, "false");
    assert.equal(domState.externalPublished, "false");
    assert.equal(domState.leadConsent, "true");
    assert.equal(domState.productTruthOwner, "source-product-not-landing");
    assert.equal(domState.fabricatedResultsBlocked, "true");
    assert.equal(domState.hasNoFakeClaim, true);
    assert.equal(domState.hasBoundaryCopy, true);

    const restored = await apiJson(`/api/projects/${projectId}`, { token, expected: 200 });
    assert.equal(restored.payload.landingActionPath.status, "results-received");
    assert.equal(restored.payload.context.landingActionPath.status, "results-received");
    assert.equal(restored.payload.state.landingActionPath.status, "results-received");

    const report = {
      taskId: "GROW-LAND-001",
      projectId,
      reportPath,
      screenshotPath,
      statuses: {
        draft: draft.payload.landingActionPath.status,
        preview: preview.payload.landingActionPath.status,
        blockedPublish: blockedPublish.payload.landingActionPath.status,
        mutationHandoff: mutationHandoff.payload.landingActionPath.status,
        shared: shared.payload.landingActionPath.status,
        results: results.payload.landingActionPath.status,
      },
      domState,
      restoredStatus: restored.payload.landingActionPath.status,
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
