// LIVE-PROOF-INTEGRITY-001 — claim-to-visible-proof live route proof.
//
// Run:
// NEXUS_BASE_URL=http://127.0.0.1:4011 node scripts/verify-live-proof-integrity-001-live-proof.mjs

import fs from "node:fs/promises";
import { createRequire } from "node:module";

import {
  LIVE_PROOF_INTEGRITY_TASK_ID,
  validateClaimToVisibleProof,
} from "../web/shared/live-proof-integrity.js";

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
const ownerId = `live-proof-integrity-${now}`;
const projectId = `live-proof-integrity-project-${now}`;
const reportPath = process.env.NEXUS_LIVE_PROOF_INTEGRITY_REPORT_PATH
  ?? `/private/tmp/nexus-live-proof-integrity-001-${now}-report.json`;
const screenshotPrefix = process.env.NEXUS_LIVE_PROOF_INTEGRITY_SCREENSHOT_PREFIX
  ?? `/private/tmp/nexus-live-proof-integrity-001-${now}`;

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

async function readVisibleProof(page, label) {
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
      liveProofIntegrityTask: body.dataset.liveProofIntegrityTask ?? null,
      rootLiveProofIntegrityTask: document.documentElement?.dataset?.liveProofIntegrityTask ?? null,
      visibleHostId: visibleHost?.id ?? null,
      visibleHostTask: visibleHost?.dataset?.surfaceOwnerTask ?? null,
      visibleHostRuntimeMode: visibleHost?.dataset?.surfaceOwnerRuntimeMode ?? null,
      visibleHostLiveProofIntegrityTask: visibleHost?.dataset?.liveProofIntegrityTask ?? null,
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

function makeClosureInput(surfaceProof, artifactPaths) {
  return {
    taskId: LIVE_PROOF_INTEGRITY_TASK_ID,
    statusClaim: "trueGreen",
    behaviorClaim: "Claim closure is allowed only when repo diff, loaded runtime, route ownership, refresh, restore, and visible behavior agree.",
    changedFiles: [
      "web/shared/live-proof-integrity.js",
      "web/app.js",
      "web/index.html",
      "test/live-proof-integrity.test.js",
      "scripts/verify-live-proof-integrity-001-live-proof.mjs",
      "docs/operating-system/nexus-canonical-implementation-task-map-2026-05-26.md",
      "docs/wave3-canonical-state.json",
    ],
    surfaceProof,
    browserProof: true,
    refreshProof: true,
    restoreProof: true,
    behaviorProof: true,
    artifactPaths,
    verificationCommands: [
      "node --check web/shared/live-proof-integrity.js",
      "node --check web/app.js",
      "node --check scripts/verify-live-proof-integrity-001-live-proof.mjs",
      "node --test test/live-proof-integrity.test.js test/visible-surface-ownership.test.js",
      "NEXUS_BASE_URL=http://127.0.0.1:4011 node scripts/verify-live-proof-integrity-001-live-proof.mjs",
    ],
  };
}

function assertMatrixPass(input, label) {
  const result = validateClaimToVisibleProof(input);
  assertCondition(result.canClaimTrueGreen, `${label} should pass claim-to-visible-proof gate`, result);
  return result;
}

function assertMatrixBlocks(input, expectedBlocker, label) {
  const result = validateClaimToVisibleProof(input);
  assertCondition(!result.canClaimTrueGreen, `${label} should block claim-to-visible-proof gate`, result);
  assertCondition(result.blockers.includes(expectedBlocker), `${label} should include ${expectedBlocker}`, result);
  return result;
}

const signup = await apiJson("/api/auth/signup", {
  method: "POST",
  expected: 201,
  body: {
    userInput: {
      userId: ownerId,
      email: `${ownerId}@example.test`,
      displayName: "בודק שלמות הוכחה",
    },
    credentials: {
      password: `LiveProof-${now}`,
    },
  },
});
const token = signup.payload?.authPayload?.tokenBundle?.accessToken;
assertCondition(Boolean(token), "Signup did not return an access token.");
const appUser = {
  userId: signup.payload?.authPayload?.userIdentity?.userId ?? ownerId,
  email: `${ownerId}@example.test`,
  displayName: "בודק שלמות הוכחה",
  tokenBundle: signup.payload?.authPayload?.tokenBundle ?? null,
  sessionState: signup.payload?.authPayload?.sessionState ?? null,
};

await apiJson("/api/projects", {
  method: "POST",
  token,
  expected: 201,
  body: {
    id: projectId,
    name: "בדיקת שלמות הוכחה חיה",
    goal: "כלי פנימי שמוכיח שסגירת משימה נבדקת מול המסך החי ולא רק מול קוד.",
    artifactExpectation: {
      projectType: "internal tool",
      deliverableLabel: "לוח הוכחות",
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

const events = [];
const page = await context.newPage();
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
await page.waitForSelector('body[data-live-proof-integrity-task="LIVE-PROOF-INTEGRITY-001"]', { timeout: 20_000 });
await page.waitForSelector('body[data-surface-owner-task="SURFACE-OWNER-RUNTIME-001"][data-surface-owner-runtime-mode="project-backed"]', { timeout: 20_000 });
const firstProof = await readVisibleProof(page, "project-backed-loop");
assertCondition(firstProof.liveProofIntegrityTask === LIVE_PROOF_INTEGRITY_TASK_ID, "Body is missing live proof integrity marker.", firstProof);
assertCondition(firstProof.rootLiveProofIntegrityTask === LIVE_PROOF_INTEGRITY_TASK_ID, "Root is missing live proof integrity marker.", firstProof);
assertCondition(firstProof.visibleHostLiveProofIntegrityTask === LIVE_PROOF_INTEGRITY_TASK_ID, "Visible host is missing live proof integrity marker.", firstProof);
assertCondition(firstProof.surfaceOwnerProofValid === "true", "Surface owner proof must be valid.", firstProof);
assertCondition(firstProof.loadedAppScript?.includes("20260613-live-proof-integrity"), "The browser did not load the live proof integrity app asset version.", firstProof);
await page.screenshot({ path: `${screenshotPrefix}-loop.png`, fullPage: true });

await page.reload({ waitUntil: "domcontentloaded", timeout: 20_000 });
await page.waitForSelector('body[data-live-proof-integrity-task="LIVE-PROOF-INTEGRITY-001"]', { timeout: 20_000 });
await page.waitForSelector('body[data-surface-owner-task="SURFACE-OWNER-RUNTIME-001"][data-surface-owner-runtime-mode="project-backed"]', { timeout: 20_000 });
const afterRefreshProof = await readVisibleProof(page, "after-refresh");
assertCondition(afterRefreshProof.surfaceOwnerProofValid === "true", "Refresh proof must preserve valid surface owner proof.", afterRefreshProof);
assertCondition(afterRefreshProof.visibleHostLiveProofIntegrityTask === LIVE_PROOF_INTEGRITY_TASK_ID, "Refresh proof lost visible host marker.", afterRefreshProof);
await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });

const closureArtifacts = [
  reportPath,
  `${screenshotPrefix}-loop.png`,
  `${screenshotPrefix}-after-refresh.png`,
];
const passResult = assertMatrixPass(makeClosureInput(afterRefreshProof, closureArtifacts), "project-backed loop closure");
const qaBlockedResult = assertMatrixBlocks(makeClosureInput({
  ...afterRefreshProof,
  url: `${baseUrl}/loop?qa=1&projectId=${encodeURIComponent(projectId)}&qaState=%7B%7D&qaScreen=loop`,
  hasQaState: true,
  hasQaScreen: true,
}, closureArtifacts), "qa-state-contaminates-regular-claim", "QA-contaminated closure");
const routeMismatchResult = assertMatrixBlocks({
  ...makeClosureInput(afterRefreshProof, closureArtifacts),
  changedFiles: ["web/nexus-ui/screens/ReleaseSurfaceScreen.js"],
}, "changed-file-not-reachable-from-tested-route", "route-mismatched changed file");
const staleAssetResult = assertMatrixBlocks(makeClosureInput({
  ...afterRefreshProof,
  loadedAppScript: "",
  loadedStylesheet: "",
}, closureArtifacts), "loaded-assets-not-proven", "stale asset closure");

const badEvents = events.filter((event) => {
  const text = event.url ?? event.text ?? "";
  return !/favicon|apple-touch-icon|live-events|Failed to load resource: the server responded with a status of 404/i.test(text);
});
assertCondition(badEvents.length === 0, "Live proof observed unexpected browser/server errors.", badEvents);

const report = {
  taskId: LIVE_PROOF_INTEGRITY_TASK_ID,
  baseUrl,
  projectId,
  firstProof,
  afterRefreshProof,
  passResult,
  negativeProofs: {
    qaBlockedResult,
    routeMismatchResult,
    staleAssetResult,
  },
  artifacts: closureArtifacts,
  events,
};
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
await browser.close();

console.log(JSON.stringify({
  ok: true,
  taskId: LIVE_PROOF_INTEGRITY_TASK_ID,
  projectId,
  reportPath,
  screenshots: closureArtifacts.slice(1),
  blockers: passResult.blockers,
}, null, 2));
