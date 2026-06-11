import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `bld-boundary-user-${now}`;
const projectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `bld-boundary-project-${now}`;
const screenshotPrefix = process.env.NEXUS_BLD_BOUNDARY_SCREENSHOT_PREFIX
  ?? `/private/tmp/nexus-bld-agt-001-boundary-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק גבולות",
};

const cases = [
  {
    label: "direction",
    message: "תשנה את זה להזמנות במקום לידים",
    expectedIntent: "product-truth-change",
    expectedOwner: "mutation-change-agent",
    expectedStatus: "approval-required",
    expectedBoundaryLabel: "ממתין לאישור שינוי כיוון",
    expectedReply: "לא משנה מלידים להזמנות בשקט",
  },
  {
    label: "verification",
    message: "תבדוק שהמסך עובד",
    expectedIntent: "verification-request",
    expectedOwner: "verification-qa-agent",
    expectedStatus: "routed",
    expectedBoundaryLabel: "ממתין למסלול בדיקה",
    expectedReply: "לא אגיד שהמסך תקין",
  },
  {
    label: "release",
    message: "תחבר לי וואטסאפ אמיתי ותפרסם לי את זה",
    expectedIntent: "release-request",
    expectedOwner: "release-agent",
    expectedStatus: "blocked-or-approval-required",
    expectedBoundaryLabel: "חסום לשחרור או פרסום",
    expectedReply: "לא אפרסם החוצה",
  },
];

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
      name: "ניהול לידים חי",
      goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא. לא לבנות חיבור וואטסאפ אמיתי או פרסום.",
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
    buildAgentTurnIntent: project.buildAgentTurnState?.intent ?? null,
    buildAgentTurnOwner: project.buildAgentTurnState?.owner ?? null,
    buildAgentTurnStatus: project.buildAgentTurnState?.status ?? null,
    buildAgentMayClaimChanged: project.buildAgentTurnState?.mayClaimChanged ?? null,
    buildMutationStatus: project.buildMutationTruth?.status ?? null,
    buildMutationOperation: project.buildMutationTruth?.lastOperationId ?? null,
  };
}

async function dump(page, label) {
  return page.evaluate((dumpLabel) => {
    const url = new URL(location.href);
    const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) ?? null;
    const text = document.body.innerText || "";
    return {
      label: dumpLabel,
      url: location.href,
      pathname: location.pathname,
      projectIdParam: url.searchParams.get("projectId"),
      hasQaState: url.searchParams.has("qaState"),
      hasNexusState: url.searchParams.has("nexusState"),
      runtimeProjectId: attr("[data-runtime-project-id]", "data-runtime-project-id"),
      buildAgentTask: attr("[data-build-agent-turn-task]", "data-build-agent-turn-task"),
      buildAgentIntent: attr("[data-build-agent-turn-intent]", "data-build-agent-turn-intent"),
      buildAgentOwner: attr("[data-build-agent-turn-owner]", "data-build-agent-turn-owner"),
      buildAgentStatus: attr("[data-build-agent-turn-status]", "data-build-agent-turn-status"),
      buildAgentRequiresApproval: attr("[data-build-agent-turn-requires-approval]", "data-build-agent-turn-requires-approval"),
      buildAgentMayClaimChanged: attr("[data-build-agent-turn-may-claim-changed]", "data-build-agent-turn-may-claim-changed"),
      buildAgentBoundaryLabel: attr("[data-build-agent-turn-boundary-label]", "data-build-agent-turn-boundary-label"),
      text,
      bodyExcerpt: text.slice(0, 1800),
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
  const railSend = page.locator("[data-agent-rail-send]");
  if (await railSend.count()) {
    const sendButton = railSend.last();
    if (await sendButton.isVisible() && await sendButton.isEnabled()) {
      await sendButton.click();
      return true;
    }
  }
  const buttons = page.locator("button");
  const count = await buttons.count();
  for (let index = count - 1; index >= 0; index -= 1) {
    const button = buttons.nth(index);
    try {
      if (await button.isVisible() && await button.isEnabled()) {
        await button.click();
        return true;
      }
    } catch {
      // Continue to the next button.
    }
  }
  await page.keyboard.press("Meta+Enter");
  return true;
}

async function runCase(page, boundaryCase) {
  const composerFound = await fillLastComposer(page, boundaryCase.message);
  if (!composerFound) {
    throw new Error(`No visible Build rail composer found for ${boundaryCase.label}`);
  }
  await page.screenshot({ path: `${screenshotPrefix}-${boundaryCase.label}-filled.png`, fullPage: true });
  await submitVisibleComposer(page);
  await page.waitForFunction(
    ({ expectedIntent, expectedOwner, expectedStatus, expectedReply }) => {
      const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) ?? null;
      const text = document.body.innerText || "";
      return attr("[data-build-agent-turn-task]", "data-build-agent-turn-task") === "BLD-AGT-001"
        && attr("[data-build-agent-turn-intent]", "data-build-agent-turn-intent") === expectedIntent
        && attr("[data-build-agent-turn-owner]", "data-build-agent-turn-owner") === expectedOwner
        && attr("[data-build-agent-turn-status]", "data-build-agent-turn-status") === expectedStatus
        && attr("[data-build-agent-turn-may-claim-changed]", "data-build-agent-turn-may-claim-changed") === "false"
        && text.includes(expectedReply);
    },
    boundaryCase,
    { timeout: 30000 },
  );
  const afterMessage = await dump(page, `${boundaryCase.label}-after-message`);
  await page.screenshot({ path: `${screenshotPrefix}-${boundaryCase.label}-after-message.png`, fullPage: true });
  const afterProject = await summarizeProject();

  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector(`[data-runtime-project-id="${projectId}"]`, { timeout: 30000 });
  await page.waitForFunction(
    ({ expectedIntent, expectedOwner, expectedStatus }) => {
      const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) ?? null;
      return attr("[data-build-agent-turn-task]", "data-build-agent-turn-task") === "BLD-AGT-001"
        && attr("[data-build-agent-turn-intent]", "data-build-agent-turn-intent") === expectedIntent
        && attr("[data-build-agent-turn-owner]", "data-build-agent-turn-owner") === expectedOwner
        && attr("[data-build-agent-turn-status]", "data-build-agent-turn-status") === expectedStatus;
    },
    boundaryCase,
    { timeout: 30000 },
  );
  const afterRefresh = await dump(page, `${boundaryCase.label}-after-refresh`);
  await page.screenshot({ path: `${screenshotPrefix}-${boundaryCase.label}-after-refresh.png`, fullPage: true });
  const afterRefreshProject = await summarizeProject();

  const passed = Boolean(
    afterMessage.pathname === "/loop"
      && afterMessage.projectIdParam === projectId
      && afterMessage.hasQaState === false
      && afterMessage.hasNexusState === false
      && afterMessage.runtimeProjectId === projectId
      && afterMessage.buildAgentIntent === boundaryCase.expectedIntent
      && afterMessage.buildAgentOwner === boundaryCase.expectedOwner
      && afterMessage.buildAgentStatus === boundaryCase.expectedStatus
      && afterMessage.buildAgentBoundaryLabel === boundaryCase.expectedBoundaryLabel
      && afterMessage.buildAgentMayClaimChanged === "false"
      && afterMessage.text.includes(boundaryCase.expectedReply)
      && afterProject.buildAgentTurnIntent === boundaryCase.expectedIntent
      && afterProject.buildAgentTurnOwner === boundaryCase.expectedOwner
      && afterProject.buildAgentTurnStatus === boundaryCase.expectedStatus
      && afterProject.buildAgentMayClaimChanged === false
      && afterRefresh.projectIdParam === projectId
      && afterRefresh.runtimeProjectId === projectId
      && afterRefresh.buildAgentIntent === boundaryCase.expectedIntent
      && afterRefresh.buildAgentOwner === boundaryCase.expectedOwner
      && afterRefresh.buildAgentStatus === boundaryCase.expectedStatus
      && afterRefreshProject.buildAgentTurnIntent === boundaryCase.expectedIntent
      && afterRefreshProject.buildAgentTurnOwner === boundaryCase.expectedOwner
      && afterRefreshProject.buildAgentTurnStatus === boundaryCase.expectedStatus
  );

  return {
    label: boundaryCase.label,
    message: boundaryCase.message,
    passed,
    afterMessage,
    afterProject,
    afterRefresh,
    afterRefreshProject,
  };
}

async function main() {
  await ensureTestProject();
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

  await page.goto(`${baseUrl}/?qa=1`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.evaluate((storedUser) => {
    localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
  }, appUser);

  await page.goto(`${baseUrl}/loop?projectId=${encodeURIComponent(projectId)}`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForSelector(`[data-runtime-project-id="${projectId}"]`, { timeout: 30000 });
  const before = await dump(page, "before-boundaries");
  await page.screenshot({ path: `${screenshotPrefix}-before-boundaries.png`, fullPage: true });

  const results = [];
  for (const boundaryCase of cases) {
    results.push(await runCase(page, boundaryCase));
  }

  const passed = Boolean(
    before.pathname === "/loop"
      && before.projectIdParam === projectId
      && before.hasQaState === false
      && before.hasNexusState === false
      && before.runtimeProjectId === projectId
      && results.every((result) => result.passed)
  );

  const summary = {
    passed,
    taskId: "BLD-AGT-001",
    projectId,
    userId,
    baseUrl,
    before,
    results,
    consoleErrors,
    apiResponses,
    screenshots: [
      `${screenshotPrefix}-before-boundaries.png`,
      ...cases.flatMap((boundaryCase) => [
        `${screenshotPrefix}-${boundaryCase.label}-filled.png`,
        `${screenshotPrefix}-${boundaryCase.label}-after-message.png`,
        `${screenshotPrefix}-${boundaryCase.label}-after-refresh.png`,
      ]),
    ],
  };

  const reportPath = `${screenshotPrefix}-report.json`;
  await fs.writeFile(reportPath, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ passed, reportPath, projectId, userId }, null, 2));

  await browser.close();
  if (!passed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
