import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `bld-live-user-${now}`;
const projectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `bld-agent-live-proof-${now}`;
const screenshotPrefix = process.env.NEXUS_BLD_AGT_SCREENSHOT_PREFIX
  ?? `/private/tmp/nexus-bld-agt-001-live-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק חי",
};

const projectIdea = "כלי פנימי לניהול לידים עם סטטוס אחראי תזכורת וצעד הבא";
const buildMessage = "תוסיף שדה מקור ליד";

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
      goal: projectIdea,
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
    runtimeTruthTask: project.runtimeSkeletonTruth?.truthTaskId ?? null,
    runtimeFields: project.runtimeSkeletonTruth?.fields ?? [],
    domainId: project.productDomainSkeleton?.productDomainSkeletonId ?? null,
    domainFields: project.productDomainSkeleton?.models?.[0]?.fields?.map((field) => field.name) ?? [],
    buildMutationStatus: project.buildMutationTruth?.status ?? null,
    buildMutationOperation: project.buildMutationTruth?.lastOperationId ?? null,
    buildMutationHistoryCount: project.buildMutationHistory?.length ?? 0,
    buildAgentTurnStatus: project.buildAgentTurnState?.status ?? null,
    buildAgentTurnOwner: project.buildAgentTurnState?.owner ?? null,
    buildAgentMayClaimChanged: project.buildAgentTurnState?.mayClaimChanged ?? null,
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
      domainTask: attr("[data-product-domain-task]", "data-product-domain-task"),
      buildMutationTask: attr("[data-build-mutation-task]", "data-build-mutation-task"),
      buildMutationStatus: attr("[data-build-mutation-status]", "data-build-mutation-status"),
      buildMutationOperation: attr("[data-build-mutation-operation]", "data-build-mutation-operation"),
      buildAgentTask: attr("[data-build-agent-turn-task]", "data-build-agent-turn-task"),
      buildAgentStatus: attr("[data-build-agent-turn-status]", "data-build-agent-turn-status"),
      buildAgentOwner: attr("[data-build-agent-turn-owner]", "data-build-agent-turn-owner"),
      buildAgentMayClaimChanged: attr("[data-build-agent-turn-may-claim-changed]", "data-build-agent-turn-may-claim-changed"),
      hasLeadSourceField: text.includes("מקור ליד"),
      hasAppliedReply: text.includes("נוסף שדה מקור ליד"),
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
    const text = document.body.innerText || "";
    const operation = document
      .querySelector("[data-build-mutation-operation]")
      ?.getAttribute("data-build-mutation-operation");
    return text.includes("מקור ליד") && operation === "record.addField";
  }, { timeout: 30000 });
  const afterMessage = await dump(page, "after-message");
  await page.screenshot({ path: `${screenshotPrefix}-after-message.png`, fullPage: true });
  const afterMutationProject = await summarizeProject();

  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector(`[data-runtime-project-id="${projectId}"]`, { timeout: 30000 });
  await page.waitForFunction(() => {
    const text = document.body.innerText || "";
    const operation = document
      .querySelector("[data-build-mutation-operation]")
      ?.getAttribute("data-build-mutation-operation");
    return text.includes("מקור ליד") && operation === "record.addField";
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
    && afterMessage.buildMutationOperation === "record.addField"
    && afterMessage.hasLeadSourceField === true
    && afterRefresh.projectIdParam === projectId
    && afterRefresh.runtimeProjectId === projectId
    && afterRefresh.buildMutationOperation === "record.addField"
    && afterRefresh.hasLeadSourceField === true
    && afterRefreshProject.runtimeFields.includes("מקור ליד")
    && afterRefreshProject.domainFields.includes("מקור ליד")
    && afterRefreshProject.buildMutationOperation === "record.addField"
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
    afterMutationProject,
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
