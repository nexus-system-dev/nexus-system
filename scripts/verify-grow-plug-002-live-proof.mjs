import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = `growplug002-user-${now}`;
const projectId = `growplug002-leads-${now}`;
const reportPath = process.env.NEXUS_GROW_PLUG_002_REPORT_PATH ?? `/private/tmp/nexus-grow-plug-002-${now}-report.json`;
const screenshotPath = process.env.NEXUS_GROW_PLUG_002_SCREENSHOT_PATH ?? `/private/tmp/nexus-grow-plug-002-${now}.png`;

async function apiJson(path, { method = "GET", token = null, body = null, expected = null } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
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
    throw new Error(`${method} ${path} expected ${expected}, got ${response.status}: ${text.slice(0, 800)}`);
  }
  if (!expected && !response.ok) {
    throw new Error(`${method} ${path} failed ${response.status}: ${text.slice(0, 800)}`);
  }
  return { status: response.status, payload };
}

async function signup() {
  const result = await apiJson("/api/auth/signup", {
    method: "POST",
    expected: 201,
    body: {
      userInput: {
        userId,
        email: `${userId}@example.test`,
        displayName: "בודק רישום צמיחה",
      },
      credentials: { password: `secret-${now}` },
    },
  });
  const tokenBundle = result.payload?.authPayload?.tokenBundle;
  if (!tokenBundle?.accessToken) {
    throw new Error(`Signup did not return access token: ${JSON.stringify(result.payload)}`);
  }
  return tokenBundle;
}

async function createProject(token) {
  await apiJson("/api/projects", {
    method: "POST",
    token,
    expected: 201,
    body: {
      id: projectId,
      name: "ניהול לידים עם צמיחה",
      goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
      artifactExpectation: {
        projectType: "internal-tool",
        deliverableLabel: "שלד ניהול לידים",
      },
      state: {
        artifactExpectation: {
          projectType: "internal-tool",
          deliverableLabel: "שלד ניהול לידים",
        },
        runtimeSkeletonTruth: {
          runtimeSkeletonId: `runtime-skeleton:${projectId}:internal-tool`,
          title: "ניהול לידים",
          productClass: "internal-tool",
        },
        productDomainSkeleton: {
          productDomainSkeletonId: `product-domain:${projectId}:internal-tool`,
        },
        productOwnedBackendSkeleton: {
          productOwnedBackendSkeletonId: `product-owned-backend:${projectId}:internal-tool`,
          productionBackend: false,
        },
      },
    },
  });
}

async function runGrowth(token, userInput) {
  const result = await apiJson(`/api/projects/${projectId}/growth-agent`, {
    method: "POST",
    token,
    expected: 200,
    body: { userInput },
  });
  return result.payload?.project ?? result.payload;
}

function readLayer(project) {
  return project.growthAgent?.growthPluginLayer
    ?? project.context?.growthAgent?.growthPluginLayer
    ?? project.state?.growthAgent?.growthPluginLayer
    ?? null;
}

function assertRegistryLayer(layer) {
  const registry = layer?.registry;
  const ids = registry?.plugins?.map((plugin) => plugin.pluginId) ?? [];
  const expectedIds = [
    "social-campaign-draft",
    "seo-page-draft",
    "paid-test-draft",
    "email-draft",
    "landing-experiment-draft",
    "measurement-plan",
  ];
  const failures = [];
  if (registry?.taskId !== "GROW-PLUG-002") failures.push("missing GROW-PLUG-002 registry task");
  if (registry?.marketplaceMode !== false) failures.push("registry must not be a marketplace");
  if (registry?.userFacingMode !== "simple-intents-not-marketplace") failures.push("registry must stay simple-intent mode");
  if (JSON.stringify(ids) !== JSON.stringify(expectedIds)) failures.push(`unexpected registry ids: ${ids.join(",")}`);
  for (const plugin of registry?.plugins ?? []) {
    if (!plugin.userIntentLabel) failures.push(`${plugin.pluginId} missing userIntentLabel`);
    if (!plugin.whenToUse?.length) failures.push(`${plugin.pluginId} missing whenToUse`);
    if (!plugin.whenNotToUse?.length) failures.push(`${plugin.pluginId} missing whenNotToUse`);
    if (!plugin.allowedActions?.length) failures.push(`${plugin.pluginId} missing allowedActions`);
    if (!plugin.blockedActions?.length) failures.push(`${plugin.pluginId} missing blockedActions`);
    if (!plugin.productHistorySummaryShape) failures.push(`${plugin.pluginId} missing history summary shape`);
  }
  if (failures.length) {
    throw new Error(`Registry truth failed: ${failures.join("; ")}\n${JSON.stringify(layer, null, 2)}`);
  }
}

