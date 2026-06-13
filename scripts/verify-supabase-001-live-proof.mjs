// SUPABASE-001 — Supabase persistence provider decision live proof.
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const proofId = Date.now();
const ownerId = `supabase-001-${proofId}`;
const projectId = `supabase-001-project-${proofId}`;
const screenshotPrefix = `/private/tmp/nexus-supabase-001-${proofId}`;

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
    throw new Error(`playwright or playwright-core is required for SUPABASE-001 live proof. ${error.message}`);
  }
}

function assertCondition(condition, message, details = null) {
  if (!condition) {
    throw new Error(`${message}${details ? `\n${JSON.stringify(details, null, 2)}` : ""}`);
  }
}

async function apiJson(path, {
  method = "GET",
  token = null,
  body = null,
  expected = 200,
} = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  assertCondition(response.status === expected, `Unexpected status for ${method} ${path}: ${response.status}`, payload);
  return { response, payload };
}

async function readRouteProof(page, label) {
  return page.evaluate((proofLabel) => {
    const providerNode = document.querySelector("[data-supabase-provider-task]");
    const owner = document.querySelector("[data-surface-owner-runtime-proof]");
    const scripts = [...document.scripts].map((script) => script.getAttribute("src")).filter(Boolean);
    return {
      label: proofLabel,
      url: location.href,
      appScreen: document.body.dataset.appScreen ?? null,
      surfaceOwnerTask: owner?.getAttribute("data-surface-owner-task") ?? null,
      surfaceOwnerRuntimeMode: owner?.getAttribute("data-surface-owner-runtime-mode") ?? null,
      surfaceOwnerProofValid: owner?.getAttribute("data-surface-owner-proof-valid") ?? null,
      loadedAppScript: scripts.find((src) => src.includes("app.js")) ?? null,
      hasQaState: location.search.includes("qaState="),
      hasNexusState: Boolean(localStorage.getItem("nexusState")),
      hasQaScreen: location.search.includes("qaScreen="),
      providerTask: providerNode?.getAttribute("data-supabase-provider-task") ?? null,
      providerDecision: providerNode?.getAttribute("data-supabase-provider-decision") ?? null,
      selectedPath: providerNode?.getAttribute("data-supabase-selected-path") ?? null,
      requirementCount: providerNode?.getAttribute("data-supabase-adoption-requirement-count") ?? null,
      text: document.body.innerText,
    };
  }, label);
}

function assertProviderProof(proof) {
  assertCondition(proof.loadedAppScript?.includes("20260613-supabase-001"), "Browser did not load SUPABASE-001 app asset version.", proof);
  if (proof.surfaceOwnerTask || proof.surfaceOwnerProofValid || proof.surfaceOwnerRuntimeMode) {
    assertCondition(proof.surfaceOwnerTask === "SURFACE-OWNER-RUNTIME-001", "Surface owner proof is inconsistent.", proof);
    assertCondition(proof.surfaceOwnerProofValid === "true", "Surface owner proof was not valid.", proof);
  }
  assertCondition(proof.hasQaState === false, "Route still depends on qaState query.", proof);
  assertCondition(proof.hasNexusState === false, "Route still depends on legacy nexusState.", proof);
  assertCondition(proof.hasQaScreen === false, "Route still depends on qaScreen query.", proof);
  assertCondition(proof.providerTask === "SUPABASE-001", "Route did not expose SUPABASE-001 provider marker.", proof);
  assertCondition(proof.providerDecision === "defer-for-first-release", "Route did not expose defer decision.", proof);
  assertCondition(proof.selectedPath === "project-service-workspace-store", "Route did not expose selected persistence path.", proof);
  assertCondition(Number(proof.requirementCount) >= 6, "Route did not expose complete adoption requirements.", proof);
  assertCondition(/לא מחובר עכשיו/u.test(proof.text), "Route did not show user-facing provider status.", proof);
  assertCondition(/הרשאות/u.test(proof.text) && /פרטיות/u.test(proof.text), "Route did not explain provider requirements in human language.", proof);
}

const signup = await apiJson("/api/auth/signup", {
  method: "POST",
  expected: 201,
  body: {
    userInput: {
      userId: ownerId,
      email: `${ownerId}@example.test`,
      displayName: "בודק ספק אחסון",
    },
    credentials: { password: "secret" },
  },
});
const token = signup.payload?.authPayload?.tokenBundle?.accessToken;
assertCondition(typeof token === "string" && token.length > 10, "Signup did not return access token.", signup.payload);

const appUser = {
  userId: signup.payload?.authPayload?.userIdentity?.userId ?? ownerId,
  email: `${ownerId}@example.test`,
  displayName: "בודק ספק אחסון",
  tokenBundle: signup.payload?.authPayload?.tokenBundle ?? null,
  sessionState: signup.payload?.authPayload?.sessionState ?? null,
};

