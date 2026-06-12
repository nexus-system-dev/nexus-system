import assert from "node:assert/strict";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

const port = Number.parseInt(process.env.PORT ?? "4031", 10);
const baseUrl = `http://127.0.0.1:${port}`;
const now = Date.now();
const proofRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-exp-006-"));
const reportPath = process.env.NEXUS_EXP_006_REPORT_PATH ?? path.join(proofRoot, "report.json");
const screenshotPath = process.env.NEXUS_EXP_006_SCREENSHOT_PATH ?? null;

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

async function signup() {
  const userId = `exp006-user-${now}`;
  const signupResult = await apiJson("/api/auth/signup", {
    method: "POST",
    expected: 201,
    body: {
      userInput: {
        userId,
        email: `${userId}@example.test`,
        displayName: "בודק צמיחה אחרי מוצר",
      },
      credentials: { password: `secret-${now}` },
    },
  });
  const tokenBundle = signupResult.payload?.authPayload?.tokenBundle;
  assert.ok(tokenBundle?.accessToken, "signup must return an access token");
  return {
    userId,
    tokenBundle,
    appUser: {
      userId,
      email: `${userId}@example.test`,
      displayName: "בודק צמיחה אחרי מוצר",
      tokenBundle,
      sessionState: signupResult.payload.authPayload.sessionState,
    },
  };
}

async function createNoProductProject(token) {
  const projectId = `exp006-no-product-${now}`;
  await apiJson("/api/projects", {
    method: "POST",
    token,
    expected: 201,
    body: {
      id: projectId,
      name: "רעיון לא בשל",
      goal: "אולי לבנות משהו לעסקים בהמשך",
      state: {},
    },
  });
  return projectId;
}

async function createProductProject(token, userId) {
  const projectId = `exp006-product-${now}`;
  await apiJson("/api/projects", {
    method: "POST",
    token,
    expected: 201,
    body: {
      id: projectId,
      name: "ניהול לידים אחרי שיחות",
      goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
      targetAudience: "בעלי עסקים שמקבלים לידים משיחות ומוואטסאפ",
      problem: "אין בעלות ברורה על ליד ואין תזכורת לצעד הבא.",
      coreValue: "לראות מי אחראי, מתי חוזרים ומה הצעד הבא.",
      artifactExpectation: {
        projectType: "internal-tool",
        deliverableLabel: "שלד ניהול לידים",
      },
      state: {
        targetAudience: "בעלי עסקים שמקבלים לידים משיחות ומוואטסאפ",
        problem: "אין בעלות ברורה על ליד ואין תזכורת לצעד הבא.",
        coreValue: "לראות מי אחראי, מתי חוזרים ומה הצעד הבא.",
        artifactExpectation: {
          projectType: "internal-tool",
          deliverableLabel: "שלד ניהול לידים",
        },
        runtimeSkeletonTruth: {
          runtimeSkeletonId: `runtime-skeleton:${projectId}:internal-tool`,
          title: "ניהול לידים אחרי שיחות",
          productClass: "internal-tool",
        },
        productDomainSkeleton: {
          productDomainSkeletonId: `product-domain:${projectId}:internal-tool`,
          domainModel: "lead-management",
        },
        productOwnedBackendSkeleton: {
          productOwnedBackendSkeletonId: `product-owned-backend:${projectId}:internal-tool`,
          artifactRoot: `nexus-projects/${userId}/${projectId}/product`,
          productionBackend: false,
          persistence: { state: { records: [] } },
          apiBoundary: { endpoints: [] },
        },
      },
    },
  });
  return projectId;
}

async function runGrowth(token, projectId, userInput) {
  const result = await apiJson(`/api/projects/${projectId}/growth-agent`, {
    method: "POST",
    token,
    expected: 200,
    body: { userInput },
  });
  return result.payload?.project ?? result.payload;
}

function getGrowthAgent(project) {
  return project.growthAgent ?? project.context?.growthAgent ?? project.state?.growthAgent ?? null;
}

function getPluginLayer(project) {
  return getGrowthAgent(project)?.growthPluginLayer ?? null;
}

