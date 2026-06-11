import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `slice007-user-${now}`;
const projectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `slice007-proof-${now}`;
const screenshotPrefix = process.env.NEXUS_SLICE007_SCREENSHOT_PREFIX
  ?? `/private/tmp/nexus-slice-007-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק חזרה ושחזור",
};

const projectGoal = "כלי פנימי לניהול לידים עם רשימת לידים, סטטוס, אחראי, תזכורת וצעד הבא. בלי חיבור וואטסאפ אמיתי, תשלום או פרסום.";

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

async function getProject() {
  return apiJson(`/api/projects/${projectId}`, {
    headers: { "x-user-id": userId },
  });
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
      name: "המשכיות לידים",
      goal: projectGoal,
      artifactExpectation: {
        projectType: "internal tool",
        deliverableLabel: "המשכיות לידים",
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
        selectedBy: "slice-007-live-proof",
      },
    });
  }

  await apiJson(`/api/projects/${projectId}/build-mutations`, {
    method: "POST",
    headers: { "x-user-id": userId },
    body: {
      requestText: "הוסף ליד חדש בשם ליד המשכיות",
      operationId: "record.create",
      payload: {
        label: "ליד המשכיות",
        status: "פתוח",
        owner: "לא משויך",
        reminder: "היום",
        nextStep: "לחזור אליו אחרי רענון",
      },
      requestedBy: "slice-007-live-proof",
    },
  });

  return getProject();
}

async function dump(page, label) {
  return page.evaluate((dumpLabel) => {
    const text = document.body.innerText || "";
    const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) ?? null;
    const visibleAttr = (selector, name) => {
      const element = Array.from(document.querySelectorAll(selector)).find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        const style = window.getComputedStyle(candidate);
        return rect.width > 0
          && rect.height > 0
          && style.visibility !== "hidden"
          && style.display !== "none"
          && candidate.closest("[hidden]") === null;
      });
      return element?.getAttribute(name) ?? null;
    };
    const url = new URL(location.href);
    return {
      label: dumpLabel,
      url: location.href,
      pathname: location.pathname,
      projectIdParam: url.searchParams.get("projectId"),
      hasQaState: url.searchParams.has("qaState") || url.searchParams.has("nexusState"),
      appScreen: document.body.dataset.appScreen ?? null,
      shellRoute: document.body.dataset.shellRoute ?? null,
      runtimeProjectId: attr("[data-runtime-project-id]", "data-runtime-project-id"),
      runtimeTask: attr("[data-runtime-skeleton-task]", "data-runtime-skeleton-task"),
      mutationTask: attr("[data-build-mutation-task]", "data-build-mutation-task"),
      mutationStatus: attr("[data-build-mutation-task]", "data-build-mutation-status"),
      railRoute: visibleAttr("[data-nexus-workspace-rail]", "data-nexus-rail-active-route"),
      hasLead: text.includes("ליד המשכיות"),
      hasMutationSummary: text.includes("נוסף ליד זמני") || text.includes("ליד המשכיות"),
      hasCreateQuestion: text.includes("מה אתה רוצה לבנות?"),
      bodyExcerpt: text.slice(0, 1800),
    };
  }, label);
}

async function assertProjectVisible(page, label) {
  await page.waitForFunction((expectedProjectId) => {
    const text = document.body.innerText || "";
    return document.querySelector(`[data-runtime-project-id="${expectedProjectId}"]`)
      && text.includes("ליד המשכיות");
  }, projectId, { timeout: 20_000 });
  const state = await dump(page, label);
  if (state.projectIdParam !== projectId || state.hasQaState || state.runtimeProjectId !== projectId || !state.hasLead || state.railRoute !== "loop") {
    throw new Error(`${label} did not restore project truth: ${JSON.stringify(state, null, 2)}`);
  }
  return state;
}

async function clickVisibleShellTarget(page, target) {
  const clicked = await page.evaluate((targetRoute) => {
    const candidates = Array.from(document.querySelectorAll(`[data-nexus-ui-target="${targetRoute}"]`));
    const visibleButton = candidates.find((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0
        && rect.height > 0
        && style.visibility !== "hidden"
        && style.display !== "none"
        && element.closest("[hidden]") === null
        && element.getAttribute("aria-hidden") !== "true";
    });
    if (!visibleButton) {
      return null;
    }
    const before = {
      route: targetRoute,
      text: visibleButton.textContent?.trim?.() ?? "",
      screenId: visibleButton.closest(".app-screen")?.id ?? null,
      ariaCurrent: visibleButton.getAttribute("aria-current"),
      url: location.href,
    };
    visibleButton.click();
    return {
      ...before,
      afterUrl: location.href,
    };
  }, target);
  if (!clicked) {
    throw new Error(`No visible shell route button found for ${target}`);
  }
  return clicked;
}

async function main() {
  await createProject();

  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    slowMo: Number(process.env.NEXUS_LIVE_SLOW_MO ?? 100),
  });
  const page = await browser.newPage({ viewport: { width: 1500, height: 940 } });
  const apiResponses = [];
  const consoleErrors = [];

  page.on("response", (response) => {
    if (response.url().includes("/api/")) {
      apiResponses.push({
        method: response.request().method(),
        url: response.url(),
        status: response.status(),
      });
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.addInitScript((storedUser) => {
    localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
  }, appUser);

  const cleanLoopUrl = `${baseUrl}/loop?projectId=${encodeURIComponent(projectId)}`;
  await page.goto(cleanLoopUrl, { waitUntil: "domcontentloaded" });
  const initial = await assertProjectVisible(page, "initial-loop");
  await page.screenshot({ path: `${screenshotPrefix}-initial-loop.png`, fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  const afterRefresh = await assertProjectVisible(page, "after-refresh");
  await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });

  const homeClick = await clickVisibleShellTarget(page, "home");
  await page.waitForTimeout(500);
  const afterHomeClickAttempt = await dump(page, "after-home-click-attempt");
  try {
    await page.waitForFunction((expectedProjectId) => {
      const url = new URL(location.href);
      return location.pathname === "/home" && url.searchParams.get("projectId") === expectedProjectId;
    }, projectId, { timeout: 10_000 });
  } catch (error) {
    throw new Error(`Home detour did not receive project continuity: ${JSON.stringify({ homeClick, afterHomeClickAttempt }, null, 2)}`, {
      cause: error,
    });
  }
  const homeState = await dump(page, "home-detour");
  await page.screenshot({ path: `${screenshotPrefix}-home-detour.png`, fullPage: true });
  if (homeState.projectIdParam !== projectId || homeState.hasQaState || homeState.hasCreateQuestion) {
    throw new Error(`Home detour lost project continuity: ${JSON.stringify(homeState, null, 2)}`);
  }

  await clickVisibleShellTarget(page, "loop");
  const afterReturn = await assertProjectVisible(page, "after-return-to-build");
  await page.screenshot({ path: `${screenshotPrefix}-after-return-to-build.png`, fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  const afterReturnRefresh = await assertProjectVisible(page, "after-return-refresh");
  await page.screenshot({ path: `${screenshotPrefix}-after-return-refresh.png`, fullPage: true });

  await page.goBack({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const afterGoBackAttempt = await dump(page, "after-browser-back-attempt");
  if (
    afterGoBackAttempt.projectIdParam !== projectId
    || afterGoBackAttempt.hasQaState
    || afterGoBackAttempt.hasCreateQuestion
    || (afterGoBackAttempt.pathname === "/loop" && !afterGoBackAttempt.hasLead)
  ) {
    throw new Error(`Browser back lost project continuity: ${JSON.stringify(afterGoBackAttempt, null, 2)}`);
  }
  const afterBrowserBack = await dump(page, "after-browser-back");
  await page.screenshot({ path: `${screenshotPrefix}-after-browser-back.png`, fullPage: true });

  await page.goForward({ waitUntil: "domcontentloaded" });
  const afterBrowserForward = await assertProjectVisible(page, "after-browser-forward");
  await page.screenshot({ path: `${screenshotPrefix}-after-browser-forward.png`, fullPage: true });

  await page.waitForTimeout(1500);
  const badApiResponses = apiResponses.filter((response) => response.status >= 400);
  const liveEventFailures = badApiResponses.filter((response) => response.url.includes("/live-events"));
  if (liveEventFailures.length > 0) {
    throw new Error(`Live events still fail during authenticated project session: ${JSON.stringify(liveEventFailures, null, 2)}`);
  }

  const project = await getProject();
  const report = {
    taskId: "SLICE-007",
    baseUrl,
    cleanLoopUrl,
    userId,
    projectId,
    screenshots: {
      initial: `${screenshotPrefix}-initial-loop.png`,
      afterRefresh: `${screenshotPrefix}-after-refresh.png`,
      homeDetour: `${screenshotPrefix}-home-detour.png`,
      afterReturn: `${screenshotPrefix}-after-return-to-build.png`,
      afterReturnRefresh: `${screenshotPrefix}-after-return-refresh.png`,
      afterBrowserBack: `${screenshotPrefix}-after-browser-back.png`,
      afterBrowserForward: `${screenshotPrefix}-after-browser-forward.png`,
    },
    states: {
      initial,
      afterRefresh,
      afterHomeClickAttempt,
      homeState,
      afterReturn,
      afterReturnRefresh,
      afterGoBackAttempt,
      afterBrowserBack,
      afterBrowserForward,
    },
    projectSummary: {
      mutationHistoryCount: project.buildMutationHistory?.length ?? 0,
      domainRecordCount: project.productDomainSkeleton?.state?.records?.length ?? 0,
      runtimeTableRowCount: project.runtimeSkeletonTruth?.tableRows?.length ?? 0,
      lastMutationVisibleSummary: project.buildMutationHistory?.at(-1)?.visibleSummary ?? null,
    },
    badApiResponses,
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
