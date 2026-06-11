import fs from "node:fs/promises";
import { chromium } from "playwright-core";
import { buildGrowthAgentEnvelope } from "../src/core/growth-agent.js";
import { buildGrowthSurfaceViewModel } from "../web/nexus-ui/adapters/growth-surface-adapter.js";
import { renderGrowthSurfaceScreen } from "../web/nexus-ui/screens/GrowthSurfaceScreen.js";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `growagt-user-${now}`;
const leadProjectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `growagt-leads-${now}`;
const reportPath = process.env.NEXUS_GROW_AGT_REPORT_PATH ?? `/private/tmp/nexus-grow-agt-001-${now}-report.json`;
const screenshotPrefix = process.env.NEXUS_GROW_AGT_SCREENSHOT_PREFIX ?? `/private/tmp/nexus-grow-agt-001-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק צמיחה",
};

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

async function createUserAndProject() {
  await apiJson("/api/auth/signup", {
    method: "POST",
    body: {
      userInput: appUser,
      credentials: { password: "TestOnly123!" },
    },
  });

  await apiJson("/api/projects", {
    method: "POST",
    body: {
      id: leadProjectId,
      name: "ניהול לידים לצמיחה",
      goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
      artifactExpectation: {
        projectType: "internal tool",
        deliverableLabel: "שלד ניהול לידים",
      },
      state: {
        artifactExpectation: {
          projectType: "internal-tool",
          deliverableLabel: "שלד ניהול לידים",
        },
        runtimeSkeletonTruth: {
          runtimeSkeletonId: `runtime-skeleton:${leadProjectId}:internal-tool`,
          title: "ניהול לידים",
          productClass: "internal-tool",
        },
        productDomainSkeleton: {
          productDomainSkeletonId: `product-domain:${leadProjectId}:internal-tool`,
        },
        productOwnedBackendSkeleton: {
          productOwnedBackendSkeletonId: `product-owned-backend:${leadProjectId}:internal-tool`,
          productionBackend: false,
        },
      },
    },
  });
}

async function runGrowthAgent(userInput) {
  const payload = await apiJson(`/api/projects/${leadProjectId}/growth-agent`, {
    method: "POST",
    body: { userInput },
  });
  return payload.project ?? payload;
}

async function dumpGrowthState(page, label) {
  return page.evaluate((stateLabel) => {
    const root = document.querySelector("[data-growth-surface-contract='SURF-005']");
    const attr = (name) => root?.getAttribute(name) ?? null;
    const text = document.body.innerText || "";
    return {
      label: stateLabel,
      url: location.href,
      screen: document.body.dataset.appScreen || "",
      contract: attr("data-growth-surface-contract"),
      task: attr("data-growth-agent-task"),
      status: attr("data-growth-agent-status"),
      opportunityType: attr("data-growth-agent-opportunity-type"),
      requiresAgent: attr("data-growth-agent-requires-agent"),
      requiresApproval: attr("data-growth-agent-requires-approval"),
      canRun: attr("data-growth-agent-can-run"),
      externalLocked: attr("data-growth-campaign-external-action-locked"),
      hasMutationCopy: /סוכן שינוי/u.test(text),
      hasShareCopy: /סוכן השיתוף|שיתוף/u.test(text),
      hasMetric: /3 מתוך 5|בתוך דקה/u.test(text),
      hasGenericMarketing: /TikTok|SEO|Facebook|conversion|revenue|virality|קמפיין רחב/u.test(text),
      hasFakeOutcome: /יגדיל|יביא משתמשים|הכנסות|המרות/u.test(text),
      excerpt: text.slice(0, 1400),
    };
  }, label);
}

function assertState(state, expected) {
  const failures = [];
  if (state.contract !== "SURF-005") failures.push("missing SURF-005");
  if (state.task !== "GROW-AGT-001") failures.push("missing GROW-AGT-001");
  for (const [key, value] of Object.entries(expected)) {
    if (state[key] !== value) failures.push(`expected ${key}=${value}, got ${state[key]}`);
  }
  if (expected.hasMetric && !state.hasMetric) failures.push("missing truthful small metric");
  if (expected.hasMutationCopy && !state.hasMutationCopy) failures.push("missing mutation handoff copy");
  if (expected.hasShareCopy && !state.hasShareCopy) failures.push("missing share handoff copy");
  if (state.hasGenericMarketing) failures.push("generic marketing visible");
  if (state.hasFakeOutcome) failures.push("fake outcome visible");
  if (failures.length) {
    throw new Error(`${state.label} failed GROW-AGT-001 live proof: ${failures.join("; ")}\n${JSON.stringify(state, null, 2)}`);
  }
}

async function openGrowth(page, expectedStatus) {
  await page.goto(`${baseUrl}/growth?projectId=${encodeURIComponent(leadProjectId)}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-growth-agent-task='GROW-AGT-001']", { timeout: 20_000 });
  if (expectedStatus) {
    await page.waitForFunction(
      ({ projectId, status }) => {
        const root = document.querySelector("[data-growth-agent-task='GROW-AGT-001']");
        return root
          && root.getAttribute("data-growth-agent-status") === status
          && location.href.includes(projectId);
      },
      { projectId: leadProjectId, status: expectedStatus },
      { timeout: 20_000 },
    );
  }
}