async function readDom(page) {
  return page.evaluate(() => {
    const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) ?? null;
    const exists = (selector) => Boolean(document.querySelector(selector));
    const text = document.body.innerText || "";
    return {
      url: location.href,
      surfaceContract: attr("[data-growth-surface-contract]", "data-growth-surface-contract"),
      agentTask: attr("[data-growth-surface-contract]", "data-growth-agent-task"),
      agentCanRun: attr("[data-growth-surface-contract]", "data-growth-agent-can-run"),
      pluginTask: attr("[data-growth-plugin-task]", "data-growth-plugin-task"),
      registryTask: attr("[data-growth-plugin-registry-task]", "data-growth-plugin-registry-task"),
      registryCount: attr("[data-growth-plugin-registry-task]", "data-growth-plugin-registry-count"),
      measurementTask: attr("[data-growth-measurement-task]", "data-growth-measurement-task"),
      socialTask: attr("[data-social-campaign-agent-task]", "data-social-campaign-agent-task"),
      seoTask: attr("[data-seo-action-task]", "data-seo-action-task"),
      semTask: attr("[data-sem-action-task]", "data-sem-action-task"),
      emailTask: attr("[data-email-action-task]", "data-email-action-task"),
      landingTask: attr("[data-landing-action-task]", "data-landing-action-task"),
      landingBackendTask: attr("[data-landing-backend-task]", "data-landing-backend-task"),
      hasGrowthRegions: [
        "growth-readiness-gate",
        "product-connected-growth-insights",
        "bounded-opportunity-list",
        "growth-metric-baseline",
        "experiment-next-move",
        "post-release-continuity-anchor",
      ].every((region) => exists(`[data-growth-region='${region}']`)),
      hasFakeOutcomeClaim: /viral|revenue-driving|משתמשים אמיתיים הגיעו|הקמפיין הצליח|הכנסנו כסף|הרווחנו|ויראלי/u.test(text),
      hasMarketplaceLeak: /plugin marketplace|marketplace|שוק תוספים/u.test(text),
    };
  });
}

