// SURFACE-OWNER-RUNTIME-001 — live visible route ownership proof.
//
// Run:
// NEXUS_BASE_URL=http://127.0.0.1:4011 node scripts/verify-surface-owner-runtime-001-live-proof.mjs

import fs from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function loadChromium() {
  const packageNames = ["playwright-core", "playwright"];
  for (const packageName of packageNames) {
    try {
      return require(packageName).chromium;
    } catch {}
  }
  try {
    const runtimeNodeModules = "/Users/yogevlavian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
    return require(`${runtimeNodeModules}/playwright`).chromium;
  } catch (error) {
    throw new Error(`playwright or playwright-core is required for live browser proof. ${error.message}`);
  }
}

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const ownerId = `surface-owner-${now}`;
const projectId = `surface-owner-project-${now}`;
const reportPath = process.env.NEXUS_SURFACE_OWNER_REPORT_PATH
  ?? `/private/tmp/nexus-surface-owner-runtime-001-${now}-report.json`;
const screenshotPrefix = process.env.NEXUS_SURFACE_OWNER_SCREENSHOT_PREFIX
  ?? `/private/tmp/nexus-surface-owner-runtime-001-${now}`;

async function apiJson(pathname, {
  method = "GET",
  token = null,
  body = null,
  expected = null,
} = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (expected && response.status !== expected) {
    throw new Error(`${method} ${pathname} expected ${expected}, got ${response.status}: ${text.slice(0, 800)}`);
  }
  return { response, payload };
}

async function readSurfaceProof(page, label) {
  return page.evaluate((proofLabel) => {
    const body = document.body;
    const visibleHost = Array.from(document.querySelectorAll(".app-screen"))
      .find((node) => node.hidden === false);
    const scripts = Array.from(document.querySelectorAll("script[src]")).map((node) => node.getAttribute("src"));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]')).map((node) => node.getAttribute("href"));
    const search = new URLSearchParams(location.search);
    return {
      label: proofLabel,
      url: location.href,
      port: location.port,
      appScreen: body.dataset.appScreen ?? null,
      shellRoute: body.dataset.shellRoute ?? null,
      surfaceOwnerTask: body.dataset.surfaceOwnerTask ?? null,
      surfaceOwnerRoute: body.dataset.surfaceOwnerRoute ?? null,
      surfaceOwnerHost: body.dataset.surfaceOwnerHost ?? null,
      surfaceOwnerScreen: body.dataset.surfaceOwnerScreen ?? null,
      surfaceOwnerAdapter: body.dataset.surfaceOwnerAdapter ?? null,
      surfaceOwnerState: body.dataset.surfaceOwnerState ?? null,
      surfaceOwnerRestore: body.dataset.surfaceOwnerRestore ?? null,
      surfaceOwnerRuntimeMode: body.dataset.surfaceOwnerRuntimeMode ?? null,
      surfaceOwnerProofValid: body.dataset.surfaceOwnerProofValid ?? null,
      surfaceOwnerInvalidators: body.dataset.surfaceOwnerInvalidators ?? null,
      visibleHostId: visibleHost?.id ?? null,
      visibleHostTask: visibleHost?.dataset?.surfaceOwnerTask ?? null,
      visibleHostRuntimeMode: visibleHost?.dataset?.surfaceOwnerRuntimeMode ?? null,
      loadedAppScript: scripts.find((src) => src?.includes("app.js")) ?? null,
      loadedStylesheet: stylesheets.find((href) => href?.includes("styles.css")) ?? null,
      hasQaState: search.has("qaState"),
      hasNexusState: search.has("nexusState"),
      hasQaScreen: search.has("qaScreen"),
      hasProjectId: search.has("projectId"),
      text: body.innerText.slice(0, 1200),
    };
  }, label);
}

function assertProof(proof, expected = {}) {
  for (const [key, value] of Object.entries(expected)) {
    if (proof[key] !== value) {
      throw new Error(`Unexpected ${key} for ${proof.label}: expected ${value}, got ${proof[key]}\n${JSON.stringify(proof, null, 2)}`);
    }
  }
}

const signup = await apiJson("/api/auth/signup", {
  method: "POST",
  expected: 201,
  body: {
    userInput: {
      userId: ownerId,
      email: `${ownerId}@example.test`,
      displayName: "בודק בעלות משטח",
    },
    credentials: {
      password: `SurfaceOwner-${now}`,
    },
  },
});
const token = signup.payload?.authPayload?.tokenBundle?.accessToken;
if (!token) {
  throw new Error("Signup did not return an access token.");
}
const appUser = {
  userId: signup.payload?.authPayload?.userIdentity?.userId ?? ownerId,
  email: `${ownerId}@example.test`,
  displayName: "בודק בעלות משטח",
  tokenBundle: signup.payload?.authPayload?.tokenBundle ?? null,
  sessionState: signup.payload?.authPayload?.sessionState ?? null,
};

await apiJson("/api/projects", {
  method: "POST",
  token,
  expected: 201,
  body: {
    id: projectId,
    name: "בדיקת בעלות משטח",
    goal: "כלי פנימי שמוכיח שהמסך החי מחובר לנתיב ולמקור מצב נכונים.",
    artifactExpectation: {
      projectType: "internal tool",
      deliverableLabel: "לוח עבודה פנימי",
    },
  },
});

const chromium = loadChromium();
const browser = await chromium.launch({
  channel: "chrome",
  headless: process.env.NEXUS_LIVE_HEADLESS !== "0",
});
const context = await browser.newContext({ viewport: { width: 1365, height: 768 } });
await context.addInitScript((storedUser) => {
  window.localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
}, appUser);
await context.addCookies([
  {
    name: "nexus_access_token",
    value: token,
    url: baseUrl,
    httpOnly: true,
    sameSite: "Lax",
  },
]);
const page = await context.newPage();
const events = [];
page.on("response", (response) => {
  if (response.status() >= 400) {
    events.push({ kind: "response", status: response.status(), url: response.url() });
  }
});
page.on("console", (message) => {
  if (message.type() === "error" || message.type() === "warning") {
    events.push({ kind: "console", type: message.type(), text: message.text() });
  }
});

