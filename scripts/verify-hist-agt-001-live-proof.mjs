import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `histagt-user-${now}`;
const projectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `histagt-live-${now}`;
const reportPath = process.env.NEXUS_HIST_AGT_REPORT_PATH ?? `/private/tmp/nexus-hist-agt-001-${now}-report.json`;
const screenshotPrefix = process.env.NEXUS_HIST_AGT_SCREENSHOT_PREFIX ?? `/private/tmp/nexus-hist-agt-001-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק רציפות",
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
      name: "ניהול לידים עם היסטוריה",
      goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא. בלי וואטסאפ אמיתי ובלי פרסום.",
      artifactExpectation: {
        projectType: "internal tool",
        deliverableLabel: "רשימת לידים עם היסטוריה ושחזור",
      },
    },
  });
}

async function sendBuildRailMessage(page, message) {
  const input = page.locator("[data-agent-rail-input]").last();
  await input.fill(message);
  await page.locator("[data-agent-rail-send]").last().click();
}

async function dumpHistoryState(page, label) {
  return page.evaluate((stateLabel) => {
    const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) ?? null;
    const text = document.body.innerText || "";
    return {
      label: stateLabel,
      url: location.href,
      historySurface: attr("[data-history-surface-contract]", "data-history-surface-contract"),
      historyAgent: attr("[data-history-surface-contract]", "data-history-continuity-agent"),
      historyAgentTask: attr("[data-history-continuity-agent-task]", "data-history-continuity-agent-task"),
      historyAgentStatus: attr("[data-history-continuity-agent-task]", "data-history-continuity-agent-status"),
      restoreDecisionStatus: attr("[data-history-continuity-agent-task]", "data-history-restore-decision-status"),
      activeRoute: attr(".nexus-history-workspace-shell [data-nexus-workspace-rail]", "data-nexus-rail-active-route"),
      hasChangeLog: !!document.querySelector("[data-history-region='history-change-log']"),
      hasCheckpoints: !!document.querySelector("[data-history-region='history-restore-checkpoints']"),
      hasReturnToBuild: !!document.querySelector("#timeline-return-button"),
      checkpointButtonCount: document.querySelectorAll("[data-history-restore-button]").length,
      leadCheckpointButtonCount: document.querySelectorAll("[data-history-restore-button][data-history-checkpoint-domain-model='ליד']").length,
      hasRestoreExecute: !!document.querySelector("[data-history-restore-execute-button]"),
      hasProductHistoryCopy: /מה באמת השתנה|שינוי כיוון|מקור ליד|ממתין לאישור/u.test(text),
      hasRestoreImpactCopy: /מה יחזור|מה יוסר|מה יישאר|עדיין לא בוצע שחזור|שוחזר מצב המוצר/u.test(text),
      hasInternalVisibleLeak: /system ids|function names|provider details|raw logs|MUT-001|EXP-002|history-continuity-agent/u.test(text),
      hasReleaseImpactBoundary: /אין השפעת שחרור|לא בוצע שחזור/u.test(text),
      seesLeads: /ניהול לידים|לידים/u.test(text),
      seesOrders: /ניהול הזמנות|הזמנות/u.test(text),
      excerpt: text.slice(0, 1600),
    };
  }, label);
}

function assertState(state, expected = {}) {
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
  await page.waitForSelector("[data-canonical-mutation-flow-task='EXP-002'][data-canonical-mutation-flow-status='applied']", { timeout: 20_000 });

  await sendBuildRailMessage(page, "תשנה את זה להזמנות במקום לידים");
  await page.waitForSelector("[data-canonical-mutation-flow-task='EXP-002'][data-canonical-mutation-flow-status='pending-approval']", { timeout: 20_000 });
  await page.waitForSelector("[data-build-approval-action='approve']", { timeout: 20_000 });
  await page.locator("[data-build-approval-action='approve']").click();
  await page.waitForSelector("[data-build-approval-task='BUILD-APPROVAL-001'][data-build-approval-decision-status='approved']", { timeout: 20_000 });
  await page.screenshot({ path: `${screenshotPrefix}-after-changes.png`, fullPage: true });

  await page.goto(`${baseUrl}/timeline?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-history-continuity-agent-task='HIST-AGT-001']", { timeout: 20_000 });
  const historyBeforeRestore = await dumpHistoryState(page, "history-before-restore");
  assertState(historyBeforeRestore, {
    historySurface: "SURF-006",
    historyAgent: "HIST-AGT-001",
    historyAgentTask: "HIST-AGT-001",
    historyAgentStatus: "recorded",
    restoreDecisionStatus: "not-requested",
    activeRoute: "timeline",
    hasChangeLog: true,
    hasCheckpoints: true,
    hasReturnToBuild: true,
    hasProductHistoryCopy: true,
    hasInternalVisibleLeak: false,
  });
  if (historyBeforeRestore.checkpointButtonCount < 1) {
    throw new Error(`Expected at least one checkpoint action: ${JSON.stringify(historyBeforeRestore, null, 2)}`);
  }
  if (historyBeforeRestore.leadCheckpointButtonCount < 1) {
    throw new Error(`Expected a lead product checkpoint after approved direction change: ${JSON.stringify(historyBeforeRestore, null, 2)}`);
  }
  await page.screenshot({ path: `${screenshotPrefix}-history-before-restore.png`, fullPage: true });

  await page.locator("[data-history-restore-button][data-history-checkpoint-domain-model='ליד']").first().click();
  await page.waitForSelector("[data-history-restore-decision-status='impact-ready']", { timeout: 20_000 });
  const restoreDecision = await dumpHistoryState(page, "restore-decision");
  assertState(restoreDecision, {
    restoreDecisionStatus: "impact-ready",
    hasRestoreImpactCopy: true,
    hasRestoreExecute: true,
    hasReleaseImpactBoundary: true,
    hasInternalVisibleLeak: false,
  });
  await page.screenshot({ path: `${screenshotPrefix}-restore-decision.png`, fullPage: true });

  await page.locator("[data-history-restore-execute-button]").click();
  await page.waitForSelector("[data-history-restore-decision-status='restored']", { timeout: 20_000 });
  const restoreExecuted = await dumpHistoryState(page, "restore-executed");
  assertState(restoreExecuted, {
    restoreDecisionStatus: "restored",
    hasRestoreImpactCopy: true,
    hasInternalVisibleLeak: false,
    seesLeads: true,
  });
  if (restoreExecuted.seesOrders && !restoreExecuted.seesLeads) {
    throw new Error(`Restore execution left only orders visible: ${JSON.stringify(restoreExecuted, null, 2)}`);
  }
  await page.screenshot({ path: `${screenshotPrefix}-restore-executed.png`, fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-history-restore-decision-status='restored']", { timeout: 20_000 });
  const afterRefresh = await dumpHistoryState(page, "after-refresh");
  assertState(afterRefresh, {
    historyAgentTask: "HIST-AGT-001",
    restoreDecisionStatus: "restored",
    hasRestoreImpactCopy: true,
    hasInternalVisibleLeak: false,
    seesLeads: true,
  });
  await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });

  await page.locator("#timeline-return-button").click();
  await page.waitForSelector("[data-runtime-skeleton-title]", { timeout: 20_000 });
  const returnToBuild = await page.evaluate(() => ({
    url: location.href,
    flowStatus: document.querySelector("[data-canonical-mutation-flow-task]")?.getAttribute("data-canonical-mutation-flow-status") ?? null,
    runtimeTitle: document.querySelector("[data-runtime-skeleton-title]")?.getAttribute("data-runtime-skeleton-title") ?? null,
    domainKind: document.querySelector("[data-product-domain-kind]")?.getAttribute("data-product-domain-kind") ?? null,
    bodyText: (document.body.innerText || "").slice(0, 1200),
  }));
  if (!/ניהול לידים|לידים/u.test(returnToBuild.bodyText) || !/לידים/u.test(returnToBuild.runtimeTitle ?? "") || /ניהול הזמנות/u.test(returnToBuild.runtimeTitle ?? "")) {
    throw new Error(`Return to Build did not show restored lead product truth: ${JSON.stringify(returnToBuild, null, 2)}`);
  }
  await page.screenshot({ path: `${screenshotPrefix}-return-to-build.png`, fullPage: true });

  await browser.close();

  const restored = await apiJson(`/api/projects/${projectId}`);
  const project = restored.project ?? restored;
  const report = {
    taskId: "HIST-AGT-001",
    baseUrl,
    userId,
    projectId,
    reportPath,
    screenshots: {
      initial: `${screenshotPrefix}-initial.png`,
      afterChanges: `${screenshotPrefix}-after-changes.png`,
      historyBeforeRestore: `${screenshotPrefix}-history-before-restore.png`,
      restoreDecision: `${screenshotPrefix}-restore-decision.png`,
      restoreExecuted: `${screenshotPrefix}-restore-executed.png`,
      afterRefresh: `${screenshotPrefix}-after-refresh.png`,
      returnToBuild: `${screenshotPrefix}-return-to-build.png`,
    },
    states: [historyBeforeRestore, restoreDecision, restoreExecuted, afterRefresh, returnToBuild],
    backendTruth: {
      historyTask: project.historyContinuityAgent?.taskId ?? null,
      historyStatus: project.historyContinuityAgent?.status ?? null,
      productHistoryCount: project.historyContinuityAgent?.productHistory?.length ?? 0,
      checkpointCount: project.historyContinuityAgent?.checkpoints?.length ?? 0,
      restoreDecisionStatus: project.historyContinuityAgent?.restoreDecision?.status ?? null,
      restoreTruthUnchanged: project.historyContinuityAgent?.restoreDecision?.currentTruthUnchanged ?? null,
      mutationDecisionStatus: project.mutationChangeDecision?.status ?? null,
      canonicalFlowStatus: project.canonicalMutationFlow?.status ?? null,
      productGoal: project.goal,
      domainModel: project.productDomainSkeleton?.models?.[0]?.name ?? null,
      runtimeTitle: project.runtimeSkeletonTruth?.title ?? null,
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
    report.backendTruth.historyTask !== "HIST-AGT-001"
    || report.backendTruth.historyStatus !== "restored"
    || report.backendTruth.productHistoryCount < 2
    || report.backendTruth.checkpointCount < 1
    || report.backendTruth.restoreDecisionStatus !== "restored"
    || report.backendTruth.restoreTruthUnchanged !== false
    || report.backendTruth.mutationDecisionStatus !== "restored"
    || !/לידים/u.test(report.backendTruth.productGoal)
    || /הזמנות/u.test(report.backendTruth.productGoal)
    || report.backendTruth.domainModel !== "ליד"
    || !/לידים/u.test(report.backendTruth.runtimeTitle ?? "")
    || report.badEvents.length > 0
  ) {
    throw new Error(`HIST-AGT-001 live proof failed: ${JSON.stringify(report, null, 2)}`);
  }

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