async function main() {
  const projectService = new ProjectService({
    eventLogPath: path.join(proofRoot, "events.ndjson"),
  });
  const server = createServer(projectService, {
    runtimeId: "exp-006-live-proof",
    healthStatus: { status: "healthy" },
    readinessStatus: { status: "ready" },
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

  try {
    const { userId, tokenBundle, appUser } = await signup();
    const token = tokenBundle.accessToken;

    console.log("EXP-006 proof: checking growth before product truth");
    const noProductProjectId = await createNoProductProject(token);
    const noProductRecord = projectService.projects.get(noProductProjectId);
    assert.ok(noProductRecord, "no-product proof project must exist");
    delete noProductRecord.runtimeSkeletonTruth;
    delete noProductRecord.productDomainSkeleton;
    delete noProductRecord.productOwnedBackendSkeleton;
    delete noProductRecord.shareDemoAgent;
    delete noProductRecord.releaseWorkspace;
    for (const container of [noProductRecord.context, noProductRecord.state]) {
      if (!container || typeof container !== "object") continue;
      delete container.runtimeSkeletonTruth;
      delete container.productDomainSkeleton;
      delete container.productOwnedBackendSkeleton;
      delete container.shareDemoAgent;
      delete container.releaseWorkspace;
    }
    projectService.persistProjectRecord(noProductRecord);
    const noProduct = await runGrowth(token, noProductProjectId, "תציע צמיחה למוצר");
    const noProductAgent = getGrowthAgent(noProduct);
    assert.equal(noProductAgent.taskId, "GROW-AGT-001");
    assert.equal(noProductAgent.status, "needs-product-first");
    assert.equal(noProductAgent.readiness.canRunGrowth, false);
    assert.equal(noProductAgent.productTruthAvailable, false);

    console.log("EXP-006 proof: checking product-connected growth paths");
    const productProjectId = await createProductProject(token, userId);
    const cases = [
      ["תכין קמפיין קטן לאישור", "social-campaign-draft", "socialCampaignExecutionAgent", "GROW-AGT-002"],
      ["תכין SEO לעמוד", "seo-page-draft", "seoActionPath", "GROW-SEO-001"],
      ["תכין בדיקת מודעות עם תקציב קטן", "paid-test-draft", "semActionPath", "GROW-SEM-001"],
      ["תכין מייל ראשון ללקוחות", "email-draft", "emailActionPath", "GROW-EMAIL-001"],
      ["תכין דף נחיתה לבדיקה", "landing-experiment-draft", "landingActionPath", "GROW-LAND-001"],
      ["תגדיר מדידה קטנה", "measurement-plan", "growthMeasurementTruth", "GROW-MEASURE-001"],
    ];
    const apiStates = [];
    for (const [input, expectedPluginId, envelopeKey, taskId] of cases) {
      const project = await runGrowth(token, productProjectId, input);
      const agent = getGrowthAgent(project);
      const layer = getPluginLayer(project);
      assert.equal(agent.taskId, "GROW-AGT-001");
      assert.equal(agent.readiness.canRunGrowth, true);
      assert.equal(agent.productTruthAvailable, true);
      assert.equal(layer.taskId, "GROW-PLUG-001");
      assert.equal(layer.registry.taskId, "GROW-PLUG-002");
      assert.equal(layer.primaryPlugin.pluginId, expectedPluginId);
      assert.equal(project[envelopeKey]?.taskId ?? project.context?.[envelopeKey]?.taskId ?? agent[envelopeKey]?.taskId, taskId);
      apiStates.push({ input, selectedPluginId: expectedPluginId, envelopeKey, taskId });
    }

    const measurement = await apiJson(`/api/projects/${productProjectId}/growth-measurement`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        record: {
          sourceType: "manual",
          source: "user-report",
          metric: "customer-understanding",
          value: 3,
          confidenceLevel: "low",
          hypothesis: "לקוחות יבינו את ערך ניהול הלידים מהר יותר.",
          result: "שלושה לקוחות הבינו את הערך בשיחה.",
          insight: "יש אות ראשוני, לא הוכחת הצלחה.",
        },
      },
    });
    assert.equal(measurement.payload.growthMeasurementTruth.taskId, "GROW-MEASURE-001");
    assert.equal(
      measurement.payload.growthMeasurementTruth.sourceSummary.some((entry) => entry.sourceType === "manual"),
      true,
    );
    assert.equal(measurement.payload.growthMeasurementTruth.learningSummary.confidenceLevel, "low");

    console.log("EXP-006 proof: checking visible Growth surface and refresh continuity");
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });
    page.setDefaultTimeout(12_000);
    page.setDefaultNavigationTimeout(12_000);
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
    await page.addInitScript((storedUser) => {
      window.localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
    }, appUser);
    await page.goto(`${baseUrl}/growth?projectId=${encodeURIComponent(productProjectId)}`, { waitUntil: "domcontentloaded", timeout: 12_000 });
    await page.waitForSelector("[data-growth-surface-contract='SURF-005']");
    await page.waitForSelector("[data-landing-backend-task='GROW-LAND-BACKEND-001']");
    await page.waitForSelector("[data-growth-measurement-task='GROW-MEASURE-001']");
    const domState = await readDom(page);
    assert.equal(domState.surfaceContract, "SURF-005");
    assert.equal(domState.agentTask, "GROW-AGT-001");
    assert.equal(domState.agentCanRun, "true");
    assert.equal(domState.pluginTask, "GROW-PLUG-001");
    assert.equal(domState.registryTask, "GROW-PLUG-002");
    assert.equal(domState.registryCount, "6");
    assert.equal(domState.measurementTask, "GROW-MEASURE-001");
    assert.equal(domState.socialTask, "GROW-AGT-002");
    assert.equal(domState.seoTask, "GROW-SEO-001");
    assert.equal(domState.semTask, "GROW-SEM-001");
    assert.equal(domState.emailTask, "GROW-EMAIL-001");
    assert.equal(domState.landingTask, "GROW-LAND-001");
    assert.equal(domState.landingBackendTask, "GROW-LAND-BACKEND-001");
    assert.equal(domState.hasGrowthRegions, true);
    assert.equal(domState.hasFakeOutcomeClaim, false);
    assert.equal(domState.hasMarketplaceLeak, false);
    if (screenshotPath) {
      await page.screenshot({ path: screenshotPath, fullPage: false, timeout: 10_000 });
    }
    await page.reload({ waitUntil: "domcontentloaded", timeout: 12_000 });
    await page.waitForSelector("[data-growth-surface-contract='SURF-005']");
    const afterRefresh = await readDom(page);
    assert.equal(afterRefresh.url.includes(`projectId=${encodeURIComponent(productProjectId)}`), true);
    assert.equal(afterRefresh.agentTask, "GROW-AGT-001");
    assert.equal(afterRefresh.landingBackendTask, "GROW-LAND-BACKEND-001");
    assert.equal(afterRefresh.measurementTask, "GROW-MEASURE-001");
    await browser.close();

    const restored = await apiJson(`/api/projects/${productProjectId}`, { token, expected: 200 });
    assert.equal(restored.payload.growthAgent.taskId, "GROW-AGT-001");
    assert.equal(restored.payload.growthMeasurementTruth.taskId, "GROW-MEASURE-001");
    assert.equal(restored.payload.landingBackendSync.taskId, "GROW-LAND-BACKEND-001");

    const report = {
      taskId: "EXP-006",
      noProductProjectId,
      productProjectId,
      apiStates,
      domState,
      afterRefresh,
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
  process.exitCode = 1;
});
