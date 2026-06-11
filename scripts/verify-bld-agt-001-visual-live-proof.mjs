import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `bld-visual-user-${now}`;
const projectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `bld-agent-visual-proof-${now}`;
const screenshotPrefix = process.env.NEXUS_BLD_AGT_SCREENSHOT_PREFIX
  ?? `/private/tmp/nexus-bld-agt-001-visual-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק חזותי",
};

const projectIdea = "אפליקציה מובייל לניהול משימות יומי בשם Daily Done";
const buildMessage = "תוסיף לי דף סלאש סקרין עם שם האפליקציה";

async function apiJson(pathname, { method = "GET", body = null, headers = {} } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : null,
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`API ${method} ${pathname} failed ${response.status}: ${text.slice(0, 800)}`);
  }
  return payload;
}

async function ensureTestProject() {
  await apiJson("/api/auth/signup", {
    method: "POST",
    body: {
      userInput: appUser,
      credentials: {
        password: "TestOnly123!",
      },
    },
  });

  await apiJson("/api/projects", {
    method: "POST",
    headers: {
      "x-user-id": userId,
    },
    body: {
      id: projectId,
      name: "Daily Done",
      goal: projectIdea,
      artifactExpectation: {
        projectType: "mobile app",
        deliverableLabel: "Daily Done",
      },
    },
  });

  return apiJson(`/api/projects/${projectId}`, {
    headers: {
      "x-user-id": userId,
    },
  });
}

async function summarizeProject() {
  const project = await apiJson(`/api/projects/${projectId}`, {
    headers: {
      "x-user-id": userId,
    },
  });
  return {
    id: project.id,
    userId: project.userId,
    runtimeProjectId: project.runtimeSkeletonTruth?.projectId ?? null,
    runtimeTask: project.runtimeSkeletonTruth?.taskId ?? null,
    buildAgentTurnStatus: project.buildAgentTurnState?.status ?? null,
    buildAgentTurnOwner: project.buildAgentTurnState?.owner ?? null,
    buildAgentMayClaimChanged: project.buildAgentTurnState?.mayClaimChanged ?? null,
    visualBuildTask: project.visualBuildTruth?.taskId ?? null,
    visualBuildBridgeTask: project.visualBuildTruth?.bridgeTaskId ?? null,
    visualBuildStatus: project.visualBuildTruth?.status ?? null,
    visualBuildOperation: project.visualBuildTruth?.lastOperationId ?? null,
    visualBuildScreenIds: project.visualBuildTruth?.screens?.map((screen) => screen.screenId) ?? [],
    visualBuildHistoryCount: project.visualBuildTruth?.history?.length ?? 0,
  };
}

async function dump(page, label) {
  return page.evaluate((dumpLabel) => {
    const url = new URL(location.href);
    const text = document.body.innerText || "";
    const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) ?? null;
    return {
      label: dumpLabel,
      url: location.href,
      pathname: location.pathname,
      projectIdParam: url.searchParams.get("projectId"),
      hasQaState: url.searchParams.has("qaState"),
      hasNexusState: url.searchParams.has("nexusState"),
      screen: document.body.dataset.appScreen ?? null,
      runtimeProjectId: attr("[data-runtime-project-id]", "data-runtime-project-id"),
      runtimeTask: attr("[data-runtime-skeleton-task]", "data-runtime-skeleton-task"),
      buildAgentTask: attr("[data-build-agent-turn-task]", "data-build-agent-turn-task"),
      buildAgentStatus: attr("[data-build-agent-turn-status]", "data-build-agent-turn-status"),
      buildAgentOwner: attr("[data-build-agent-turn-owner]", "data-build-agent-turn-owner"),
      buildAgentMayClaimChanged: attr("[data-build-agent-turn-may-claim-changed]", "data-build-agent-turn-may-claim-changed"),
      visualBuildTask: attr("[data-visual-build-task]", "data-visual-build-task"),
      visualBuildBridgeTask: attr("[data-visual-build-bridge-task]", "data-visual-build-bridge-task"),
      visualBuildStatus: attr("[data-visual-build-status]", "data-visual-build-status"),
      visualBuildOperation: attr("[data-visual-build-operation]", "data-visual-build-operation"),
      visualBuildScreen: attr("[data-visual-build-screen]", "data-visual-build-screen"),
      hasSplashScreen: Boolean(document.querySelector("[data-visual-build-added-screen='splash-screen']")),
      hasAppliedReply: text.includes("נוסף מסך פתיחה חזותי"),
      bodyExcerpt: text.slice(0, 1600),
    };
  }, label);
}

async function fillLastComposer(page, text) {
  const candidates = page.locator("textarea, input[type='text'], [contenteditable='true']");
  const count = await candidates.count();
  for (let index = count - 1; index >= 0; index -= 1) {
    const candidate = candidates.nth(index);
    try {
      if (await candidate.isVisible()) {
        await candidate.click();
        await candidate.fill(text);
        return true;
      }
    } catch {
      // Continue to the next candidate.
    }
  }
  return false;
}

async function submitVisibleComposer(page) {
  const sendButton = page.locator("[data-agent-rail-send]").last();
  if (await sendButton.count() && await sendButton.isVisible() && await sendButton.isEnabled()) {
    await sendButton.click();
    return true;
  }
  await page.keyboard.press("Meta+Enter");
  return true;
}

async function main() {
  const initialProject = await ensureTestProject();
  const beforeProject = await summarizeProject();
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    slowMo: Number(process.env.NEXUS_LIVE_SLOW_MO ?? 160),
  });
  const page = await browser.newPage({ viewport: { width: 1500, height: 940 } });
  const consoleErrors = [];
  const apiResponses = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.url().includes("/api/")) {
      apiResponses.push({
        method: response.request().method(),
        url: response.url(),
        status: response.status(),
      });
    }
  });

  await page.goto(`${baseUrl}/?qa=1`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.evaluate((storedUser) => {
    localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
  }, appUser);

  await page.goto(`${baseUrl}/loop?projectId=${encodeURIComponent(projectId)}`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForSelector(`[data-runtime-project-id="${projectId}"]`, { timeout: 30000 });
  const beforeMessage = await dump(page, "before-message");
  await page.screenshot({ path: `${screenshotPrefix}-before-message.png`, fullPage: true });

  const composerFound = await fillLastComposer(page, buildMessage);
  if (!composerFound) {
    throw new Error("No visible Build rail composer found");
  }
  await page.screenshot({ path: `${screenshotPrefix}-message-filled.png`, fullPage: true });
  await submitVisibleComposer(page);

  await page.waitForFunction(() => {
    const operation = document
      .querySelector("[data-visual-build-operation]")
      ?.getAttribute("data-visual-build-operation");
    return operation === "visual.screen.addSplash"
      && Boolean(document.querySelector("[data-visual-build-added-screen='splash-screen']"));
  }, { timeout: 30000 });
  const afterMessage = await dump(page, "after-message");
  await page.screenshot({ path: `${screenshotPrefix}-after-message.png`, fullPage: true });
  const afterVisualProject = await summarizeProject();

  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector(`[data-runtime-project-id="${projectId}"]`, { timeout: 30000 });
  await page.waitForFunction(() => {
    const operation = document
      .querySelector("[data-visual-build-operation]")
      ?.getAttribute("data-visual-build-operation");
    return operation === "visual.screen.addSplash"
      && Boolean(document.querySelector("[data-visual-build-added-screen='splash-screen']"));
  }, { timeout: 30000 });
  const afterRefresh = await dump(page, "after-refresh");
  await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });
  const afterRefreshProject = await summarizeProject();

  const passed = Boolean(
    beforeMessage.pathname === "/loop"
    && beforeMessage.projectIdParam === projectId
    && beforeMessage.runtimeProjectId === projectId
    && beforeMessage.hasQaState === false
    && beforeMessage.hasNexusState === false
    && afterMessage.buildAgentOwner === "visual-build-agent"
    && afterMessage.buildAgentStatus === "applied"
    && afterMessage.visualBuildTask === "VBUILD-001"
    && afterMessage.visualBuildBridgeTask === "BLD-AGT-001"
    && afterMessage.visualBuildOperation === "visual.screen.addSplash"
    && afterMessage.hasSplashScreen === true
    && afterVisualProject.visualBuildOperation === "visual.screen.addSplash"
    && afterRefresh.projectIdParam === projectId
    && afterRefresh.runtimeProjectId === projectId
    && afterRefresh.visualBuildOperation === "visual.screen.addSplash"
    && afterRefresh.hasSplashScreen === true
    && afterRefreshProject.visualBuildScreenIds.includes("splash-screen")
  );

  const summary = {
    passed,
    baseUrl,
    userId,
    projectId,
    initialProject: {
      id: initialProject.id,
      userId: initialProject.userId,
    },
    beforeProject,
    beforeMessage,
    afterMessage,
    afterVisualProject,
    afterRefresh,
    afterRefreshProject,
    consoleErrors,
    apiResponses: apiResponses.slice(-80),
    screenshots: {
      beforeMessage: `${screenshotPrefix}-before-message.png`,
      messageFilled: `${screenshotPrefix}-message-filled.png`,
      afterMessage: `${screenshotPrefix}-after-message.png`,
      afterRefresh: `${screenshotPrefix}-after-refresh.png`,
    },
  };

  await fs.writeFile(`${screenshotPrefix}-summary.json`, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  await browser.close();

  if (!passed) {
    process.exitCode = 1;
  }
}

await main();