async function main() {
  const noProductEnvelope = buildGrowthAgentEnvelope({
    project: { id: "vague-growth", name: "רעיון לא ברור", goal: "משהו לעסקים" },
    userInput: "How do I bring users?",
  });
  const noProductHtml = renderGrowthSurfaceScreen(buildGrowthSurfaceViewModel({
    project: {
      id: "vague-growth",
      name: "רעיון לא ברור",
      goal: "משהו לעסקים",
      growthAgent: noProductEnvelope,
    },
  }));

  await createUserAndProject();

  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    slowMo: Number(process.env.NEXUS_LIVE_SLOW_MO ?? 100),
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.setExtraHTTPHeaders({ "x-user-id": userId });
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

  await page.addInitScript((storedUser) => {
    localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
  }, appUser);

  await page.setContent(noProductHtml);
  const noProductState = await dumpGrowthState(page, "no-product-truth");
  assertState(noProductState, {
    status: "needs-product-first",
    opportunityType: "user-learning",
    requiresAgent: "none",
    canRun: "false",
    externalLocked: "true",
  });
  await page.screenshot({ path: `${screenshotPrefix}-no-product.png`, fullPage: true });

  await runGrowthAgent("How do I start checking if this is interesting?");
  await openGrowth(page, "recommended");
  const experimentState = await dumpGrowthState(page, "audience-test");
  assertState(experimentState, {
    status: "recommended",
    opportunityType: "audience-test",
    requiresAgent: "none",
    canRun: "true",
    externalLocked: "true",
    hasMetric: true,
  });
  await page.screenshot({ path: `${screenshotPrefix}-audience-test.png`, fullPage: true });

  await runGrowthAgent("Add follow-up today to the product");
  await openGrowth(page, "handoff-required");
  const mutationState = await dumpGrowthState(page, "mutation-handoff");
  assertState(mutationState, {
    status: "handoff-required",
    opportunityType: "product-improvement",
    requiresAgent: "mutation-change-agent",
    requiresApproval: "true",
    canRun: "true",
    externalLocked: "true",
    hasMutationCopy: true,
  });
  await page.screenshot({ path: `${screenshotPrefix}-mutation.png`, fullPage: true });

  await runGrowthAgent("Prepare something I can send to clients");
  await openGrowth(page, "handoff-required");
  const shareState = await dumpGrowthState(page, "share-handoff");
  assertState(shareState, {
    status: "handoff-required",
    opportunityType: "share",
    requiresAgent: "share-demo-agent",
    requiresApproval: "true",
    canRun: "true",
    externalLocked: "true",
    hasShareCopy: true,
  });
  await page.screenshot({ path: `${screenshotPrefix}-share.png`, fullPage: true });

  await runGrowthAgent("Make a short launch campaign for this");
  await openGrowth(page, "needs-approval");
  const campaignState = await dumpGrowthState(page, "campaign-draft");
  assertState(campaignState, {
    status: "needs-approval",
    opportunityType: "campaign-draft",
    requiresAgent: "none",
    requiresApproval: "true",
    canRun: "true",
    externalLocked: "true",
  });
  await page.screenshot({ path: `${screenshotPrefix}-campaign.png`, fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-growth-agent-task='GROW-AGT-001']", { timeout: 20_000 });
  await page.waitForFunction(
    () => document.querySelector("[data-growth-agent-task='GROW-AGT-001']")?.getAttribute("data-growth-agent-status") === "needs-approval",
    null,
    { timeout: 20_000 },
  );
  const afterRefresh = await dumpGrowthState(page, "campaign-after-refresh");
  assertState(afterRefresh, {
    status: "needs-approval",
    opportunityType: "campaign-draft",
    requiresAgent: "none",
    requiresApproval: "true",
    canRun: "true",
    externalLocked: "true",
  });

  await browser.close();

  const restored = await apiJson(`/api/projects/${leadProjectId}`);
  const report = {
    taskId: "GROW-AGT-001",
    baseUrl,
    userId,
    leadProjectId,
    reportPath,
    screenshots: {
      noProduct: `${screenshotPrefix}-no-product.png`,
      audienceTest: `${screenshotPrefix}-audience-test.png`,
      mutation: `${screenshotPrefix}-mutation.png`,
      share: `${screenshotPrefix}-share.png`,
      campaign: `${screenshotPrefix}-campaign.png`,
    },
    states: [noProductState, experimentState, mutationState, shareState, campaignState, afterRefresh],
    projectTruth: {
      growthTaskId: restored.growthAgent?.taskId ?? restored.context?.growthAgent?.taskId ?? restored.state?.growthAgent?.taskId ?? null,
      growthStatus: restored.growthAgent?.status ?? restored.context?.growthAgent?.status ?? restored.state?.growthAgent?.status ?? null,
      opportunityType: restored.growthAgent?.opportunityType ?? restored.context?.growthAgent?.opportunityType ?? restored.state?.growthAgent?.opportunityType ?? null,
      campaignLocked: restored.growthAgent?.campaignExecution?.requiresExplicitApprovalBeforeExternalAction
        ?? restored.context?.growthAgent?.campaignExecution?.requiresExplicitApprovalBeforeExternalAction
        ?? restored.state?.growthAgent?.campaignExecution?.requiresExplicitApprovalBeforeExternalAction
        ?? null,
    },
    badEvents: events.filter((event) => {
      if (event.status === 404) return false;
      if (event.kind === "console" && /404|favicon|not found/i.test(event.text ?? "")) return false;
      return true;
    }),
  };

  if (
    report.projectTruth.growthTaskId !== "GROW-AGT-001"
    || report.projectTruth.growthStatus !== "needs-approval"
    || report.projectTruth.opportunityType !== "campaign-draft"
    || report.projectTruth.campaignLocked !== true
    || report.badEvents.length > 0
  ) {
    throw new Error(`GROW-AGT-001 project truth failed: ${JSON.stringify(report, null, 2)}`);
  }

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
