// DATA-001 — product shell persistence and data ownership live proof.
//
// Run:
// NEXUS_BASE_URL=http://127.0.0.1:4011 node scripts/verify-data-001-live-proof.mjs

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
    throw new Error(`playwright or playwright-core is required for DATA-001 live proof. ${error.message}`);
  }
}

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const ownerId = `data-001-${now}`;
const projectId = `data-001-project-${now}`;
const reportPath = process.env.NEXUS_DATA_001_REPORT_PATH
  ?? `/private/tmp/nexus-data-001-${now}-report.json`;
const screenshotPrefix = process.env.NEXUS_DATA_001_SCREENSHOT_PREFIX
  ?? `/private/tmp/nexus-data-001-${now}`;

function assertCondition(condition, message, details = null) {
  if (!condition) {
    throw new Error(`${message}${details ? `\n${JSON.stringify(details, null, 2)}` : ""}`);
  }
}

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

async function readRouteProof(page, label) {
  return page.evaluate((proofLabel) => {
    const body = document.body;
    const search = new URLSearchParams(location.search);
    const scripts = Array.from(document.querySelectorAll("script[src]")).map((node) => node.getAttribute("src"));
    const routeRoot = document.querySelector("[data-data-ownership-task]");
    return {
      label: proofLabel,
      url: location.href,
      appScreen: body.dataset.appScreen ?? null,
      surfaceOwnerTask: body.dataset.surfaceOwnerTask ?? null,
      surfaceOwnerRoute: body.dataset.surfaceOwnerRoute ?? null,
      surfaceOwnerRuntimeMode: body.dataset.surfaceOwnerRuntimeMode ?? null,
      surfaceOwnerProofValid: body.dataset.surfaceOwnerProofValid ?? null,
      loadedAppScript: scripts.find((src) => src?.includes("app.js")) ?? null,
      hasQaState: search.has("qaState"),
      hasNexusState: search.has("nexusState"),
      hasQaScreen: search.has("qaScreen"),
      hasProjectId: search.has("projectId"),
      dataOwnershipTask: routeRoot?.getAttribute("data-data-ownership-task") ?? null,
      dataOwnershipStatus: routeRoot?.getAttribute("data-data-ownership-status") ?? null,
      dataOwnershipEntityCount: routeRoot?.getAttribute("data-data-ownership-entity-count") ?? null,
      dataOwnershipProviderDecision: routeRoot?.getAttribute("data-data-ownership-provider-decision") ?? null,
      text: body.innerText.slice(0, 1600),
    };
  }, label);
}

function assertDataProof(proof, expectedRoute) {
  assertCondition(proof.surfaceOwnerTask === "SURFACE-OWNER-RUNTIME-001", "Route is missing surface owner proof.", proof);
  assertCondition(proof.surfaceOwnerRoute === expectedRoute, `Expected ${expectedRoute} route proof.`, proof);
  assertCondition(proof.surfaceOwnerProofValid === "true", "Surface proof is not valid.", proof);
  assertCondition(proof.surfaceOwnerRuntimeMode === "project-backed" || proof.surfaceOwnerRuntimeMode === "regular-support", "Route is not a regular user runtime.", proof);
  assertCondition(proof.loadedAppScript?.includes("20260613-data-001"), "Browser did not load DATA-001 app asset version.", proof);
  assertCondition(proof.hasQaState === false && proof.hasNexusState === false && proof.hasQaScreen === false, "Live proof is contaminated by QA state.", proof);
  assertCondition(proof.dataOwnershipTask === "DATA-001", "Route did not expose DATA-001 ownership marker.", proof);
  assertCondition(proof.dataOwnershipStatus === "ready", "Route did not expose ready DATA-001 status.", proof);
  assertCondition(Number(proof.dataOwnershipEntityCount) >= 10, "Route did not expose a complete DATA-001 entity matrix.", proof);
}

const signup = await apiJson("/api/auth/signup", {
  method: "POST",
  expected: 201,
  body: {
    userInput: {
      userId: ownerId,
      email: `${ownerId}@example.test`,
      displayName: "בודק אמת נתונים",
    },
    credentials: {
      password: `DataBoundary-${now}`,
    },
  },
});
const token = signup.payload?.authPayload?.tokenBundle?.accessToken;
assertCondition(Boolean(token), "Signup did not return an access token.");
const appUser = {
  userId: signup.payload?.authPayload?.userIdentity?.userId ?? ownerId,
  email: `${ownerId}@example.test`,
  displayName: "בודק אמת נתונים",
  tokenBundle: signup.payload?.authPayload?.tokenBundle ?? null,
  sessionState: signup.payload?.authPayload?.sessionState ?? null,
};

