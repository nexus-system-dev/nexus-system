import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `slice006-user-${now}`;
const projectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `slice006-proof-${now}`;
const screenshotPrefix = process.env.NEXUS_SLICE006_SCREENSHOT_PREFIX
  ?? `/private/tmp/nexus-slice-006-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק שינוי שיחה",
};

const projectGoal = "כלי פנימי לניהול לידים שמציג רשימת לידים, סטטוס, אחראי, תזכורת וצעד הבא. לא לבנות חיבור וואטסאפ אמיתי, תשלום או פרסום.";
const mutationMessage = "הוסף ליד חדש";
const externalBoundaryMessage = "תחבר לי וואטסאפ אמיתי ותפרסם לינק ללקוחות בלי לשאול אותי";

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
      credentials: { password: "TestOnly123!" },
    },
  });

  await apiJson("/api/projects", {
    method: "POST",
    headers: { "x-user-id": userId },
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
  if (candidateId) {
    await apiJson(`/api/projects/${projectId}/skeleton-choice/select`, {
      method: "POST",
      headers: { "x-user-id": userId },
      body: {
        candidateId,
        selectedBy: "slice-006-live-proof",
      },
    });
  }
  return getProject();
}

async function getProject() {
  return apiJson(`/api/projects/${projectId}`, {
    headers: { "x-user-id": userId },
  });
}

async function dump(page, label) {
  return page.evaluate((dumpLabel) => {
    const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) ?? null;
    const text = document.body.innerText || "";
    return {
      label: dumpLabel,
      url: location.href,
      projectIdParam: new URL(location.href).searchParams.get("projectId"),
      hasQaState: new URL(location.href).searchParams.has("qaState"),
      runtimeProjectId: attr("[data-runtime-project-id]", "data-runtime-project-id"),
      runtimeTask: attr("[data-runtime-skeleton-task]", "data-runtime-skeleton-task"),
      mutationTask: attr("[data-build-mutation-task]", "data-build-mutation-task"),
      mutationStatus: attr("[data-build-mutation-task]", "data-build-mutation-status"),
      mutationOperation: attr("[data-build-mutation-task]", "data-build-mutation-operation"),
      buildAgentTask: attr("[data-build-agent-turn-task]", "data-build-agent-turn-task"),
      buildAgentStatus: attr("[data-build-agent-turn-task]", "data-build-agent-turn-status"),
      buildAgentOwner: attr("[data-build-agent-turn-task]", "data-build-agent-turn-owner"),
      buildAgentMayClaimChanged: attr("[data-build-agent-turn-task]", "data-build-agent-turn-may-claim-changed"),
      summaryText: document.querySelector("[data-build-mutation-user-summary]")?.innerText ?? "",
      transcriptText: document.querySelector("[data-agent-rail-thread]")?.innerText ?? "",
      hasNewLead: text.includes("ליד חדש מבדיקה"),
      hasProductSummary: text.includes("נוסף ליד זמני"),
      hasInternalRecordCreateText: text.includes("פעולה בוצעה: record.create") || text.includes("עודכן דרך record.create"),
      hasProviderBoundary: text.includes("לא אחבר") || text.includes("לא אפרסם") || text.includes("בלי אישור"),
      bodyExcerpt: text.slice(0, 2400),
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
      // Keep searching.
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

async function waitForMutation(page) {
  await page.waitForFunction(() => {
    const text = document.body.innerText || "";
    const mutation = document.querySelector("[data-build-mutation-task]");
    return mutation
      && mutation.getAttribute("data-build-mutation-status") === "applied"
      && mutation.getAttribute("data-build-mutation-operation") === "record.create"
      && text.includes("ליד חדש מבדיקה")
      && text.includes("נוסף ליד זמני");
  }, { timeout: 20_000 });
}

async function waitForBoundary(page) {
  await page.waitForFunction(() => {
    const text = document.body.innerText || "";
    const agent = document.querySelector("[data-build-agent-turn-task]");
    return agent
      && (agent.getAttribute("data-build-agent-turn-status") === "blocked"
        || agent.getAttribute("data-build-agent-turn-requires-approval") === "true")
      && (text.includes("לא אחבר") || text.includes("לא אפרסם") || text.includes("בלי אישור"));
  }, { timeout: 20_000 });
}

async function main() {
  await createProject();

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

  const cleanLoopUrl = `${baseUrl}/loop?projectId=${encodeURIComponent(projectId)}`;
  await page.goto(cleanLoopUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(`[data-runtime-project-id="${projectId}"]`, { timeout: 20_000 });
  const before = await dump(page, "before");
  await page.screenshot({ path: `${screenshotPrefix}-before.png`, fullPage: true });

  if (before.projectIdParam !== projectId || before.hasQaState) {
    throw new Error(`Loop route is not clean project truth: ${JSON.stringify(before)}`);
  }

  if (!await fillLastComposer(page, mutationMessage)) {
    throw new Error("No visible Build rail composer was found.");
  }
  await submitVisibleComposer(page);
  await waitForMutation(page);
  const afterMutation = await dump(page, "after-mutation");
  await page.screenshot({ path: `${screenshotPrefix}-after-mutation.png`, fullPage: true });
  if (afterMutation.hasInternalRecordCreateText) {
    throw new Error("Internal record.create copy is visible to the user.");
  }

  const projectAfterMutation = await getProject();
  const mutationHistoryCount = projectAfterMutation.buildMutationHistory?.length ?? 0;
  if (mutationHistoryCount < 1) {
    throw new Error("Mutation history was not persisted after Build rail mutation.");
  }

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(`[data-runtime-project-id="${projectId}"]`, { timeout: 20_000 });
  await waitForMutation(page);
  const afterRefresh = await dump(page, "after-refresh");
  await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });
  if (!afterRefresh.transcriptText.includes(mutationMessage)) {
    throw new Error("Build rail transcript did not restore after refresh.");
  }
  if (afterRefresh.hasInternalRecordCreateText) {
    throw new Error("Internal record.create copy became visible after refresh.");
  }

  const operationButton = page.locator("[data-product-domain-operation='record.create']").first();
  if (!await operationButton.count()) {
    throw new Error("No visible runtime record.create control exists.");
  }
  await operationButton.click();
  await page.waitForFunction((previousCount) => {
    const mutation = document.querySelector("[data-build-mutation-task]");
    const text = document.body.innerText || "";
    return mutation
      && mutation.getAttribute("data-build-mutation-status") === "applied"
      && text.includes("נוסף ליד זמני")
      && !text.includes("פעולה בוצעה: record.create")
      && !text.includes("עודכן דרך record.create");
  }, mutationHistoryCount, { timeout: 20_000 });
  const afterButtonMutation = await dump(page, "after-button-mutation");
  await page.screenshot({ path: `${screenshotPrefix}-after-button-mutation.png`, fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(`[data-runtime-project-id="${projectId}"]`, { timeout: 20_000 });
  const afterButtonRefresh = await dump(page, "after-button-refresh");
  await page.screenshot({ path: `${screenshotPrefix}-after-button-refresh.png`, fullPage: true });
  const projectAfterButtonRefresh = await getProject();
  if ((projectAfterButtonRefresh.buildMutationHistory?.length ?? 0) <= mutationHistoryCount) {
    throw new Error("Runtime button mutation did not persist to project history.");
  }
  if (afterButtonRefresh.hasInternalRecordCreateText) {
    throw new Error("Internal record.create copy became visible after runtime button refresh.");
  }

  if (!await fillLastComposer(page, externalBoundaryMessage)) {
    throw new Error("No visible Build rail composer was found for boundary check.");
  }
  await submitVisibleComposer(page);
  await waitForBoundary(page);
  const afterBoundary = await dump(page, "after-boundary");
  await page.screenshot({ path: `${screenshotPrefix}-after-boundary.png`, fullPage: true });
  const projectAfterBoundary = await getProject();
  if ((projectAfterBoundary.buildMutationHistory?.length ?? 0) !== (projectAfterButtonRefresh.buildMutationHistory?.length ?? 0)) {
    throw new Error("External provider boundary request changed mutation history.");
  }

  const report = {
    taskId: "SLICE-006",
    baseUrl,
    cleanLoopUrl,
    userId,
    projectId,
    screenshots: {
      before: `${screenshotPrefix}-before.png`,
      afterMutation: `${screenshotPrefix}-after-mutation.png`,
      afterRefresh: `${screenshotPrefix}-after-refresh.png`,
      afterButtonMutation: `${screenshotPrefix}-after-button-mutation.png`,
      afterButtonRefresh: `${screenshotPrefix}-after-button-refresh.png`,
      afterBoundary: `${screenshotPrefix}-after-boundary.png`,
    },
    before,
    afterMutation,
    afterRefresh,
    afterButtonMutation,
    afterButtonRefresh,
    afterBoundary,
    projectSummary: {
      mutationHistoryCount: projectAfterBoundary.buildMutationHistory?.length ?? 0,
      transcriptCount: projectAfterBoundary.companionConversation?.transcript?.length ?? 0,
      domainRecordCount: projectAfterBoundary.productDomainSkeleton?.state?.records?.length ?? 0,
      runtimeTableRowCount: projectAfterBoundary.runtimeSkeletonTruth?.tableRows?.length ?? 0,
      lastMutationVisibleSummary: projectAfterBoundary.buildMutationHistory?.at(-1)?.visibleSummary ?? null,
    },
    apiResponses,
    consoleErrors,
  };
  const reportPath = `${screenshotPrefix}-report.json`;
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ reportPath, ...report.projectSummary }, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
