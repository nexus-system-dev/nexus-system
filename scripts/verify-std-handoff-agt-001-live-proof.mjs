import assert from "node:assert/strict";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

const port = Number.parseInt(process.env.PORT ?? "4032", 10);
const baseUrl = `http://127.0.0.1:${port}`;
const now = Date.now();
const proofRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-std-handoff-agt-001-"));
const reportPath = process.env.NEXUS_STD_HANDOFF_AGT_001_REPORT_PATH ?? path.join(proofRoot, "report.json");

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
  const userId = `std-handoff-user-${now}`;
  const signupResult = await apiJson("/api/auth/signup", {
    method: "POST",
    expected: 201,
    body: {
      userInput: {
        userId,
        email: `${userId}@example.test`,
        displayName: "בודק מסירת סטודיו",
      },
      credentials: { password: `secret-${now}` },
    },
  });
  const tokenBundle = signupResult.payload?.authPayload?.tokenBundle;
  assert.ok(tokenBundle?.accessToken, "signup must return an access token");
  return {
    userId,
    token: tokenBundle.accessToken,
    appUser: {
      userId,
      email: `${userId}@example.test`,
      displayName: "בודק מסירת סטודיו",
      tokenBundle,
      sessionState: signupResult.payload.authPayload.sessionState,
    },
  };
}

async function createStudioProject(projectService, token, { projectId, connectionStatus }) {
  const studioWorkspace = {
    connectionStatus,
    requestedAction: "open-local-workspace",
    requiredLocalCapability: "local-file-runtime",
    requiredReason: "צריך לפתוח קבצים ולהריץ בדיקות על המחשב.",
  };
  await apiJson("/api/projects", {
    method: "POST",
    token,
    expected: 201,
    body: {
      id: projectId,
      name: `מסירת סטודיו ${connectionStatus}`,
      goal: "לבדוק מעבר אמיתי בין Nexus Web לבין Nexus Studio Desktop.",
      artifactExpectation: {
        projectType: "internal-tool",
        deliverableLabel: "כלי בדיקה",
      },
      state: {
        workspaceId: `workspace:${projectId}`,
        artifactExpectation: {
          projectType: "internal-tool",
          deliverableLabel: "כלי בדיקה",
        },
        studioWorkspace,
      },
    },
  });
  const record = projectService.projects.get(projectId);
  assert.ok(record, "created Studio proof project must be stored");
  record.studioWorkspace = studioWorkspace;
  record.state = {
    ...(record.state ?? {}),
    workspaceId: `workspace:${projectId}`,
    studioWorkspace,
  };
  projectService.persistProjectRecord(record);
}

async function installSession(page, appUser) {
  await page.addInitScript((user) => {
    window.localStorage.setItem("nexus.appUser", JSON.stringify(user));
  }, appUser);
}

async function readStudioDom(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-studio-boundary-contract]");
    const screen = document.querySelector("#screen-studio");
    const attr = (name) => root?.getAttribute(name) ?? null;
    const text = document.body.innerText || "";
    const primaryHref = document.querySelector(".nexus-studio-boundary__primary-action")?.getAttribute("href") ?? "";
    return {
      url: location.href,
      appScreen: document.body.dataset.appScreen ?? null,
      screenStudioHidden: screen?.hidden ?? null,
      surfaceContract: attr("data-studio-boundary-contract"),
      handoffTask: attr("data-studio-handoff-agent-task"),
      handoffStatus: attr("data-studio-handoff-agent-status"),
      handoffDecision: attr("data-studio-handoff-decision"),
      handoffId: attr("data-studio-handoff-id"),
      handoffProtocol: attr("data-studio-handoff-protocol"),
      requiredCapability: attr("data-studio-handoff-required-capability"),
      returnContract: attr("data-studio-handoff-return-contract"),
      primaryHref,
      hasRequiredRegions: [
        "studio-web-boundary-explanation",
        "studio-desktop-connection-status",
        "studio-open-desktop-action",
        "studio-install-fallback",
        "studio-web-vs-desktop-split",
        "studio-return-to-web-product-truth",
      ].every((region) => Boolean(document.querySelector(`[data-studio-region='${region}']`))),
      hasFakeWebIde: /Developer Workspace|Project Brain|file explorer|terminal|localhost run|הרצה מקומית התחילה/u.test(text),
      hasTruthfulOpenBoundary: /לא יטען שהאפליקציה המקומית נפתחה|בקשת מעבר מוגבלת/u.test(text),
      hasNoFakeCapability: /לא מבטיח גישה לקבצים|לא מציג עורך קבצים מקומי/u.test(text),
    };
  });
}