await apiJson("/api/projects", {
  method: "POST",
  token,
  expected: 201,
  body: {
    id: projectId,
    name: "בדיקת ספק אחסון",
    goal: "להוכיח שנקסוס לא מחברת Supabase לפני שמקור האמת, הרשאות, קבצים ופרטיות מוכנים.",
    artifactExpectation: {
      projectType: "internal tool",
      deliverableLabel: "לוח ספק אחסון",
    },
  },
});

const projectResponse = await apiJson(`/api/projects/${projectId}`, { token, expected: 200 });
const project = projectResponse.payload?.project ?? projectResponse.payload;
assertCondition(project?.supabasePersistenceDecision?.taskId === "SUPABASE-001", "API project did not serialize SUPABASE-001 decision.", project);
assertCondition(project.supabasePersistenceDecision.decision === "defer-for-first-release", "API project did not defer Supabase adoption.", project.supabasePersistenceDecision);
assertCondition(project.supabasePersistenceDecision.selectedPersistencePath === "project-service-workspace-store", "API project selected wrong persistence path.", project.supabasePersistenceDecision);
assertCondition(project.supabasePersistenceDecision.environmentReadiness?.secretsReachBrowser === false, "SUPABASE-001 leaked secret readiness to browser boundary.", project.supabasePersistenceDecision);

const settingsResponse = await apiJson("/api/settings-profile", { token, expected: 200 });
assertCondition(
  settingsResponse.payload?.settingsProfileSurface?.supabasePersistenceDecision?.taskId === "SUPABASE-001",
  "Settings API did not serialize SUPABASE-001 decision.",
  settingsResponse.payload,
);

await apiJson("/api/settings-profile", {
  method: "PUT",
  token,
  expected: 200,
  body: {
    settingsInput: { preferredLanguage: "he", themePreference: "system" },
  },
});
const settingsAfterWrite = await apiJson("/api/settings-profile", { token, expected: 200 });
assertCondition(
  settingsAfterWrite.payload?.settingsProfileSurface?.supabasePersistenceDecision?.selectedPersistencePath === "project-service-workspace-store",
  "Settings write did not preserve selected persistence path.",
  settingsAfterWrite.payload,
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

await page.goto(`${baseUrl}/files?projectId=${encodeURIComponent(projectId)}`, {
  waitUntil: "domcontentloaded",
  timeout: 20_000,
});
await page.waitForSelector('[data-supabase-provider-task="SUPABASE-001"][data-supabase-provider-decision="defer-for-first-release"]', { timeout: 20_000 });
const filesProof = await readRouteProof(page, "files");
assertProviderProof(filesProof);
await page.screenshot({ path: `${screenshotPrefix}-files.png`, fullPage: true });

await page.reload({ waitUntil: "domcontentloaded", timeout: 20_000 });
await page.waitForSelector('[data-supabase-provider-task="SUPABASE-001"][data-supabase-provider-decision="defer-for-first-release"]', { timeout: 20_000 });
const filesRefreshProof = await readRouteProof(page, "files-after-refresh");
assertProviderProof(filesRefreshProof);
await page.screenshot({ path: `${screenshotPrefix}-files-after-refresh.png`, fullPage: true });

await page.goto(`${baseUrl}/settings`, {
  waitUntil: "domcontentloaded",
  timeout: 20_000,
});
await page.waitForSelector('[data-settings-tab="account"]', { timeout: 20_000 });
await page.click('[data-settings-tab="account"]');
await page.waitForSelector('[data-supabase-provider-task="SUPABASE-001"][data-supabase-provider-decision="defer-for-first-release"]', { timeout: 20_000 });
const settingsProof = await readRouteProof(page, "settings");
assertProviderProof(settingsProof);
await page.screenshot({ path: `${screenshotPrefix}-settings.png`, fullPage: true });

await browser.close();

const unexpectedEvents = events.filter((entry) => {
  if (entry.kind === "response" && /favicon\.ico|live-events/.test(entry.url)) {
    return false;
  }
  if (entry.kind === "console" && /Failed to load resource: the server responded with a status of 404/i.test(entry.text)) {
    return false;
  }
  return true;
});
assertCondition(unexpectedEvents.length === 0, "SUPABASE-001 live proof observed unexpected browser/server errors.", unexpectedEvents);

const report = {
  ok: true,
  taskId: "SUPABASE-001",
  projectId,
  apiDecision: project.supabasePersistenceDecision,
  filesProof,
  filesRefreshProof,
  settingsProof,
  screenshots: [
    `${screenshotPrefix}-files.png`,
    `${screenshotPrefix}-files-after-refresh.png`,
    `${screenshotPrefix}-settings.png`,
  ],
};
const reportPath = `${screenshotPrefix}-report.json`;
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({
  ok: true,
  taskId: "SUPABASE-001",
  projectId,
  reportPath,
  screenshots: report.screenshots,
}, null, 2));
