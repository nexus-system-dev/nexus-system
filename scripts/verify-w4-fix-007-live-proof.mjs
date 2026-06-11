import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const screenshotPrefix = process.env.NEXUS_W4_FIX_007_SCREENSHOT_PREFIX
  ?? "/private/tmp/nexus-w4-fix-007-live";

const idea = "אני רוצה כלי פנימי פשוט לניהול לידים לעסק קטן. בעל העסק ועוד שני עובדים מקבלים לידים מוואטסאפ ושיחות. הבעיה היא שלידים נופלים כי אין אחראי, אין תזכורת ואין צעד הבא. צריך לבנות עכשיו כלי פנימי, טבלה ודשבורד, עם רשימת לידים, מקור, סטטוס, אחראי, תזכורת וצעד הבא. הסטטוסים הם חדש, בטיפול, צריך לחזור ונסגר. לא לבנות חיבור וואטסאפ אמיתי, אוטומציות, תשלום או פרסום. אפשר להתקדם לבניית שלד ריצה ראשון עכשיו.";

const clarificationAnswers = [
  "כן. המשתמשים הם בעל העסק ושני עובדים. המסך הראשון צריך להיות רשימת לידים עם סטטוס, אחראי, תזכורת וצעד הבא. אפשר להתחיל לבנות שלד ריצה עכשיו.",
  "אין צורך בחיבור אמיתי. תשתמש בנתוני דוגמה ובמצב מקומי בלבד, ותפתח שלד ריצה ראשון.",
];

function summarizeApiResponses(responses) {
  return responses.slice(-80);
}

async function dump(page, label) {
  return page.evaluate((dumpLabel) => {
    const url = new URL(location.href);
    let flowState = {};
    try {
      flowState = JSON.parse(localStorage.getItem("nexus.flowState") || "{}");
    } catch {
      flowState = {};
    }

    return {
      label: dumpLabel,
      url: location.href,
      pathname: location.pathname,
      projectIdParam: url.searchParams.get("projectId"),
      hasQaState: url.searchParams.has("qaState"),
      hasNexusState: url.searchParams.has("nexusState"),
      hasQaReset: url.searchParams.has("qaReset"),
      screen: document.body.dataset.appScreen || null,
      currentProjectId: flowState.currentProjectId || null,
      flowScreen: flowState.screen || null,
      runtimeTask: document.querySelector("[data-runtime-skeleton-task]")?.getAttribute("data-runtime-skeleton-task") || null,
      runtimeProjectId: document.querySelector("[data-runtime-project-id]")?.getAttribute("data-runtime-project-id") || null,
      bodyText: (document.body.innerText || "").slice(0, 1800),
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
      // Try the next visible composer candidate.
    }
  }
  return false;
}

async function submitVisibleComposer(page) {
  const buttonNames = [/שלח|המשך|צור|בנה|התחל|→|↗|arrow/i];
  for (const name of buttonNames) {
    const button = page.getByRole("button", { name }).last();
    if (await button.count()) {
      try {
        await button.click({ timeout: 2500 });
        return true;
      } catch {
        // Try the next submit fallback.
      }
    }
  }

  await page.keyboard.press("Meta+Enter").catch(async () => {
    await page.keyboard.press("Enter");
  });
  return true;
}

async function main() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    slowMo: Number(process.env.NEXUS_LIVE_SLOW_MO ?? 90),
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 940 } });
  const apiResponses = [];
  const consoleErrors = [];

  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("/api/")) {
      apiResponses.push({
        url,
        status: response.status(),
        method: response.request().method(),
      });
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto(`${baseUrl}/?qa=1&qaReset=1`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(1500);
  const initial = await dump(page, "initial");

  if (!await fillLastComposer(page, idea)) {
    throw new Error("Could not find a visible create composer");
  }
  await page.screenshot({ path: `${screenshotPrefix}-filled.png`, fullPage: true });
  await submitVisibleComposer(page);

  const states = [];
  let reachedLoop = false;
  let clarificationIndex = 0;
  for (let second = 0; second < 110; second += 1) {
    await page.waitForTimeout(1000);
    const state = await dump(page, `wait-${second}`);
    states.push(state);
    if (
      state.pathname === "/loop"
      && state.projectIdParam
      && state.projectIdParam !== "project-draft"
      && state.runtimeTask
    ) {
      reachedLoop = true;
      break;
    }

    if (
      !state.runtimeTask
      && state.screen === "create"
      && /\?/.test(state.bodyText)
      && clarificationIndex < clarificationAnswers.length
      && (second === 18 || second === 38 || second === 58)
    ) {
      await fillLastComposer(page, clarificationAnswers[clarificationIndex]);
      clarificationIndex += 1;
      await submitVisibleComposer(page);
    }
  }

  const beforeRefresh = await dump(page, "before-refresh");
  await page.screenshot({ path: `${screenshotPrefix}-before-refresh-proof.png`, fullPage: true });

  let afterRefresh = null;
  let reloadError = null;
  try {
    await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(5000);
    afterRefresh = await dump(page, "after-refresh");
    await page.screenshot({ path: `${screenshotPrefix}-after-refresh-proof.png`, fullPage: true });
  } catch (error) {
    reloadError = String(error?.message ?? error);
    afterRefresh = await dump(page, "after-refresh-error").catch(() => null);
  }

  const passed = Boolean(
    reachedLoop
    && beforeRefresh.pathname === "/loop"
    && beforeRefresh.projectIdParam
    && beforeRefresh.projectIdParam !== "project-draft"
    && beforeRefresh.projectIdParam === beforeRefresh.runtimeProjectId
    && beforeRefresh.hasQaState === false
    && beforeRefresh.hasNexusState === false
    && afterRefresh?.pathname === "/loop"
    && afterRefresh?.projectIdParam === beforeRefresh.projectIdParam
    && afterRefresh?.runtimeProjectId === beforeRefresh.runtimeProjectId
    && afterRefresh?.runtimeTask === beforeRefresh.runtimeTask
  );

  const summary = {
    passed,
    initial,
    reachedLoop,
    beforeRefresh,
    afterRefresh,
    reloadError,
    consoleErrors,
    apiResponses: summarizeApiResponses(apiResponses),
    statesTail: states.slice(-10),
    screenshots: [
      `${screenshotPrefix}-filled.png`,
      `${screenshotPrefix}-before-refresh-proof.png`,
      `${screenshotPrefix}-after-refresh-proof.png`,
    ],
  };

  await fs.writeFile(`${screenshotPrefix}-summary.json`, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  await browser.close();

  if (!passed) {
    process.exitCode = 1;
  }
}

await main();
