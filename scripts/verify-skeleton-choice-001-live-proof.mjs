import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `skeleton-choice-user-${now}`;
const projectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `skeleton-choice-project-${now}`;
const screenshotPrefix = process.env.NEXUS_SKELETON_CHOICE_SCREENSHOT_PREFIX
  ?? `/private/tmp/nexus-skeleton-choice-001-${now}`;

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
      userInput: {
        userId,
        email: `${userId}@example.test`,
        displayName: "בודק בחירת שלד",
      },
      credentials: {
        password: "TestOnly123!",
      },
    },
  });

  await apiJson("/api/projects", {
    method: "POST",
    headers: { "x-user-id": userId },
    body: {
      id: projectId,
      name: "ניהול לידים חי",
      goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא. לא לבנות חיבור וואטסאפ אמיתי, תשלום או פרסום.",
    },
  });

  return apiJson(`/api/projects/${projectId}`, {
    headers: { "x-user-id": userId },
  });
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
    const candidates = [...document.querySelectorAll("[data-skeleton-choice-candidate-id]")].map((node) => ({
      candidateId: node.getAttribute("data-skeleton-choice-candidate-id"),
      label: node.getAttribute("data-skeleton-choice-candidate-label"),
      selected: node.getAttribute("data-skeleton-choice-candidate-selected"),
      text: (node.innerText || "").slice(0, 400),
    }));
    return {
      label: dumpLabel,
      url: location.href,
      pathname: location.pathname,
      projectIdParam: new URL(location.href).searchParams.get("projectId"),
      hasQaState: new URL(location.href).searchParams.has("qaState"),
      skeletonChoiceTask: attr("[data-skeleton-choice-task]", "data-skeleton-choice-task"),
      skeletonChoiceStatus: attr("[data-skeleton-choice-task]", "data-skeleton-choice-status"),
      selectedSkeletonCandidateId: attr("[data-skeleton-choice-task]", "data-skeleton-choice-selected-candidate-id"),
      providerFailureCount: attr("[data-skeleton-choice-task]", "data-skeleton-choice-provider-failure-count"),
      runtimeProjectId: attr("[data-runtime-project-id]", "data-runtime-project-id"),
      buildAgentSelectedCandidateId: attr("[data-build-agent-turn-task]", "data-build-agent-turn-selected-candidate-id"),
      buildAgentIntent: attr("[data-build-agent-turn-task]", "data-build-agent-turn-intent"),
      candidates,
      visibleProviderLeak: /nexus-operational-composition|nexus-premium-composition|external-figma-design-provider|providerId/.test(text),
      bodyExcerpt: text.slice(0, 1800),
    };
  }, label);
}

async function fillLastComposer(page, text) {
  const inputs = page.locator("textarea, input[type='text'], [contenteditable='true']");
  const count = await inputs.count();
  for (let index = count - 1; index >= 0; index -= 1) {
    const input = inputs.nth(index);
    if (await input.isVisible().catch(() => false)) {
      await input.click();
      await input.fill(text);
      return true;
    }
  }
  return false;
}