function assertSelection(layer, expectedPluginId) {
  const selection = layer?.registrySelection;
  const selected = layer?.primaryPlugin;
  if (selected?.pluginId !== expectedPluginId) {
    throw new Error(`Expected primary plugin ${expectedPluginId}, got ${selected?.pluginId}`);
  }
  if (selection?.taskId !== "GROW-PLUG-002" || selection?.selectedPluginRegistered !== true) {
    throw new Error(`Selected plugin is not registered: ${JSON.stringify(selection, null, 2)}`);
  }
  if (selected?.registryTaskId !== "GROW-PLUG-002" || selected?.firstReleaseRegistered !== true) {
    throw new Error(`Primary plugin does not carry registry truth: ${JSON.stringify(selected, null, 2)}`);
  }
}

async function readDom(page) {
  return page.evaluate(() => {
    const registry = document.querySelector("[data-growth-plugin-registry-task='GROW-PLUG-002']");
    const plugin = document.querySelector("[data-growth-plugin-task='GROW-PLUG-001']");
    const text = document.body.innerText || "";
    return {
      url: location.href,
      registryTask: registry?.getAttribute("data-growth-plugin-registry-task") ?? null,
      registryStatus: registry?.getAttribute("data-growth-plugin-registry-status") ?? null,
      registryMode: registry?.getAttribute("data-growth-plugin-registry-mode") ?? null,
      registryCount: registry?.getAttribute("data-growth-plugin-registry-count") ?? null,
      primaryPlugin: plugin?.getAttribute("data-growth-plugin-primary") ?? null,
      hasRegistryHeading: /יכולות השחרור הראשון/u.test(text),
      hasSocial: /קמפיין חברתי/u.test(text),
      hasSeo: /חיפוש אורגני/u.test(text),
      hasSem: /פרסום ממומן/u.test(text),
      hasEmail: /אימייל/u.test(text),
      hasLanding: /דף נחיתה/u.test(text),
      hasMeasurement: /מדידה/u.test(text),
      hasMarketplaceLeak: /marketplace|plugin marketplace|שוק תוספים/u.test(text),
    };
  });
}

const tokenBundle = await signup();
await createProject(tokenBundle.accessToken);

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק רישום צמיחה",
  tokenBundle,
};

const proofCases = [
  ["תייצר קמפיין השקה קטן", "social-campaign-draft"],
  ["תכין SEO לעמוד הזה", "seo-page-draft"],
  ["תכין מודעה עם תקציב קטן", "paid-test-draft"],
  ["תכין מייל ראשון ללקוחות", "email-draft"],
  ["תכין דף נחיתה לבדיקה", "landing-experiment-draft"],
  ["תגדיר מדידה קטנה", "measurement-plan"],
];

const apiStates = [];
for (const [input, expectedPluginId] of proofCases) {
  const project = await runGrowth(tokenBundle.accessToken, input);
  const layer = readLayer(project);
  assertRegistryLayer(layer);
  assertSelection(layer, expectedPluginId);
  apiStates.push({
    input,
    selectedPluginId: layer.primaryPlugin.pluginId,
    registryCount: layer.registry.plugins.length,
  });
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript((storedUser) => {
  localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
}, appUser);

await page.goto(`${baseUrl}/growth?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
await page.waitForSelector("[data-growth-plugin-registry-task='GROW-PLUG-002']", { timeout: 20_000 });
await page.waitForFunction(() => {
  const registry = document.querySelector("[data-growth-plugin-registry-task='GROW-PLUG-002']");
  return registry?.getAttribute("data-growth-plugin-registry-count") === "6";
}, { timeout: 20_000 });
const domState = await readDom(page);
await page.screenshot({ path: screenshotPath, fullPage: true });
await browser.close();

const domFailures = [];
if (domState.registryTask !== "GROW-PLUG-002") domFailures.push("missing visible registry task");
if (domState.registryStatus !== "ready") domFailures.push("registry status is not ready");
if (domState.registryMode !== "simple-intents-not-marketplace") domFailures.push("registry mode is not simple intent");
if (domState.registryCount !== "6") domFailures.push("registry count is not 6");
for (const key of ["hasRegistryHeading", "hasSocial", "hasSeo", "hasSem", "hasEmail", "hasLanding", "hasMeasurement"]) {
  if (domState[key] !== true) domFailures.push(`missing visible ${key}`);
}
if (domState.hasMarketplaceLeak) domFailures.push("marketplace language leaked");
if (domFailures.length) {
  throw new Error(`Visible registry failed: ${domFailures.join("; ")}\n${JSON.stringify(domState, null, 2)}`);
}

const restored = await apiJson(`/api/projects/${projectId}`, {
  token: tokenBundle.accessToken,
  expected: 200,
});
const restoredLayer = readLayer(restored.payload);
assertRegistryLayer(restoredLayer);
assertSelection(restoredLayer, "measurement-plan");

const report = {
  taskId: "GROW-PLUG-002",
  baseUrl,
  userId,
  projectId,
  apiStates,
  domState,
  restoredSelectedPluginId: restoredLayer.primaryPlugin.pluginId,
  screenshotPath,
  reportPath,
};

await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
