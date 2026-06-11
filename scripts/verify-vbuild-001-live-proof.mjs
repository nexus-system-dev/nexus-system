import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `vbuild-user-${now}`;
const projectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `vbuild-proof-${now}`;
const screenshotPrefix = process.env.NEXUS_VBUILD_SCREENSHOT_PREFIX
  ?? `/private/tmp/nexus-vbuild-001-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק המשך חזותי",
};

const projectGoal = "כלי פנימי לניהול לידים שמציג רשימת לידים, סטטוס, אחראי, תזכורת וצעד הבא. לא לבנות חיבור וואטסאפ אמיתי, תשלום או פרסום.";
const visualMessage = "תהפוך את רשימת הלידים לכרטיסים ותוסיף אזור חזרה היום";
const premiumMessage = "זה נראה יבש, תהפוך את זה לפרימיום";

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

async function createProject() {
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
      name: "ניהול לידים חי",
      goal: projectGoal,
      artifactExpectation: {
        projectType: "internal tool",
        deliverableLabel: "ניהול לידים חי",
      },
    },
  });

  const project = await getProject();
  const candidateId = project.skeletonChoiceTruth?.candidates?.[0]?.candidateId;
  if (!candidateId) {
    throw new Error("Project did not create skeleton choice candidates.");
  }
  await apiJson(`/api/projects/${projectId}/skeleton-choice/select`, {
    method: "POST",
    headers: {
      "x-user-id": userId,
    },
    body: {
      candidateId,
      selectedBy: "live-proof",
    },
  });
  return getProject();
}

async function getProject() {
  return apiJson(`/api/projects/${projectId}`, {
    headers: {
      "x-user-id": userId,
    },
  });
}

async function summarizeProject() {
  const project = await getProject();
  return {
    id: project.id,
    userId: project.userId,
    selectedSkeletonCandidateId: project.skeletonChoiceTruth?.selectedSkeletonCandidateId ?? null,
    selectedCompositionStyle: project.skeletonChoiceTruth?.selectedCompositionStyle ?? null,
    selectedProductDirection: project.skeletonChoiceTruth?.selectedProductDirection ?? null,
    buildAgentTurnStatus: project.buildAgentTurnState?.status ?? null,
    buildAgentTurnOwner: project.buildAgentTurnState?.owner ?? null,
    buildAgentTurnIntent: project.buildAgentTurnState?.intent ?? null,
    buildAgentRequiresApproval: project.buildAgentTurnState?.requiresApproval ?? null,
    buildAgentMayClaimChanged: project.buildAgentTurnState?.mayClaimChanged ?? null,
    buildAgentSelectedCandidateId: project.buildAgentTurnState?.selectedSkeletonCandidateId ?? null,
    visualBuildTask: project.visualBuildTruth?.taskId ?? null,
    visualBuildBridgeTask: project.visualBuildTruth?.bridgeTaskId ?? null,
    visualBuildStatus: project.visualBuildTruth?.status ?? null,
    visualBuildOperation: project.visualBuildTruth?.lastOperationId ?? null,
    visualBuildSelectedCandidateId: project.visualBuildTruth?.selectedSkeletonCandidateId ?? null,
    visualBuildSelectedStyle: project.visualBuildTruth?.selectedCompositionStyle ?? null,
    visualBuildScreenIds: project.visualBuildTruth?.screens?.map((screen) => screen.screenId) ?? [],
    visualBuildHistoryCount: project.visualBuildTruth?.history?.length ?? 0,
    runtimeLearningEventTypes: project.runtimeLearningEvents?.map((event) => event.eventType) ?? [],
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
      runtimeProjectId: attr("[data-runtime-project-id]", "data-runtime-project-id"),
      runtimeTask: attr("[data-runtime-skeleton-task]", "data-runtime-skeleton-task"),
      skeletonChoiceSelectedCandidateId: attr("[data-skeleton-choice-task]", "data-skeleton-choice-selected-candidate-id"),
      buildAgentTask: attr("[data-build-agent-turn-task]", "data-build-agent-turn-task"),
      buildAgentStatus: attr("[data-build-agent-turn-task]", "data-build-agent-turn-status"),
      buildAgentIntent: attr("[data-build-agent-turn-task]", "data-build-agent-turn-intent"),
      buildAgentOwner: attr("[data-build-agent-turn-task]", "data-build-agent-turn-owner"),
      buildAgentRequiresApproval: attr("[data-build-agent-turn-task]", "data-build-agent-turn-requires-approval"),
      buildAgentMayClaimChanged: attr("[data-build-agent-turn-task]", "data-build-agent-turn-may-claim-changed"),
      buildAgentSelectedCandidateId: attr("[data-build-agent-turn-task]", "data-build-agent-turn-selected-candidate-id"),
      visualBuildTask: attr("[data-visual-build-task]", "data-visual-build-task"),
      visualBuildBridgeTask: attr("[data-visual-build-task]", "data-visual-build-bridge-task"),
      visualBuildStatus: attr("[data-visual-build-task]", "data-visual-build-status"),
      visualBuildOperation: attr("[data-visual-build-task]", "data-visual-build-operation"),
      visualBuildCards: attr("[data-visual-build-cards]", "data-visual-build-cards"),
      visualBuildRegionAdded: attr("[data-visual-build-region-added]", "data-visual-build-region-added"),
      hasLeadCards: document.querySelectorAll("[data-visual-build-card='lead']").length,
      hasFollowUpTodayText: text.includes("חזרה היום"),
      hasSafeVisualReply: text.includes("רשימת הלידים הפכה לכרטיסים"),
      hasApprovalReply: text.includes("צריך אישור"),
      bodyExcerpt: text.slice(0, 2200),
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
  const initialProject = await createProject();
  const beforeProject = await summarizeProject();
  const selectedCandidateId = beforeProject.selectedSkeletonCandidateId;
  if (!selectedCandidateId) {
    throw new Error("Skeleton candidate was not selected before Build continuation.");
  }

  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    slowMo: Number(process.env.NEXUS_LIVE_SLOW_MO ?? 120),
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

  await page.addInitScript((storedUser) => {
    localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
  }, appUser);

  await page.goto(`${baseUrl}/loop?projectId=${encodeURIComponent(projectId)}`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForSelector(`[data-runtime-project-id="${projectId}"]`, { timeout: 30000 });
  await page.waitForSelector(`[data-skeleton-choice-selected-candidate-id="${selectedCandidateId}"]`, { timeout: 30000 });
  const beforeVisualMessage = await dump(page, "before-visual-message");
  await page.screenshot({ path: `${screenshotPrefix}-before-visual-message.png`, fullPage: true });

  const visualComposerFound = await fillLastComposer(page, visualMessage);
  if (!visualComposerFound) {
    throw new Error("No visible Build rail composer found for visual message.");
  }
  await page.screenshot({ path: `${screenshotPrefix}-visual-message-filled.png`, fullPage: true });
  await submitVisibleComposer(page);

  await page.waitForFunction((candidateId) => {
    const visual = document.querySelector("[data-visual-build-task]");
    const route = document.querySelector("[data-build-agent-turn-task]");
    return visual?.getAttribute("data-visual-build-task") === "VBUILD-001"
      && visual?.getAttribute("data-visual-build-operation") === "visual.leads.cardsFollowupToday"
      && document.querySelector("[data-visual-build-cards='lead-list']")
      && document.querySelector("[data-visual-build-region-added='follow-up-today']")
      && route?.getAttribute("data-build-agent-turn-owner") === "visual-build-agent"
      && route?.getAttribute("data-build-agent-turn-status") === "applied"
      && route?.getAttribute("data-build-agent-turn-selected-candidate-id") === candidateId;
  }, selectedCandidateId, { timeout: 30000 });
  const afterVisualMessage = await dump(page, "after-visual-message");
  await page.screenshot({ path: `${screenshotPrefix}-after-visual-message.png`, fullPage: true });
  const afterVisualProject = await summarizeProject();

  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector(`[data-runtime-project-id="${projectId}"]`, { timeout: 30000 });
  await page.waitForFunction((candidateId) => {
    const visual = document.querySelector("[data-visual-build-task]");
    return new URL(location.href).searchParams.get("projectId")
      && visual?.getAttribute("data-visual-build-operation") === "visual.leads.cardsFollowupToday"
      && document.querySelector("[data-visual-build-cards='lead-list']")
      && document.querySelector("[data-visual-build-region-added='follow-up-today']")
      && document.querySelector("[data-skeleton-choice-task]")?.getAttribute("data-skeleton-choice-selected-candidate-id") === candidateId;
  }, selectedCandidateId, { timeout: 30000 });
  const afterRefresh = await dump(page, "after-refresh");
  await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });
  const afterRefreshProject = await summarizeProject();

  const premiumComposerFound = await fillLastComposer(page, premiumMessage);
  if (!premiumComposerFound) {
    throw new Error("No visible Build rail composer found for premium message.");
  }
  await page.screenshot({ path: `${screenshotPrefix}-premium-message-filled.png`, fullPage: true });
  await submitVisibleComposer(page);

  await page.waitForFunction(() => {
    const route = document.querySelector("[data-build-agent-turn-task]");
    return route?.getAttribute("data-build-agent-turn-intent") === "visual-style-change"
      && route?.getAttribute("data-build-agent-turn-owner") === "visual-build-agent"
      && route?.getAttribute("data-build-agent-turn-requires-approval") === "true"
      && route?.getAttribute("data-build-agent-turn-may-claim-changed") === "false"
      && (document.body.innerText || "").includes("צריך אישור");
  }, { timeout: 30000 });
  const afterPremiumRequest = await dump(page, "after-premium-request");
  await page.screenshot({ path: `${screenshotPrefix}-after-premium-request.png`, fullPage: true });
  const afterPremiumProject = await summarizeProject();

  const passed = Boolean(
    beforeVisualMessage.pathname === "/loop"
    && beforeVisualMessage.projectIdParam === projectId
    && beforeVisualMessage.hasQaState === false
    && beforeVisualMessage.hasNexusState === false
    && beforeVisualMessage.runtimeProjectId === projectId
    && beforeVisualMessage.skeletonChoiceSelectedCandidateId === selectedCandidateId
    && afterVisualMessage.buildAgentOwner === "visual-build-agent"
    && afterVisualMessage.buildAgentStatus === "applied"
    && afterVisualMessage.buildAgentMayClaimChanged === "true"
    && afterVisualMessage.buildAgentSelectedCandidateId === selectedCandidateId
    && afterVisualMessage.visualBuildTask === "VBUILD-001"
    && afterVisualMessage.visualBuildBridgeTask === "BLD-AGT-001"
    && afterVisualMessage.visualBuildOperation === "visual.leads.cardsFollowupToday"
    && afterVisualMessage.visualBuildCards === "lead-list"
    && afterVisualMessage.visualBuildRegionAdded === "follow-up-today"
    && afterVisualMessage.hasLeadCards >= 1
    && afterVisualMessage.hasFollowUpTodayText
    && afterVisualProject.visualBuildOperation === "visual.leads.cardsFollowupToday"
    && afterVisualProject.visualBuildSelectedCandidateId === selectedCandidateId
    && afterRefresh.projectIdParam === projectId
    && afterRefresh.runtimeProjectId === projectId
    && afterRefresh.visualBuildOperation === "visual.leads.cardsFollowupToday"
    && afterRefresh.visualBuildCards === "lead-list"
    && afterRefresh.visualBuildRegionAdded === "follow-up-today"
    && afterRefreshProject.visualBuildScreenIds.includes("lead-cards-follow-up")
    && afterPremiumRequest.buildAgentIntent === "visual-style-change"
    && afterPremiumRequest.buildAgentOwner === "visual-build-agent"
    && afterPremiumRequest.buildAgentRequiresApproval === "true"
    && afterPremiumRequest.buildAgentMayClaimChanged === "false"
    && afterPremiumRequest.hasApprovalReply
    && afterPremiumProject.visualBuildOperation === "visual.leads.cardsFollowupToday"
    && afterPremiumProject.visualBuildHistoryCount === afterRefreshProject.visualBuildHistoryCount
  );

  const report = {
    passed,
    taskId: "VBUILD-001",
    baseUrl,
    userId,
    projectId,
    selectedCandidateId,
    initialProject: {
      id: initialProject.id,
      userId: initialProject.userId,
    },
    beforeProject,
    beforeVisualMessage,
    afterVisualMessage,
    afterVisualProject,
    afterRefresh,
    afterRefreshProject,
    afterPremiumRequest,
    afterPremiumProject,
    consoleErrors,
    apiResponses: apiResponses.slice(-120),
    screenshots: {
      beforeVisualMessage: `${screenshotPrefix}-before-visual-message.png`,
      visualMessageFilled: `${screenshotPrefix}-visual-message-filled.png`,
      afterVisualMessage: `${screenshotPrefix}-after-visual-message.png`,
      afterRefresh: `${screenshotPrefix}-after-refresh.png`,
      premiumMessageFilled: `${screenshotPrefix}-premium-message-filled.png`,
      afterPremiumRequest: `${screenshotPrefix}-after-premium-request.png`,
    },
  };

  const reportPath = `${screenshotPrefix}-report.json`;
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ok: passed, reportPath, projectId, selectedCandidateId }, null, 2));
  await browser.close();

  if (!passed) {
    process.exitCode = 1;
  }
}

await main();
