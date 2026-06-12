import assert from "node:assert/strict";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

const port = Number.parseInt(process.env.PORT ?? "4033", 10);
const baseUrl = `http://127.0.0.1:${port}`;
const now = Date.now();
const proofRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-runtime-001-"));
const reportPath = process.env.NEXUS_RUNTIME_001_REPORT_PATH ?? path.join(proofRoot, "report.json");

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
  const userId = `runtime-001-user-${now}`;
  const signupResult = await apiJson("/api/auth/signup", {
    method: "POST",
    expected: 201,
    body: {
      userInput: {
        userId,
        email: `${userId}@example.test`,
        displayName: "בודק גבול הרצה",
      },
      credentials: { password: `secret-${now}` },
    },
  });
  const tokenBundle = signupResult.payload?.authPayload?.tokenBundle;
  assert.ok(tokenBundle?.accessToken, "signup must return an access token");
  return {
    token: tokenBundle.accessToken,
    appUser: {
      userId,
      email: `${userId}@example.test`,
      displayName: "בודק גבול הרצה",
      tokenBundle,
      sessionState: signupResult.payload.authPayload.sessionState,
    },
  };
}

async function createRuntimeProject(token, projectId) {
  await apiJson("/api/projects", {
    method: "POST",
    token,
    expected: 201,
    body: {
      id: projectId,
      name: "ניהול לידים עם גבול הרצה",
      goal: "בעל עסק צריך לראות לידים, אחראי, תזכורת וצעד הבא בלי לחשוב שזה כבר מוצר שפורסם.",
      artifactExpectation: {
        projectType: "internal tool",
        title: "ניהול לידים עם גבול הרצה",
        deliverableLabel: "שלד ריצה לניהול לידים",
      },
      productSkeletonAgentOutput: {
        agentId: "product-skeleton-agent",
        responseSource: "provider-composed",
        productType: "כלי פנימי לניהול לידים",
        primaryUser: "בעל עסק קטן",
        primaryProblem: "לידים נופלים בלי אחראי ותזכורת",
        firstWorkflow: {
          title: "רשימת לידים",
          whyThisFirst: "צריך לטפל בליד בלי לעבור למסך אחר.",
          steps: ["הוסף ליד", "שייך אחראי", "קבע תזכורת"],
        },
        initialScreens: [{ name: "לידים", purpose: "ניהול רשימת לידים" }],
        initialActions: ["הוסף ליד", "שייך אחראי", "קבע תזכורת"],
        dataObjects: [{ name: "ליד", fields: ["שם", "סטטוס", "אחראי", "תזכורת", "צעד הבא"] }],
        versionOneBoundary: { buildNow: ["טבלת לידים", "עריכת אחראי"], doNotBuildNow: ["וואטסאפ", "פרסום"] },
      },
      buildMutationTruth: {
        taskId: "BUILD-MUTATION-TRUTH-001",
        status: "applied",
        lastMutationId: `mutation-runtime-001-${now}`,
        lastOperationId: "record.create",
      },
      state: {
        buildMutationTruth: {
          taskId: "BUILD-MUTATION-TRUTH-001",
          status: "applied",
          lastMutationId: `mutation-runtime-001-${now}`,
          lastOperationId: "record.create",
        },
      },
    },
  });
}

async function installSession(page, appUser) {
  await page.addInitScript((user) => {
    window.localStorage.setItem("nexus.appUser", JSON.stringify(user));
  }, appUser);
}

async function readRuntimeBoundary(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-runtime-boundary-task='RUNTIME-001']");
    const runtime = document.querySelector("[data-runtime-skeleton-task='SLICE-005']");
    const attr = (name) => root?.getAttribute(name) ?? runtime?.getAttribute(name) ?? null;
    const text = document.body.innerText || "";
    return {
      url: location.href,
      appScreen: document.body.dataset.appScreen ?? null,
      boundaryTask: attr("data-runtime-boundary-task"),
      boundaryStatus: attr("data-runtime-boundary-status"),
      buildStatus: attr("data-runtime-build-status"),
      previewStatus: attr("data-runtime-preview-status"),
      sandboxBoundary: attr("data-runtime-sandbox-boundary"),
      artifactFallback: attr("data-runtime-artifact-fallback"),
      retryAvailable: attr("data-runtime-retry-available"),
      timeoutPolicy: attr("data-runtime-timeout-policy"),
      traceSkeletonId: attr("data-runtime-trace-skeleton-id"),
      traceMutationId: attr("data-runtime-trace-mutation-id"),
      runtimeProjectId: runtime?.getAttribute("data-runtime-project-id") ?? null,
      runtimeShellFamily: runtime?.getAttribute("data-runtime-shell-family") ?? null,
      hasHumanBoundaryCopy: /תצוגה מוכנה לבדיקה|סביבת בדיקה פנימית/u.test(text),
      hasNoFakeProductionClaim: /לא פרסום חי ולא גרסת ייצור/u.test(text),
      hasFakePublishedClaim: /פורסם בהצלחה|מוצר חי באוויר|גרסת ייצור פועלת/u.test(text),
    };
  });
}

async function main() {
  const projectService = new ProjectService({
    eventLogPath: path.join(proofRoot, "events.ndjson"),
  });
  const server = createServer(projectService, {
    runtimeId: "runtime-001-live-proof",
    healthStatus: { status: "healthy" },
    readinessStatus: { status: "ready" },
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

  try {
    const { token, appUser } = await signup();
    const projectId = `runtime-001-live-${now}`;
    await createRuntimeProject(token, projectId);

    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });
    await installSession(page, appUser);

    await page.goto(`${baseUrl}/loop?projectId=${encodeURIComponent(projectId)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector("[data-runtime-boundary-task='RUNTIME-001']", { timeout: 15000 });
    const first = await readRuntimeBoundary(page);

    assert.equal(first.appScreen, "loop");
    assert.equal(first.boundaryTask, "RUNTIME-001");
    assert.equal(first.boundaryStatus, "ready");
    assert.equal(first.buildStatus, "ready");
    assert.equal(first.previewStatus, "sandbox-preview-ready");
    assert.equal(first.sandboxBoundary, "nexus-internal-sandbox-not-production");
    assert.equal(first.artifactFallback, "not-needed");
    assert.equal(first.retryAvailable, "false");
    assert.equal(first.timeoutPolicy, "bounded");
    assert.equal(first.runtimeProjectId, projectId);
    assert.equal(first.runtimeShellFamily, "workspace-state-shell");
    assert.equal(first.hasHumanBoundaryCopy, true);
    assert.equal(first.hasNoFakeProductionClaim, true);
    assert.equal(first.hasFakePublishedClaim, false);

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-runtime-boundary-task='RUNTIME-001']", { timeout: 15000 });
    const afterRefresh = await readRuntimeBoundary(page);

    assert.equal(afterRefresh.boundaryTask, "RUNTIME-001");
    assert.equal(afterRefresh.boundaryStatus, "ready");
    assert.equal(afterRefresh.runtimeProjectId, projectId);
    assert.equal(afterRefresh.sandboxBoundary, "nexus-internal-sandbox-not-production");
    assert.equal(afterRefresh.hasFakePublishedClaim, false);

    await browser.close();

    const report = {
      taskId: "RUNTIME-001",
      status: "passed",
      baseUrl,
      projectId,
      proofRoot,
      first,
      afterRefresh,
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
