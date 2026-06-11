import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `exp003-user-${now}`;
const projectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `exp003-live-${now}`;
const reportPath = process.env.NEXUS_EXP003_REPORT_PATH ?? `/private/tmp/nexus-exp-003-${now}-report.json`;
const screenshotPrefix = process.env.NEXUS_EXP003_SCREENSHOT_PREFIX ?? `/private/tmp/nexus-exp-003-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק גרסאות",
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
      name: "ניהול לידים עם גרסאות",
      goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא. צריך לראות גרסאות וחזרה בטוחה.",
      artifactExpectation: {
        projectType: "internal tool",
        deliverableLabel: "רשימת לידים עם גרסאות וחזרה",
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
    const versionCards = Array.from(document.querySelectorAll("[data-history-version-card]")).map((card) => ({
      id: card.getAttribute("data-history-version-card"),
      task: card.getAttribute("data-history-version-task"),
      checkpointId: card.getAttribute("data-history-version-checkpoint-id"),
      domainModel: card.getAttribute("data-history-version-domain-model"),
      text: (card.innerText || "").slice(0, 500),
    }));
    const text = document.body.innerText || "";
    return {
      label: stateLabel,
      url: location.href,
      screen: document.body.dataset.appScreen || "",
      historySurface: attr("[data-history-surface-contract]", "data-history-surface-contract"),
      versioningTask: attr("[data-history-versioning-task]", "data-history-versioning-task"),
      versioningBoundary: attr("[data-history-versioning-task]", "data-history-versioning-boundary"),
      historyAgentTask: attr("[data-history-continuity-agent-task]", "data-history-continuity-agent-task"),
      restoreDecisionStatus: attr("[data-history-continuity-agent-task]", "data-history-restore-decision-status"),
      checkpointButtonCount: document.querySelectorAll("[data-history-restore-button]").length,
      versionCardCount: versionCards.length,
      versionCards,
      hasVersionCopy: /גרסת מוצר|מה יחזור|מה יוסר|אין השפעת שחרור/u.test(text),
      hasRawRestoreState: /possible-with-impact|safe|not-possible/u.test(text),
      hasInternalVisibleLeak: /system ids|function names|provider details|raw logs|MUT-001|EXP-002|history-continuity-agent/u.test(text),
      seesLeads: /ניהול לידים|לידים/u.test(text),
      seesOrders: /ניהול הזמנות|הזמנות/u.test(text),
      excerpt: text.slice(0, 1600),
    };
  }, label);
}

function assertHistoryVersionState(state, expected = {}) {
  const failures = [];
  if (state.historySurface !== "SURF-006") failures.push("missing SURF-006");
  if (state.versioningTask !== "EXP-003") failures.push("missing EXP-003 versioning task");
  if (state.versioningBoundary !== "visible-versioning-over-history-agent") failures.push("missing versioning boundary");
  if (state.historyAgentTask !== "HIST-AGT-001") failures.push("missing history agent");
  if (state.versionCardCount < 1) failures.push("missing version cards");
  if (!state.versionCards.some((card) => card.task === "EXP-003" && card.checkpointId)) failures.push("version cards are not tied to checkpoints");
  if (!state.hasVersionCopy) failures.push("missing product version copy");
  if (state.hasRawRestoreState) failures.push("raw restore state visible");
  if (state.hasInternalVisibleLeak) failures.push("internal leak visible");
  for (const [key, value] of Object.entries(expected)) {
    if (state[key] !== value) failures.push(`expected ${key}=${value}, got ${state[key]}`);
  }
  if (failures.length) {
    throw new Error(`${state.label} failed EXP-003 live proof: ${failures.join("; ")}\n${JSON.stringify(state, null, 2)}`);
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
  await sendBuildRailMessage(page, "תוסיף שדה מקור ליד");
  await page.waitForSelector("[data-canonical-mutation-flow-task='EXP-002'][data-canonical-mutation-flow-status='applied']", { timeout: 20_000 });
  await sendBuildRailMessage(page, "תשנה את זה להזמנות במקום לידים");
  await page.waitForSelector("[data-canonical-mutation-flow-task='EXP-002'][data-canonical-mutation-flow-status='pending-approval']", { timeout: 20_000 });
  await page.waitForSelector("[data-build-approval-action='approve']", { timeout: 20_000 });
  await page.locator("[data-build-approval-action='approve']").click();
  await page.waitForSelector("[data-build-approval-task='BUILD-APPROVAL-001'][data-build-approval-decision-status='approved']", { timeout: 20_000 });

  await page.goto(`${baseUrl}/timeline?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-history-versioning-task='EXP-003']", { timeout: 20_000 });
  const beforeRestore = await dumpHistoryState(page, "before-restore");
  assertHistoryVersionState(beforeRestore, {
    restoreDecisionStatus: "not-requested",
    seesOrders: true,
  });
  await page.screenshot({ path: `${screenshotPrefix}-before-restore.png`, fullPage: true });

  await page.locator("[data-history-restore-button][data-history-checkpoint-domain-model='ליד']").first().click();
  await page.waitForSelector("[data-history-restore-decision-status='impact-ready']", { timeout: 20_000 });
  const impactReady = await dumpHistoryState(page, "impact-ready");
  assertHistoryVersionState(impactReady, {
    restoreDecisionStatus: "impact-ready",
  });
  await page.screenshot({ path: `${screenshotPrefix}-impact-ready.png`, fullPage: true });

  await page.locator("[data-history-restore-execute-button]").click();
  await page.waitForSelector("[data-history-restore-decision-status='restored']", { timeout: 20_000 });
  const restored = await dumpHistoryState(page, "restored");
  assertHistoryVersionState(restored, {
    restoreDecisionStatus: "restored",
    seesLeads: true,
  });
  await page.screenshot({ path: `${screenshotPrefix}-restored.png`, fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-history-versioning-task='EXP-003']", { timeout: 20_000 });
  await page.waitForSelector("[data-history-restore-decision-status='restored']", { timeout: 20_000 });
  const afterRefresh = await dumpHistoryState(page, "after-refresh");
  assertHistoryVersionState(afterRefresh, {
    restoreDecisionStatus: "restored",
    seesLeads: true,
  });
  await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });

  await browser.close();

  const restoredProjectPayload = await apiJson(`/api/projects/${projectId}`);
  const project = restoredProjectPayload.project ?? restoredProjectPayload;
  const report = {
    taskId: "EXP-003",
    baseUrl,
    userId,
    projectId,
    reportPath,
    screenshots: {
      beforeRestore: `${screenshotPrefix}-before-restore.png`,
      impactReady: `${screenshotPrefix}-impact-ready.png`,
      restored: `${screenshotPrefix}-restored.png`,
      afterRefresh: `${screenshotPrefix}-after-refresh.png`,
    },
    states: [beforeRestore, impactReady, restored, afterRefresh],
    backendTruth: {
      historyTask: project.historyContinuityAgent?.taskId ?? null,
      historyStatus: project.historyContinuityAgent?.status ?? null,
      checkpointCount: project.historyContinuityAgent?.checkpoints?.length ?? 0,
      restoreDecisionStatus: project.historyContinuityAgent?.restoreDecision?.status ?? null,
      domainModel: project.productDomainSkeleton?.models?.[0]?.name ?? null,
      runtimeTitle: project.runtimeSkeletonTruth?.title ?? null,
    },
    badEvents: events.filter((event) => {
      if (event.status === 404) return false;
      if (event.kind === "console" && /404|favicon|not found/i.test(event.text ?? "")) return false;
      return true;
    }),
  };

  if (
    report.backendTruth.historyTask !== "HIST-AGT-001"
    || report.backendTruth.historyStatus !== "restored"
    || report.backendTruth.checkpointCount < 1
    || report.backendTruth.restoreDecisionStatus !== "restored"
    || report.backendTruth.domainModel !== "ליד"
    || !/לידים/u.test(report.backendTruth.runtimeTitle ?? "")
    || report.badEvents.length > 0
  ) {
    throw new Error(`EXP-003 backend truth failed: ${JSON.stringify(report, null, 2)}`);
  }

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
