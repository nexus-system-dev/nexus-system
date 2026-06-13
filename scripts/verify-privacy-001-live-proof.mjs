// PRIVACY-001 — full privacy rights and data lifecycle live proof.
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const proofId = Date.now();
const ownerId = `privacy-001-${proofId}`;
const projectId = `privacy-001-project-${proofId}`;
const screenshotPrefix = `/private/tmp/nexus-privacy-001-${proofId}`;

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
    throw new Error(`playwright or playwright-core is required for PRIVACY-001 live proof. ${error.message}`);
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
  retries = 2,
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
  if (response.status === 429 && retries > 0) {
    const retryAfterSeconds = Number(payload?.rateLimitDecision?.retryAfterSeconds ?? 10);
    await new Promise((resolve) => setTimeout(resolve, Math.max(1, retryAfterSeconds) * 1000));
    return apiJson(path, { method, token, body, expected, retries: retries - 1 });
  }
  assertCondition(response.status === expected, `Unexpected status for ${method} ${path}: ${response.status}`, payload);
  return { response, payload };
}

async function readPrivacyProof(page, label) {
  return page.evaluate((proofLabel) => {
    const privacyNode = document.querySelector("[data-privacy-center-task]");
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
      privacyTask: privacyNode?.getAttribute("data-privacy-center-task") ?? null,
      privacyStatus: privacyNode?.getAttribute("data-privacy-center-status") ?? null,
      exportStatus: privacyNode?.getAttribute("data-privacy-export-status") ?? null,
      deletionStatus: privacyNode?.getAttribute("data-privacy-deletion-status") ?? null,
      retentionStatus: privacyNode?.getAttribute("data-privacy-retention-status") ?? null,
      rightsRequestStatus: privacyNode?.getAttribute("data-privacy-rights-request-status") ?? null,
      text: document.body.innerText,
    };
  }, label);
}

function assertPrivacyBrowserProof(proof) {
  assertCondition(proof.loadedAppScript?.includes("20260613-privacy-001"), "Browser did not load PRIVACY-001 app asset version.", proof);
  if (proof.surfaceOwnerTask || proof.surfaceOwnerProofValid || proof.surfaceOwnerRuntimeMode) {
    assertCondition(proof.surfaceOwnerTask === "SURFACE-OWNER-RUNTIME-001", "Surface owner proof is inconsistent.", proof);
    assertCondition(proof.surfaceOwnerProofValid === "true", "Surface owner proof was not valid.", proof);
  }
  assertCondition(proof.hasQaState === false, "Route still depends on qaState query.", proof);
  assertCondition(proof.hasNexusState === false, "Route still depends on legacy nexusState.", proof);
  assertCondition(proof.hasQaScreen === false, "Route still depends on qaScreen query.", proof);
  assertCondition(proof.privacyTask === "PRIVACY-001", "Settings route did not expose PRIVACY-001 marker.", proof);
  assertCondition(proof.privacyStatus === "ready", "Privacy center did not show ready state.", proof);
  assertCondition(proof.exportStatus === "available", "Privacy export status was not visible as available.", proof);
  assertCondition(proof.deletionStatus === "request-available-with-retention-review", "Privacy deletion status did not expose retention review.", proof);
  assertCondition(proof.retentionStatus === "visible", "Privacy retention status was not visible.", proof);
  assertCondition(/פרטיות ונתונים/u.test(proof.text), "Privacy center title was not visible.", proof);
  assertCondition(/מה נשמר עכשיו/u.test(proof.text), "Privacy inventory was not visible.", proof);
  assertCondition(/גבולות מחיקה/u.test(proof.text), "Deletion boundaries were not visible.", proof);
}

await apiJson("/api/privacy-center", { expected: 401 });

const signup = await apiJson("/api/auth/signup", {
  method: "POST",
  expected: 201,
  body: {
    userInput: {
      userId: ownerId,
      email: `${ownerId}@example.test`,
      displayName: "בודק פרטיות",
    },
    credentials: { password: "secret" },
  },
});
const token = signup.payload?.authPayload?.tokenBundle?.accessToken;
assertCondition(typeof token === "string" && token.length > 10, "Signup did not return access token.", signup.payload);

const appUser = {
  userId: signup.payload?.authPayload?.userIdentity?.userId ?? ownerId,
  email: `${ownerId}@example.test`,
  displayName: "בודק פרטיות",
  tokenBundle: signup.payload?.authPayload?.tokenBundle ?? null,
  sessionState: signup.payload?.authPayload?.sessionState ?? null,
};

await apiJson("/api/projects", {
  method: "POST",
  token,
  expected: 201,
  body: {
    id: projectId,
    name: "מרכז פרטיות",
    goal: "להוכיח יצוא, שמירה, מחיקה חסומה והסכמות בלי הבטחות מזויפות.",
    artifactExpectation: {
      projectType: "internal tool",
      deliverableLabel: "מרכז פרטיות",
    },
  },
});

const center = await apiJson("/api/privacy-center", { token, expected: 200 });
assertCondition(center.payload?.privacyCenter?.taskId === "PRIVACY-001", "Privacy center API did not expose PRIVACY-001.", center.payload);
assertCondition(center.payload.privacyCenter.dataInventory.length === 10, "Privacy center inventory did not cover all required data classes.", center.payload.privacyCenter);
assertCondition(center.payload.privacyCenter.rights.export.status === "available", "Privacy export was not available.", center.payload.privacyCenter);
assertCondition(center.payload.privacyCenter.rights.deletion.blockedScopes.some((item) => item.key === "provider-metadata"), "Provider-side deletion was not truthfully blocked.", center.payload.privacyCenter);

