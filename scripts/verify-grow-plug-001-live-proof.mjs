import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = `growplug-user-${now}`;
const projectId = `growplug-leads-${now}`;
const reportPath = process.env.NEXUS_GROW_PLUG_REPORT_PATH ?? `/private/tmp/nexus-grow-plug-001-${now}-report.json`;
const screenshotPrefix = process.env.NEXUS_GROW_PLUG_SCREENSHOT_PREFIX ?? `/private/tmp/nexus-grow-plug-001-${now}`;

async function apiJson(path, {
  method = "GET",
  token = null,
  body = null,
  expected = null,
} = {}) {
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
  return { status: response.status, payload, headers: response.headers };
}

async function signup() {
  const result = await apiJson("/api/auth/signup", {
    method: "POST",
    expected: 201,
    body: {
      userInput: {
        userId,
        email: `${userId}@example.test`,
        displayName: "בודק שכבת צמיחה",
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
      name: "ניהול לידים לצמיחה",
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

async function readGrowthDom(page, label) {
  return page.evaluate((stateLabel) => {
    const surface = document.querySelector("[data-growth-surface-contract='SURF-005']");
    const plugin = document.querySelector("[data-growth-plugin-task='GROW-PLUG-001']");
    const attr = (root, name) => root?.getAttribute(name) ?? null;
    const text = document.body.innerText || "";
    return {
      label: stateLabel,
      url: location.href,
      surfaceContract: attr(surface, "data-growth-surface-contract"),
      agentTask: attr(surface, "data-growth-agent-task"),
      agentStatus: attr(surface, "data-growth-agent-status"),
      pluginTask: attr(plugin, "data-growth-plugin-task"),
      pluginStatus: attr(plugin, "data-growth-plugin-status"),
      primaryPlugin: attr(plugin, "data-growth-plugin-primary"),
      providerRequired: attr(plugin, "data-growth-plugin-provider-required"),
      approvalRequired: attr(plugin, "data-growth-plugin-approval-required"),
      handoff: attr(plugin, "data-growth-plugin-handoff"),
      hasFakeOutcome: /יגדיל|יביא משתמשים|הכנסות|המרות|ויראלי|דירוג ראשון/u.test(text),
      excerpt: text.slice(0, 1200),
    };
  }, label);
}

function assertDom(state, expected) {
  const failures = [];
  for (const [key, value] of Object.entries(expected)) {
    if (state[key] !== value) {
      failures.push(`expected ${key}=${value}, got ${state[key]}`);
    }
  }
  if (state.surfaceContract !== "SURF-005") failures.push("missing SURF-005");
  if (state.agentTask !== "GROW-AGT-001") failures.push("missing GROW-AGT-001");
  if (state.pluginTask !== "GROW-PLUG-001") failures.push("missing GROW-PLUG-001");
  if (state.hasFakeOutcome) failures.push("fake outcome copy visible");
  if (failures.length) {
    throw new Error(`${state.label} failed: ${failures.join("; ")}\n${JSON.stringify(state, null, 2)}`);
  }
}

async function openAndAssert(page, label, expected) {
  await page.goto(`${baseUrl}/growth?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-growth-plugin-task='GROW-PLUG-001']", { timeout: 20_000 });
  try {
    await page.waitForFunction((target) => {
      const surface = document.querySelector("[data-growth-surface-contract='SURF-005']");
      const plugin = document.querySelector("[data-growth-plugin-task='GROW-PLUG-001']");
      return (
        surface?.getAttribute("data-growth-agent-status") === target.agentStatus
        && plugin?.getAttribute("data-growth-plugin-status") === target.pluginStatus
        && plugin?.getAttribute("data-growth-plugin-primary") === target.primaryPlugin
        && plugin?.getAttribute("data-growth-plugin-provider-required") === target.providerRequired
        && plugin?.getAttribute("data-growth-plugin-approval-required") === target.approvalRequired
        && plugin?.getAttribute("data-growth-plugin-handoff") === target.handoff
      );
    }, expected, { timeout: 20_000 });
  } catch (error) {
    const observed = await readGrowthDom(page, `${label}-timeout`);
    throw new Error(`${label} did not reach expected live state: ${error.message}\n${JSON.stringify({ expected, observed }, null, 2)}`);
  }
  const state = await readGrowthDom(page, label);
  assertDom(state, expected);
  await page.screenshot({ path: `${screenshotPrefix}-${label}.png`, fullPage: true });
  return state;
}

const tokenBundle = await signup();
await createProject(tokenBundle.accessToken);

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק שכבת צמיחה",
  tokenBundle,
};

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript((storedUser) => {
  localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
}, appUser);

const proofCases = [
  {
    label: "audience",
    input: "איך מתחילים לבדוק אם זה מעניין?",
    expected: {
      agentStatus: "recommended",
      pluginStatus: "selected",
      primaryPlugin: "audience-understanding-test",
      providerRequired: "false",
      approvalRequired: "false",
      handoff: "none",
    },
  },
  {
    label: "seo",
    input: "תכין SEO לעמוד הזה",
    expected: {
      agentStatus: "needs-approval",
      pluginStatus: "needs-approval",
      primaryPlugin: "seo-page-draft",
      providerRequired: "false",
      approvalRequired: "true",
      handoff: "visual-build-agent",
    },
  },
  {
    label: "sem",
    input: "תכין מודעה עם תקציב קטן",
    expected: {
      agentStatus: "needs-provider",
      pluginStatus: "needs-provider",
      primaryPlugin: "paid-test-draft",
      providerRequired: "true",
      approvalRequired: "true",
      handoff: "none",
    },
  },
  {
    label: "email",
    input: "תכין מייל ראשון ללקוחות",
    expected: {
      agentStatus: "needs-approval",
      pluginStatus: "needs-approval",
      primaryPlugin: "email-draft",
      providerRequired: "true",
      approvalRequired: "true",
      handoff: "none",
    },
  },
  {
    label: "landing",
    input: "תכין דף נחיתה לבדיקה",
    expected: {
      agentStatus: "needs-approval",
      pluginStatus: "needs-approval",
      primaryPlugin: "landing-experiment-draft",
      providerRequired: "false",
      approvalRequired: "true",
      handoff: "visual-build-agent",
    },
  },
  {
    label: "measure",
    input: "תגדיר מדידה קטנה",
    expected: {
      agentStatus: "selected",
      pluginStatus: "selected",
      primaryPlugin: "measurement-plan",
      providerRequired: "false",
      approvalRequired: "false",
      handoff: "analytics-measurement-plugin",
    },
  },
  {
    label: "campaign",
    input: "תייצר קמפיין השקה קטן",
    expected: {
      agentStatus: "needs-approval",
      pluginStatus: "needs-approval",
      primaryPlugin: "social-campaign-draft",
      providerRequired: "true",
      approvalRequired: "true",
      handoff: "social-campaign-execution-agent",
    },
  },
];

const states = [];
for (const proofCase of proofCases) {
  const project = await runGrowth(tokenBundle.accessToken, proofCase.input);
  const layer = project.growthAgent?.growthPluginLayer
    ?? project.context?.growthAgent?.growthPluginLayer
    ?? project.state?.growthAgent?.growthPluginLayer;
  if (layer?.primaryPlugin?.pluginId !== proofCase.expected.primaryPlugin) {
    throw new Error(`Project truth mismatch for ${proofCase.label}: ${JSON.stringify(layer, null, 2)}`);
  }
  states.push(await openAndAssert(page, proofCase.label, proofCase.expected));
}

await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForSelector("[data-growth-plugin-task='GROW-PLUG-001']", { timeout: 20_000 });
await page.waitForFunction((target) => {
  const surface = document.querySelector("[data-growth-surface-contract='SURF-005']");
  const plugin = document.querySelector("[data-growth-plugin-task='GROW-PLUG-001']");
  return (
    surface?.getAttribute("data-growth-agent-status") === target.agentStatus
    && plugin?.getAttribute("data-growth-plugin-status") === target.pluginStatus
    && plugin?.getAttribute("data-growth-plugin-primary") === target.primaryPlugin
    && plugin?.getAttribute("data-growth-plugin-provider-required") === target.providerRequired
    && plugin?.getAttribute("data-growth-plugin-approval-required") === target.approvalRequired
    && plugin?.getAttribute("data-growth-plugin-handoff") === target.handoff
  );
}, proofCases.at(-1).expected, { timeout: 20_000 });
const afterRefresh = await readGrowthDom(page, "campaign-after-refresh");
assertDom(afterRefresh, proofCases.at(-1).expected);
states.push(afterRefresh);

await browser.close();

const restored = await apiJson(`/api/projects/${projectId}`, {
  token: tokenBundle.accessToken,
  expected: 200,
});
const restoredLayer = restored.payload?.growthAgent?.growthPluginLayer
  ?? restored.payload?.context?.growthAgent?.growthPluginLayer
  ?? restored.payload?.state?.growthAgent?.growthPluginLayer;

const report = {
  taskId: "GROW-PLUG-001",
  baseUrl,
  userId,
  projectId,
  states,
  restoredPrimaryPlugin: restoredLayer?.primaryPlugin?.pluginId ?? null,
  reportPath,
};

if (report.restoredPrimaryPlugin !== "social-campaign-draft") {
  throw new Error(`Refresh/project restore did not preserve GROW-PLUG-001 truth: ${JSON.stringify(report, null, 2)}`);
}

await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
