import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = `id001-user-${now}`;
const projectId = `id001-project-${now}`;
const reportPath = `/private/tmp/nexus-id-001-${now}-report.json`;
const screenshotPrefix = `/private/tmp/nexus-id-001-${now}`;

async function apiJson(pathname, { method = "GET", body = null, headers = {} } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-user-id": userId,
      ...headers,
    },
    body: body ? JSON.stringify(body) : null,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`API ${method} ${pathname} failed ${response.status}: ${text.slice(0, 500)}`);
  }
  return payload;
}

async function setupIdentityAndProject() {
  await apiJson("/api/auth/signup", {
    method: "POST",
    body: {
      userInput: {
        userId,
        email: `${userId}@example.test`,
        displayName: "בודק זהות",
      },
      credentials: { password: "TestOnly123!" },
    },
  });

  await apiJson("/api/projects", {
    method: "POST",
    body: {
      id: projectId,
      name: "פרויקט בדיקת זהות",
      goal: "לוודא שהפרויקט נשמר תחת המשתמש המקומי אחרי רענון.",
    },
  });
}

async function readIdentityState(page) {
  return page.evaluate(async (expectedProjectId) => {
    const root = document.querySelector("[data-identity-task='ID-001']");
    const attr = (name) => root?.getAttribute(name) ?? null;
    const stored = JSON.parse(localStorage.getItem("nexus.appUser") || "null");
    let projectStatus = null;
    let projectUserId = null;
    try {
      const response = await fetch(`/api/projects/${expectedProjectId}`);
      projectStatus = response.status;
      if (response.ok) {
        const payload = await response.json();
        projectUserId = payload.userId ?? null;
      }
    } catch (error) {
      projectStatus = `error:${error?.message ?? "unknown"}`;
    }
    return {
      screen: document.body.dataset.appScreen || "",
      mode: attr("data-identity-mode"),
      status: attr("data-identity-status"),
      userId: attr("data-identity-user-id"),
      boundary: attr("data-identity-boundary"),
      storedUserId: stored?.userId ?? null,
      projectStatus,
      projectUserId,
      text: (document.body.innerText || "").slice(0, 1200),
    };
  }, projectId);
}

function assertIdentityState(state, expected) {
  const failures = [];
  for (const [key, value] of Object.entries(expected)) {
    if (state[key] !== value) {
      failures.push(`expected ${key}=${value}, got ${state[key]}`);
    }
  }
  if (!/שמירה מקומית|משתמש מקומי|רענון/u.test(state.text)) {
    failures.push("missing visible local identity boundary copy");
  }
  if (failures.length) {
    throw new Error(`ID-001 live proof failed: ${failures.join("; ")}\n${JSON.stringify(state, null, 2)}`);
  }
}

async function main() {
  await setupIdentityAndProject();

  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    slowMo: Number(process.env.NEXUS_LIVE_SLOW_MO ?? 80),
  });
  const page = await browser.newPage({ viewport: { width: 1365, height: 820 } });
  await page.setExtraHTTPHeaders({ "x-user-id": userId });
  await page.addInitScript((appUser) => {
    localStorage.setItem("nexus.appUser", JSON.stringify(appUser));
  }, {
    userId,
    email: `${userId}@example.test`,
    displayName: "בודק זהות",
  });

  await page.goto(`${baseUrl}/?qa=1`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-identity-task='ID-001']", { timeout: 20_000 });
  const initial = await readIdentityState(page);
  assertIdentityState(initial, {
    screen: "create",
    mode: "local-user",
    status: "active",
    userId,
    boundary: "local-first-release-session",
    storedUserId: userId,
    projectStatus: 200,
    projectUserId: userId,
  });
  await page.screenshot({ path: `${screenshotPrefix}-active.png`, fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-identity-task='ID-001']", { timeout: 20_000 });
  const afterRefresh = await readIdentityState(page);
  assertIdentityState(afterRefresh, {
    screen: "create",
    mode: "local-user",
    status: "active",
    userId,
    boundary: "local-first-release-session",
    storedUserId: userId,
    projectStatus: 200,
    projectUserId: userId,
  });
  await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });

  await page.setExtraHTTPHeaders({});
  await page.click("#create-local-identity-logout-button");
  await page.waitForFunction(() => {
    const root = document.querySelector("[data-identity-task='ID-001']");
    return root?.getAttribute("data-identity-status") === "logged-out"
      && !localStorage.getItem("nexus.appUser");
  }, null, { timeout: 20_000 });
  const afterLogout = await readIdentityState(page);
  assertIdentityState(afterLogout, {
    screen: "create",
    mode: "not-started",
    status: "logged-out",
    userId: "",
    boundary: "local-first-release-session",
    storedUserId: null,
    projectStatus: 401,
    projectUserId: null,
  });
  await page.screenshot({ path: `${screenshotPrefix}-after-logout.png`, fullPage: true });

  await browser.close();

  const report = {
    taskId: "ID-001",
    baseUrl,
    userId,
    projectId,
    reportPath,
    screenshots: {
      active: `${screenshotPrefix}-active.png`,
      afterRefresh: `${screenshotPrefix}-after-refresh.png`,
      afterLogout: `${screenshotPrefix}-after-logout.png`,
    },
    states: {
      initial,
      afterRefresh,
      afterLogout,
    },
  };
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