const exported = await apiJson("/api/privacy/export", {
  method: "POST",
  token,
  expected: 200,
  body: {},
});
const exportText = JSON.stringify(exported.payload?.exportPayload ?? {});
assertCondition(exported.payload?.exportPayload?.taskId === "PRIVACY-001", "Privacy export payload was missing task boundary.", exported.payload);
assertCondition(exported.payload.exportPayload.projects.length === 1, "Privacy export did not include exactly the owned project.", exported.payload.exportPayload);
assertCondition(exportText.includes(token) === false, "Privacy export leaked the access token.", exported.payload.exportPayload);
assertCondition(exportText.includes("\"tokenBundle\"") === false, "Privacy export exposed token bundle shape.", exported.payload.exportPayload);
assertCondition(exportText.includes("\"passwordHash\"") === false, "Privacy export exposed password hash shape.", exported.payload.exportPayload);
assertCondition(exportText.includes("\"credentials\"") === false, "Privacy export exposed credential input shape.", exported.payload.exportPayload);

const action = await apiJson("/api/privacy/actions", {
  method: "POST",
  token,
  expected: 200,
  body: {
    actionType: "request-project-deletion",
    payload: { projectId },
  },
});
assertCondition(action.payload?.privacyRequest?.status === "pending-retention-review", "Privacy action did not record pending retention review.", action.payload);
assertCondition(action.payload.privacyRequest.retentionReason === "project-history-and-audit-review", "Privacy action did not explain retention reason.", action.payload);
assertCondition(action.payload.privacyCenter.rights.rightsRequest.status === "pending-retention-review", "Privacy center did not preserve latest request.", action.payload.privacyCenter);

const providerDeletion = await apiJson("/api/privacy/actions", {
  method: "POST",
  token,
  expected: 409,
  body: {
    actionType: "request-provider-deletion",
    payload: { projectId },
  },
});
assertCondition(providerDeletion.payload?.privacyRequest?.status === "blocked", "Provider deletion was not blocked.", providerDeletion.payload);
assertCondition(providerDeletion.payload.privacyRequest.retentionReason === "provider-side-deletion-requires-connected-provider-proof", "Provider deletion did not name provider proof boundary.", providerDeletion.payload);

const projectResponse = await apiJson(`/api/projects/${projectId}`, { token, expected: 200 });
const project = projectResponse.payload?.project ?? projectResponse.payload;
assertCondition(project?.privacyCenter?.taskId === "PRIVACY-001", "Serialized project did not expose privacy center.", project);
assertCondition(project.state?.privacyDeletionRequest?.status === "pending-retention-review", "Project did not preserve privacy deletion request.", project);

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

await page.goto(`${baseUrl}/settings`, {
  waitUntil: "domcontentloaded",
  timeout: 20_000,
});
await page.waitForSelector('[data-settings-tab="privacy"]', { timeout: 20_000 });
await page.click('[data-settings-tab="privacy"]');
await page.waitForSelector('[data-privacy-center-task="PRIVACY-001"][data-privacy-center-status="ready"]', { timeout: 20_000 });
const settingsProof = await readPrivacyProof(page, "settings-privacy");
assertPrivacyBrowserProof(settingsProof);
await page.screenshot({ path: `${screenshotPrefix}-settings-privacy.png`, fullPage: true });

await page.reload({ waitUntil: "domcontentloaded", timeout: 20_000 });
await page.waitForSelector('[data-settings-tab="privacy"]', { timeout: 20_000 });
await page.click('[data-settings-tab="privacy"]');
await page.waitForSelector('[data-privacy-center-task="PRIVACY-001"][data-privacy-center-status="ready"]', { timeout: 20_000 });
const refreshProof = await readPrivacyProof(page, "settings-privacy-after-refresh");
assertPrivacyBrowserProof(refreshProof);
assertCondition(refreshProof.rightsRequestStatus === "blocked", "Refresh did not preserve latest provider-side blocked privacy request.", refreshProof);
await page.screenshot({ path: `${screenshotPrefix}-settings-privacy-after-refresh.png`, fullPage: true });

await browser.close();

const report = {
  taskId: "PRIVACY-001",
  baseUrl,
  ownerId,
  projectId,
  apiProof: {
    inventoryCount: center.payload.privacyCenter.dataInventory.length,
    exportProjectCount: exported.payload.exportPayload.projects.length,
    projectDeletionStatus: action.payload.privacyRequest.status,
    providerDeletionStatus: providerDeletion.payload.privacyRequest.status,
    serializedProjectPrivacyTask: project.privacyCenter.taskId,
  },
  browserProof: {
    settingsProof,
    refreshProof,
  },
  screenshots: [
    `${screenshotPrefix}-settings-privacy.png`,
    `${screenshotPrefix}-settings-privacy-after-refresh.png`,
  ],
  unexpectedEvents: events.filter((event) => !event.url?.includes("/api/privacy/actions")),
};
const reportPath = `${screenshotPrefix}-report.json`;
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: "passed", reportPath, screenshots: report.screenshots }, null, 2));
