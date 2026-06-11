import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `mut001-user-${now}`;
const projectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `mut001-live-${now}`;
const reportPath = process.env.NEXUS_MUT001_REPORT_PATH ?? `/private/tmp/nexus-mut-001-${now}-report.json`;
const screenshotPrefix = process.env.NEXUS_MUT001_SCREENSHOT_PREFIX ?? `/private/tmp/nexus-mut-001-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק שינויי מוצר",
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

async function createProject() {
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
      id: projectId,
      name: "ניהול לידים עם שינוי מאושר",
      goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא. בלי וואטסאפ אמיתי ובלי פרסום.",
      artifactExpectation: {
        projectType: "internal tool",
        deliverableLabel: "רשימת לידים עם שינוי מאושר",
      },
    },
  });
}

async function sendBuildRailMessage(page, message) {
  const input = page.locator("[data-agent-rail-input]").last();
  await input.fill(message);
  await page.locator("[data-agent-rail-send]").last().click();
}

async function dumpState(page, label) {
  return page.evaluate((stateLabel) => {
    const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) ?? null;
    const text = document.body.innerText || "";
    return {
      label: stateLabel,
      url: location.href,
      mutationTask: attr("[data-mutation-change-task]", "data-mutation-change-task"),
      mutationStatus: attr("[data-mutation-change-task]", "data-mutation-change-status"),
      mutationType: attr("[data-mutation-change-task]", "data-mutation-change-type"),
      mutationRequiresApproval: attr("[data-mutation-change-task]", "data-mutation-change-requires-approval"),
      mutationRequiresProductTruth: attr("[data-mutation-change-task]", "data-mutation-change-requires-product-truth"),
      mutationHistoryCount: attr("[data-mutation-change-task]", "data-mutation-change-history-count"),
      buildAgentOwner: attr("[data-build-agent-turn-task]", "data-build-agent-turn-owner"),
      buildAgentStatus: attr("[data-build-agent-turn-task]", "data-build-agent-turn-status"),
      buildAgentMayClaimChanged: attr("[data-build-agent-turn-task]", "data-build-agent-turn-may-claim-changed"),
      hasSilentDirectionChange: /הזמנות.*בוצע|שיניתי.*להזמנות/u.test(text),
      hasApprovalCopy: /לא משנה את המוצר בשקט|צריך אישור/u.test(text),
      hasAppliedCopy: /נוסף שדה מקור ליד|מותר להציג אותו כתוצאה שבוצעה/u.test(text),
      excerpt: text.slice(0, 1400),
    };
  }, label);
}

function assertMutationState(state, expected = {}) {
  for (const [key, value] of Object.entries(expected)) {
    if (state[key] !== value) {
      throw new Error(`Unexpected ${key} for ${state.label}: expected ${value}, got ${state[key]}\n${JSON.stringify(state, null, 2)}`);
    }
  }
}

async function main() {
  await createProject();

  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    slowMo: Number(process.env.NEXUS_LIVE_SLOW_MO ?? 100),
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
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

  await page.goto(`${baseUrl}/loop?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-agent-rail-input]", { timeout: 20_000 });
  await page.screenshot({ path: `${screenshotPrefix}-initial.png`, fullPage: true });

  await sendBuildRailMessage(page, "תוסיף שדה מקור ליד");
  await page.waitForSelector("[data-mutation-change-task='MUT-001'][data-mutation-change-status='applied']", { timeout: 20_000 });
  const afterSafeChange = await dumpState(page, "after-safe-change");
  assertMutationState(afterSafeChange, {
    mutationTask: "MUT-001",
    mutationStatus: "applied",
    mutationType: "small",
    mutationRequiresApproval: "false",
    mutationRequiresProductTruth: "true",
    buildAgentOwner: "mutation-change-agent",
    buildAgentStatus: "applied",
    buildAgentMayClaimChanged: "true",
  });
  if (!afterSafeChange.hasAppliedCopy) {
    throw new Error(`Safe change did not show applied product copy: ${JSON.stringify(afterSafeChange, null, 2)}`);
  }
  await page.screenshot({ path: `${screenshotPrefix}-after-safe-change.png`, fullPage: true });

  await sendBuildRailMessage(page, "תשנה את זה להזמנות במקום לידים");
  await page.waitForSelector("[data-mutation-change-task='MUT-001'][data-mutation-change-status='pending-approval']", { timeout: 20_000 });
  const afterDirectionRequest = await dumpState(page, "after-direction-request");
  assertMutationState(afterDirectionRequest, {
    mutationTask: "MUT-001",
    mutationStatus: "pending-approval",
    mutationType: "product-truth",
    mutationRequiresApproval: "true",
    mutationRequiresProductTruth: "true",
    buildAgentOwner: "mutation-change-agent",
    buildAgentStatus: "approval-required",
    buildAgentMayClaimChanged: "false",
  });
  if (!afterDirectionRequest.hasApprovalCopy || afterDirectionRequest.hasSilentDirectionChange) {
    throw new Error(`Direction change was not safely approval-bound: ${JSON.stringify(afterDirectionRequest, null, 2)}`);
  }
  await page.screenshot({ path: `${screenshotPrefix}-after-direction-request.png`, fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-mutation-change-task='MUT-001'][data-mutation-change-status='pending-approval']", { timeout: 20_000 });
  const afterRefresh = await dumpState(page, "after-refresh");
  assertMutationState(afterRefresh, {
    mutationTask: "MUT-001",
    mutationStatus: "pending-approval",
    mutationType: "product-truth",
    mutationRequiresApproval: "true",
  });
  await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });

  await browser.close();

  const restored = await apiJson(`/api/projects/${projectId}`);
  const project = restored.project ?? restored;
  const fieldNames = project.productDomainSkeleton?.models?.[0]?.fields?.map((field) => field.name) ?? [];
  const report = {
    taskId: "MUT-001",
    baseUrl,
    userId,
    projectId,
    reportPath,
    screenshots: {
      initial: `${screenshotPrefix}-initial.png`,
      afterSafeChange: `${screenshotPrefix}-after-safe-change.png`,
      afterDirectionRequest: `${screenshotPrefix}-after-direction-request.png`,
      afterRefresh: `${screenshotPrefix}-after-refresh.png`,
    },
    states: [afterSafeChange, afterDirectionRequest, afterRefresh],
    backendTruth: {
      mutationDecisionStatus: project.mutationChangeDecision?.status ?? null,
      mutationDecisionType: project.mutationChangeDecision?.changeType ?? null,
      mutationRequiresApproval: project.mutationChangeDecision?.requiresApproval ?? null,
      mutationHistoryCount: project.mutationChangeHistory?.length ?? 0,
      buildMutationHistoryCount: project.buildMutationHistory?.length ?? 0,
      hasLeadSourceField: fieldNames.includes("מקור ליד"),
      productStillLeadFocused: /לידים/u.test(project.goal ?? "") && !/הזמנות/u.test(project.name ?? ""),
    },
    badEvents: events.filter((event) => {
      if (event.status === 404) {
        return false;
      }
      if (event.kind === "console" && /404|favicon|not found/i.test(event.text ?? "")) {
        return false;
      }
      return true;
    }),
  };

  if (
    report.backendTruth.mutationDecisionStatus !== "pending-approval"
    || report.backendTruth.mutationDecisionType !== "product-truth"
    || report.backendTruth.mutationRequiresApproval !== true
    || report.backendTruth.mutationHistoryCount < 2
    || report.backendTruth.buildMutationHistoryCount < 1
    || report.backendTruth.hasLeadSourceField !== true
    || report.backendTruth.productStillLeadFocused !== true
    || report.badEvents.length > 0
  ) {
    throw new Error(`MUT-001 live proof failed: ${JSON.stringify(report, null, 2)}`);
  }

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
