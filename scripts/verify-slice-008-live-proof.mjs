import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `slice008-user-${now}`;
const projectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `slice008-proof-${now}`;
const screenshotPrefix = process.env.NEXUS_SLICE008_SCREENSHOT_PREFIX
  ?? `/private/tmp/nexus-slice-008-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק אמון ראשון",
};

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
      name: "אמון ראשון לניהול לידים",
      goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא. בלי חיבור וואטסאפ אמיתי, בלי תשלום ובלי פרסום.",
      artifactExpectation: {
        projectType: "internal tool",
        deliverableLabel: "שלד ראשון לניהול לידים",
      },
    },
  });

  return apiJson(`/api/projects/${projectId}`, {
    headers: { "x-user-id": userId },
  });
}

async function dump(page, label) {
  return page.evaluate((dumpLabel) => {
    const text = document.body.innerText || "";
    const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) ?? null;
    const url = new URL(location.href);
    return {
      label: dumpLabel,
      url: location.href,
      projectIdParam: url.searchParams.get("projectId"),
      appScreen: document.body.dataset.appScreen ?? null,
      runtimeProjectId: attr("[data-runtime-project-id]", "data-runtime-project-id"),
      firstSliceTrustTask: attr("[data-first-slice-trust-task]", "data-first-slice-trust-task"),
      releaseLabel: document.querySelector("[data-build-region='release-readiness-affordance']")?.textContent?.trim() ?? null,
      hasPrematureReadyClaim: /הפרויקט שלך מוכן|מוכן לשחרור|ready to release|publish/u.test(text),
      hasStandaloneBoundary: /גבול שחרור|חבילת מוצר עצמאית|בדיקות ואישור/u.test(text),
      hasRawOperationText: /record\.create|record\.update|record\.addField|פעולה בוצעה:/u.test(text),
      hasRawFieldLabels: /(^|\n)(name|status|owner|reminder|nextStep)(\n|$)/u.test(text),
      hasProductActionCopy: /נוסף ליד זמני|נשמר בפרויקט|עודכן בשלד/u.test(text),
      bodyExcerpt: text.slice(0, 1800),
    };
  }, label);
}

async function assertTrustState(page, label, { actionExpected = false } = {}) {
  await page.waitForFunction((expectedProjectId) => {
    return document.querySelector(`[data-runtime-project-id="${expectedProjectId}"]`)
      && document.querySelector("[data-first-slice-trust-task='SLICE-008']");
  }, projectId, { timeout: 20_000 });
  const state = await dump(page, label);
  if (
    state.projectIdParam !== projectId
    || state.runtimeProjectId !== projectId
    || state.firstSliceTrustTask !== "SLICE-008"
    || state.releaseLabel !== "גבול שחרור"
    || state.hasPrematureReadyClaim
    || state.hasRawOperationText
    || state.hasRawFieldLabels
    || (actionExpected && !state.hasProductActionCopy)
  ) {
    throw new Error(`${label} failed first-slice trust contract: ${JSON.stringify(state, null, 2)}`);
  }
  return state;
}

async function clickFirstCreateAction(page) {
  await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll("[data-product-domain-operation='record.create']")).find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      const style = window.getComputedStyle(candidate);
      return rect.width > 0
        && rect.height > 0
        && style.visibility !== "hidden"
        && style.display !== "none"
        && candidate.closest("[hidden]") === null;
    });
    if (!button) {
      throw new Error("No visible create action found");
    }
    button.click();
  });
  await page.waitForFunction(() => {
    const text = document.body.innerText || "";
    return /נוסף ליד זמני|נשמר בפרויקט|עודכן בשלד/u.test(text);
  }, { timeout: 20_000 });
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
  const initial = await assertTrustState(page, "initial-loop");
  await page.screenshot({ path: `${screenshotPrefix}-initial-loop.png`, fullPage: true });

  await clickFirstCreateAction(page);
  const afterAction = await assertTrustState(page, "after-action", { actionExpected: true });
  await page.screenshot({ path: `${screenshotPrefix}-after-action.png`, fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  const afterRefresh = await assertTrustState(page, "after-refresh", { actionExpected: true });
  await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });

  const badApiResponses = apiResponses.filter((response) => response.status >= 400);
  const report = {
    taskId: "SLICE-008",
    baseUrl,
    cleanLoopUrl,
    userId,
    projectId,
    screenshots: {
      initial: `${screenshotPrefix}-initial-loop.png`,
      afterAction: `${screenshotPrefix}-after-action.png`,
      afterRefresh: `${screenshotPrefix}-after-refresh.png`,
    },
    states: {
      initial,
      afterAction,
      afterRefresh,
    },
    badApiResponses,
  };
  const reportPath = `${screenshotPrefix}-report.json`;
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ reportPath, projectId, badApiResponseCount: badApiResponses.length }, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