await page.goto(`${baseUrl}/loop?projectId=${encodeURIComponent(projectId)}`, {
  waitUntil: "domcontentloaded",
  timeout: 20_000,
});
await page.waitForSelector('body[data-surface-owner-task="SURFACE-OWNER-RUNTIME-001"][data-surface-owner-runtime-mode="project-backed"]', { timeout: 20_000 });
await page.waitForSelector("[data-agent-rail-input], [data-build-region='live-artifact-build-canvas']", { timeout: 20_000 });
const loopProof = await readSurfaceProof(page, "project-backed-loop");
assertProof(loopProof, {
  appScreen: "loop",
  surfaceOwnerTask: "SURFACE-OWNER-RUNTIME-001",
  surfaceOwnerRoute: "loop",
  surfaceOwnerHost: "#screen-loop",
  surfaceOwnerScreen: "LoopCoreScreen",
  surfaceOwnerAdapter: "loop-adapter",
  surfaceOwnerRuntimeMode: "project-backed",
  surfaceOwnerProofValid: "true",
  visibleHostId: "screen-loop",
  visibleHostTask: "SURFACE-OWNER-RUNTIME-001",
  visibleHostRuntimeMode: "project-backed",
  hasQaState: false,
  hasNexusState: false,
  hasQaScreen: false,
  hasProjectId: true,
});
if (/בודקים אם יש פרויקט פעיל לשחזור|אין לופ פעיל לשחזור/u.test(loopProof.text)) {
  throw new Error(`Project-backed loop still shows blocked-route copy: ${JSON.stringify(loopProof, null, 2)}`);
}
await page.screenshot({ path: `${screenshotPrefix}-project-backed-loop.png`, fullPage: true });

await page.reload({ waitUntil: "domcontentloaded", timeout: 20_000 });
await page.waitForSelector('body[data-surface-owner-task="SURFACE-OWNER-RUNTIME-001"][data-surface-owner-runtime-mode="project-backed"]', { timeout: 20_000 });
await page.waitForSelector("[data-agent-rail-input], [data-build-region='live-artifact-build-canvas']", { timeout: 20_000 });
const afterRefreshProof = await readSurfaceProof(page, "after-refresh");
assertProof(afterRefreshProof, {
  appScreen: "loop",
  surfaceOwnerRoute: "loop",
  surfaceOwnerRuntimeMode: "project-backed",
  surfaceOwnerProofValid: "true",
  visibleHostId: "screen-loop",
  hasQaState: false,
  hasNexusState: false,
  hasQaScreen: false,
  hasProjectId: true,
});
if (/בודקים אם יש פרויקט פעיל לשחזור|אין לופ פעיל לשחזור/u.test(afterRefreshProof.text)) {
  throw new Error(`Project-backed loop after refresh still shows blocked-route copy: ${JSON.stringify(afterRefreshProof, null, 2)}`);
}
await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });

const anonymousContext = await browser.newContext({ viewport: { width: 1365, height: 768 } });
const anonymousPage = await anonymousContext.newPage();
anonymousPage.on("response", (response) => {
  if (response.status() >= 400) {
    events.push({ kind: "response", status: response.status(), url: response.url() });
  }
});
anonymousPage.on("console", (message) => {
  if (message.type() === "error" || message.type() === "warning") {
    events.push({ kind: "console", type: message.type(), text: message.text() });
  }
});
await anonymousPage.goto(`${baseUrl}/loop`, {
  waitUntil: "domcontentloaded",
  timeout: 20_000,
});
await anonymousPage.waitForSelector('body[data-surface-owner-task="SURFACE-OWNER-RUNTIME-001"]', { timeout: 20_000 });
const blockedProof = await readSurfaceProof(anonymousPage, "blocked-loop-without-project");
assertProof(blockedProof, {
  appScreen: "loop",
  surfaceOwnerRoute: "loop",
  surfaceOwnerRuntimeMode: "blocked-route",
  surfaceOwnerProofValid: "false",
  visibleHostId: "screen-loop",
  hasProjectId: false,
});
if (!blockedProof.surfaceOwnerInvalidators.includes("backend-route-not-project-backed")) {
  throw new Error(`Blocked route did not record backend-route invalidator: ${JSON.stringify(blockedProof, null, 2)}`);
}
await anonymousPage.screenshot({ path: `${screenshotPrefix}-blocked-loop.png`, fullPage: true });

const badEvents = events.filter((event) => {
  const text = event.url ?? event.text ?? "";
  return !/favicon|apple-touch-icon|live-events|Failed to load resource: the server responded with a status of 404/i.test(text);
});
const report = {
  taskId: "SURFACE-OWNER-RUNTIME-001",
  baseUrl,
  projectId,
  loopProof,
  afterRefreshProof,
  blockedProof,
  badEvents,
  createdAt: new Date().toISOString(),
};
await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
await browser.close();

if (badEvents.length > 0) {
  throw new Error(`Live proof saw unexpected bad events: ${JSON.stringify(badEvents, null, 2)}\nReport: ${reportPath}`);
}

console.log(`SURFACE-OWNER-RUNTIME-001 live proof passed. Report: ${reportPath}`);
console.log(`Screenshots: ${screenshotPrefix}-project-backed-loop.png, ${screenshotPrefix}-after-refresh.png, ${screenshotPrefix}-blocked-loop.png`);