await apiJson("/api/projects", {
  method: "POST",
  token,
  expected: 201,
  body: {
    id: projectId,
    name: "בדיקת אמת נתונים",
    goal: "כלי פנימי שמוכיח בעלות נתונים, שיחה, קבצים, היסטוריה ושחזור.",
    artifactExpectation: {
      projectType: "internal tool",
      deliverableLabel: "לוח אמת נתונים",
    },
  },
});

const projectResponse = await apiJson(`/api/projects/${projectId}`, { token, expected: 200 });
const project = projectResponse.payload?.project ?? projectResponse.payload;
assertCondition(project?.dataOwnershipBoundary?.taskId === "DATA-001", "API project did not serialize DATA-001 boundary.", project);
assertCondition(project.dataOwnershipBoundary.entities.length >= 10, "API project DATA-001 inventory is incomplete.", project.dataOwnershipBoundary);
assertCondition(
  project.dataOwnershipBoundary.persistenceProviderDecision?.decision === "defer-until-SUPABASE-001",
  "DATA-001 did not record Supabase timing decision.",
  project.dataOwnershipBoundary,
);
assertCondition(
  project.dataOwnershipBoundary.temporaryOrDemoEntities.some((entry) => entry.key === "qaState" && entry.status === "excluded-from-production-truth"),
  "DATA-001 did not exclude QA state from production truth.",
  project.dataOwnershipBoundary,
);

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
await page.waitForSelector('[data-data-ownership-task="DATA-001"][data-data-ownership-status="ready"]', { timeout: 20_000 });
const loopProof = await readRouteProof(page, "loop");
assertDataProof(loopProof, "loop");
assertCondition(/אמת נתונים/u.test(loopProof.text), "Loop route did not show human-readable data truth.", loopProof);
await page.screenshot({ path: `${screenshotPrefix}-loop.png`, fullPage: true });

await page.reload({ waitUntil: "domcontentloaded", timeout: 20_000 });
await page.waitForSelector('[data-data-ownership-task="DATA-001"][data-data-ownership-status="ready"]', { timeout: 20_000 });
const afterRefreshProof = await readRouteProof(page, "loop-after-refresh");
assertDataProof(afterRefreshProof, "loop");
await page.screenshot({ path: `${screenshotPrefix}-loop-after-refresh.png`, fullPage: true });

await page.goto(`${baseUrl}/timeline?projectId=${encodeURIComponent(projectId)}`, {
  waitUntil: "domcontentloaded",
  timeout: 20_000,
});
await page.waitForSelector('[data-history-region="data-ownership-boundary"]', { timeout: 20_000 });
const timelineProof = await readRouteProof(page, "timeline");
assertDataProof(timelineProof, "timeline");
assertCondition(/אמת המוצר נשמרת בפרויקט/u.test(timelineProof.text), "Timeline route did not show human-readable data truth.", timelineProof);
await page.screenshot({ path: `${screenshotPrefix}-timeline.png`, fullPage: true });

await page.goto(`${baseUrl}/files?projectId=${encodeURIComponent(projectId)}`, {
  waitUntil: "domcontentloaded",
  timeout: 20_000,
});
await page.waitForSelector('[data-data-ownership-task="DATA-001"][data-data-ownership-provider-decision="defer-until-SUPABASE-001"]', { timeout: 20_000 });
const filesProof = await readRouteProof(page, "files");
assertDataProof(filesProof, "files");
assertCondition(/ספק אחסון חיצוני/u.test(filesProof.text), "Files route did not show provider timing truth.", filesProof);
await page.screenshot({ path: `${screenshotPrefix}-files.png`, fullPage: true });

const badEvents = events.filter((event) => {
  const text = event.url ?? event.text ?? "";
  return !/favicon|apple-touch-icon|live-events|Failed to load resource: the server responded with a status of 404/i.test(text);
});
assertCondition(badEvents.length === 0, "DATA-001 live proof observed unexpected browser/server errors.", badEvents);

const report = {
  taskId: "DATA-001",
  baseUrl,
  projectId,
  apiBoundary: project.dataOwnershipBoundary,
  loopProof,
  afterRefreshProof,
  timelineProof,
  filesProof,
  events,
  artifacts: [
    reportPath,
    `${screenshotPrefix}-loop.png`,
    `${screenshotPrefix}-loop-after-refresh.png`,
    `${screenshotPrefix}-timeline.png`,
    `${screenshotPrefix}-files.png`,
  ],
};
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
await browser.close();

console.log(JSON.stringify({
  ok: true,
  taskId: "DATA-001",
  projectId,
  reportPath,
  screenshots: report.artifacts.slice(1),
}, null, 2));