async function waitForStudioBoundary(page, label, expectedProjectId) {
  try {
    await page.waitForSelector("[data-studio-boundary-contract='SURF-008']", {
      state: "attached",
      timeout: 15000,
    });
    await page.waitForFunction(
      (projectId) => {
        const root = document.querySelector("[data-studio-boundary-contract='SURF-008']");
        const handoffId = root?.getAttribute("data-studio-handoff-id") ?? "";
        return handoffId.includes(`studio-handoff:${projectId}:`);
      },
      expectedProjectId,
      { timeout: 15000 },
    );
  } catch (error) {
    const diagnostic = await page.evaluate(() => ({
      url: location.href,
      title: document.title,
      appScreen: document.body.dataset.appScreen ?? null,
      bodyClass: document.body.className,
      screenStudioExists: Boolean(document.querySelector("#screen-studio")),
      screenStudioHidden: document.querySelector("#screen-studio")?.hidden ?? null,
      activeScreens: [...document.querySelectorAll(".app-screen")]
        .filter((screen) => !screen.hidden)
        .map((screen) => ({
          id: screen.id,
          text: (screen.innerText || "").slice(0, 500),
        })),
      handoffId: document.querySelector("[data-studio-boundary-contract]")?.getAttribute("data-studio-handoff-id") ?? null,
      bodyText: (document.body.innerText || "").slice(0, 1200),
    }));
    throw new Error(`${label} did not attach Studio boundary: ${error.message}\n${JSON.stringify(diagnostic, null, 2)}`);
  }
}

async function main() {
  const projectService = new ProjectService({
    eventLogPath: path.join(proofRoot, "events.ndjson"),
  });
  const server = createServer(projectService, {
    runtimeId: "std-handoff-agt-001-live-proof",
    healthStatus: { status: "healthy" },
    readinessStatus: { status: "ready" },
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

  try {
    const { token, appUser } = await signup();
    const unavailableProjectId = `std-handoff-unavailable-${now}`;
    const connectedProjectId = `std-handoff-connected-${now}`;
    await createStudioProject(projectService, token, { projectId: unavailableProjectId, connectionStatus: "not-installed" });
    await createStudioProject(projectService, token, { projectId: connectedProjectId, connectionStatus: "connected" });

    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });
    await installSession(page, appUser);

    await page.goto(`${baseUrl}/studio?projectId=${encodeURIComponent(unavailableProjectId)}`, {
      waitUntil: "domcontentloaded",
    });
    await waitForStudioBoundary(page, "unavailable state", unavailableProjectId);
    const unavailableDom = await readStudioDom(page);

    assert.equal(unavailableDom.surfaceContract, "SURF-008");
    assert.equal(unavailableDom.appScreen, "studio");
    assert.equal(unavailableDom.screenStudioHidden, false);
    assert.equal(unavailableDom.handoffTask, "STD-HANDOFF-AGT-001");
    assert.equal(unavailableDom.handoffStatus, "unavailable-fallback");
    assert.equal(unavailableDom.handoffDecision, "prepare-with-fallback");
    assert.match(unavailableDom.handoffId, /^studio-handoff:std-handoff-unavailable-/);
    assert.equal(unavailableDom.handoffProtocol, "studio-handoff-v1");
    assert.equal(unavailableDom.requiredCapability, "local-file-runtime");
    assert.match(unavailableDom.primaryHref, /^nexus-studio:\/\/open\?handoffId=studio-handoff%3Astd-handoff-unavailable-/);
    assert.doesNotMatch(unavailableDom.primaryHref, /project=/);
    assert.equal(unavailableDom.hasRequiredRegions, true);
    assert.equal(unavailableDom.hasFakeWebIde, false);
    assert.equal(unavailableDom.hasTruthfulOpenBoundary, true);
    assert.equal(unavailableDom.hasNoFakeCapability, true);
    assert.match(unavailableDom.returnContract, /sync-accepted/);

    await page.close();
    const connectedPage = await browser.newPage({ viewport: { width: 1365, height: 768 } });
    await installSession(connectedPage, appUser);
    await connectedPage.goto(`${baseUrl}/studio?projectId=${encodeURIComponent(connectedProjectId)}`, {
      waitUntil: "domcontentloaded",
    });
    await waitForStudioBoundary(connectedPage, "connected state", connectedProjectId);
    const connectedDom = await readStudioDom(connectedPage);

    assert.equal(connectedDom.appScreen, "studio");
    assert.equal(connectedDom.screenStudioHidden, false);
    assert.equal(connectedDom.handoffStatus, "connected-ready");
    assert.equal(connectedDom.handoffDecision, "open");
    assert.match(connectedDom.primaryHref, /^nexus-studio:\/\/open\?handoffId=studio-handoff%3Astd-handoff-connected-/);
    assert.doesNotMatch(connectedDom.primaryHref, /project=/);
    assert.equal(connectedDom.hasFakeWebIde, false);
    assert.equal(connectedDom.hasTruthfulOpenBoundary, true);

    await connectedPage.close();
    await browser.close();

    const report = {
      taskId: "STD-HANDOFF-AGT-001",
      baseUrl,
      proofRoot,
      unavailableProjectId,
      connectedProjectId,
      unavailableDom,
      connectedDom,
      result: "passed",
    };
    await fsPromises.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`STD-HANDOFF-AGT-001 live proof passed: ${reportPath}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