async function main() {
  const initialProject = await createProject();
  if (initialProject.skeletonChoiceTruth?.taskId !== "SKELETON-CHOICE-001") {
    throw new Error("Project did not create skeleton choice truth.");
  }
  if (initialProject.skeletonChoiceTruth.candidates.length < 3) {
    throw new Error("Expected at least 3 skeleton candidates.");
  }

  const browser = await chromium.launch({ channel: "chrome", headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });
  await page.addInitScript((appUser) => {
    window.localStorage.setItem("nexus.appUser", JSON.stringify(appUser));
  }, {
    email: `${userId}@example.test`,
    password: "TestOnly123!",
    userId,
    displayName: "בודק בחירת שלד",
  });
  await page.goto(`${baseUrl}/loop?projectId=${projectId}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector("[data-skeleton-choice-task='SKELETON-CHOICE-001']", { timeout: 30000 });
  const beforeSelection = await dump(page, "before-selection");
  if (beforeSelection.projectIdParam !== projectId || beforeSelection.hasQaState) {
    throw new Error("Live route is not clean projectId loop route.");
  }
  if (beforeSelection.candidates.length < 3 || beforeSelection.visibleProviderLeak) {
    throw new Error("Candidate surface failed visible provider/name checks.");
  }
  await page.screenshot({ path: `${screenshotPrefix}-before-selection.png`, fullPage: true });

  const firstButton = page.locator("[data-skeleton-choice-select]").first();
  await firstButton.click();
  await page.waitForFunction(() => {
    const selected = document.querySelector("[data-skeleton-choice-task]")?.getAttribute("data-skeleton-choice-selected-candidate-id");
    return Boolean(selected);
  }, null, { timeout: 30000 });
  const afterSelection = await dump(page, "after-selection");
  await page.screenshot({ path: `${screenshotPrefix}-after-selection.png`, fullPage: true });

  const selectedCandidateId = afterSelection.selectedSkeletonCandidateId;
  if (!selectedCandidateId) {
    throw new Error("No selected skeleton candidate after click.");
  }

  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector(`[data-skeleton-choice-selected-candidate-id="${selectedCandidateId}"]`, { timeout: 30000 });
  const afterRefresh = await dump(page, "after-refresh");
  await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });
  if (afterRefresh.selectedSkeletonCandidateId !== selectedCandidateId) {
    throw new Error("Selected candidate did not restore after refresh.");
  }

  const composerFound = await fillLastComposer(page, "תוסיף שדה מקור ליד");
  if (!composerFound) {
    throw new Error("No visible Build rail composer found.");
  }
  await page.locator("[data-agent-rail-send]").click();
  await page.waitForFunction((candidateId) => {
    const route = document.querySelector("[data-build-agent-turn-task]");
    return route?.getAttribute("data-build-agent-turn-task") === "BLD-AGT-001"
      && route?.getAttribute("data-build-agent-turn-selected-candidate-id") === candidateId
      && route?.getAttribute("data-build-agent-turn-may-claim-changed") === "true";
  }, selectedCandidateId, { timeout: 30000 });
  const afterAgentMutation = await dump(page, "after-agent-mutation");
  await page.screenshot({ path: `${screenshotPrefix}-after-agent-mutation.png`, fullPage: true });
  const finalProject = await getProject();

  const report = {
    taskId: "SKELETON-CHOICE-001",
    baseUrl,
    projectId,
    userId,
    selectedCandidateId,
    beforeSelection,
    afterSelection,
    afterRefresh,
    afterAgentMutation,
    projectTruth: {
      skeletonChoiceStatus: finalProject.skeletonChoiceTruth?.status ?? null,
      selectedSkeletonCandidateId: finalProject.skeletonChoiceTruth?.selectedSkeletonCandidateId ?? null,
      downstreamHandoff: finalProject.skeletonChoiceTruth?.downstreamHandoff ?? null,
      providerFailures: finalProject.skeletonChoiceTruth?.providerFailures ?? [],
      buildAgentSelectedCandidateId: finalProject.buildAgentTurnState?.selectedSkeletonCandidateId ?? null,
      buildMutationSelectedCandidateId: finalProject.buildMutationIntents?.at(-1)?.selectedSkeletonCandidateId ?? null,
      learningHasSelectionEvent: finalProject.runtimeLearningEvents?.some((event) => event.eventType === "skeleton_choice.selected") ?? false,
    },
    screenshots: {
      beforeSelection: `${screenshotPrefix}-before-selection.png`,
      afterSelection: `${screenshotPrefix}-after-selection.png`,
      afterRefresh: `${screenshotPrefix}-after-refresh.png`,
      afterAgentMutation: `${screenshotPrefix}-after-agent-mutation.png`,
    },
  };
  const reportPath = `${screenshotPrefix}-report.json`;
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ok: true, reportPath, projectId, selectedCandidateId }, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
