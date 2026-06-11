import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `exp005-user-${now}`;
const projectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `exp005-live-${now}`;
const reportPath = process.env.NEXUS_EXP005_REPORT_PATH ?? `/private/tmp/nexus-exp-005-${now}-report.json`;
const screenshotPrefix = process.env.NEXUS_EXP005_SCREENSHOT_PREFIX ?? `/private/tmp/nexus-exp-005-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק תצוגת סקירה",
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
    headers: {},
    body: {
      userInput: appUser,
      credentials: { password: "TestOnly123!" },
    },
  });

  await apiJson("/api/projects", {
    method: "POST",
    body: {
      id: projectId,
      name: "ניהול לידים לתצוגת סקירה",
      goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא. צריך להכין תצוגת סקירה בטוחה בלי פרסום חיצוני.",
      artifactExpectation: {
        projectType: "internal tool",
        deliverableLabel: "תצוגת סקירה לניהול לידים",
      },
    },
  });
}

async function dumpState(page, label) {
  return page.evaluate((stateLabel) => {
    const root = document.querySelector("[data-share-surface-contract='SURF-007']");
    const attr = (name) => root?.getAttribute(name) ?? null;
    const text = document.body.innerText || "";
    return {
      label: stateLabel,
      url: location.href,
      screen: document.body.dataset.appScreen || "",
      contract: attr("data-share-surface-contract"),
      agentTask: attr("data-share-agent-task"),
      agentStatus: attr("data-share-agent-status"),
      approvalStatus: attr("data-share-approval-status"),
      active: attr("data-share-active"),
      reviewLink: document.querySelector("[data-share-review-link]")?.textContent?.trim() ?? "",
      hasPrepareAction: Boolean(document.querySelector("[data-share-demo-action='prepare']")),
      hasApproveAction: Boolean(document.querySelector("[data-share-demo-action='approve']")),
      hasRevokeAction: Boolean(document.querySelector("[data-share-demo-action='revoke']")),
      hasFakePublicUrl: /https?:\/\//u.test(text),
      hasProviderLeak: /provider|debug|api key|secret/i.test(text),
      excerpt: text.slice(0, 1200),
    };
  }, label);
}

async function clickAction(page, action) {
  const selector = `[data-share-demo-action='${action}']`;
  await page.waitForSelector(selector, { timeout: 20_000 });
  await page.locator(selector).click();
}

function assertShareState(state, expected) {
  const failures = [];
  if (state.contract !== "SURF-007") failures.push("missing share contract");
  if (state.agentTask !== "SHARE-AGT-001") failures.push("missing share agent task anchor");
  if (state.agentStatus !== expected.agentStatus) failures.push(`expected status ${expected.agentStatus}, got ${state.agentStatus}`);
  if (state.approvalStatus !== expected.approvalStatus) failures.push(`expected approval ${expected.approvalStatus}, got ${state.approvalStatus}`);
  if (state.active !== expected.active) failures.push(`expected active ${expected.active}, got ${state.active}`);
  if (expected.noLink && state.reviewLink !== "קישור סקירה עדיין לא נוצר") failures.push(`expected no link, got ${state.reviewLink}`);
  if (expected.hasLocalLink && !state.reviewLink.includes(`/share?projectId=${projectId}`)) failures.push(`expected local review path, got ${state.reviewLink}`);
  if (state.hasFakePublicUrl) failures.push("found fake public url");
  if (state.hasProviderLeak) failures.push("found provider/debug leak");
  if (failures.length > 0) {
    throw new Error(`${state.label} failed EXP-005 live proof: ${failures.join("; ")}\n${JSON.stringify(state, null, 2)}`);
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

  await page.goto(`${baseUrl}/share?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-share-surface-contract='SURF-007']", { timeout: 20_000 });
  const initial = await dumpState(page, "initial");
  assertShareState(initial, {
    agentStatus: "not-prepared",
    approvalStatus: "not-required",
    active: "false",
    noLink: true,
  });
  await page.screenshot({ path: `${screenshotPrefix}-initial.png`, fullPage: true });

  await clickAction(page, "prepare");
  await page.waitForFunction(() => document.querySelector("[data-share-surface-contract='SURF-007']")?.getAttribute("data-share-agent-status") === "approval-required", { timeout: 20_000 });
  const afterPrepare = await dumpState(page, "after-prepare");
  assertShareState(afterPrepare, {
    agentStatus: "approval-required",
    approvalStatus: "waiting",
    active: "false",
    noLink: true,
  });
  await page.screenshot({ path: `${screenshotPrefix}-after-prepare.png`, fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelector("[data-share-surface-contract='SURF-007']")?.getAttribute("data-share-agent-status") === "approval-required", { timeout: 20_000 });
  const afterPrepareRefresh = await dumpState(page, "after-prepare-refresh");
  assertShareState(afterPrepareRefresh, {
    agentStatus: "approval-required",
    approvalStatus: "waiting",
    active: "false",
    noLink: true,
  });

  await clickAction(page, "approve");
  await page.waitForFunction(() => document.querySelector("[data-share-surface-contract='SURF-007']")?.getAttribute("data-share-agent-status") === "approved-snapshot", { timeout: 20_000 });
  const afterApprove = await dumpState(page, "after-approve");
  assertShareState(afterApprove, {
    agentStatus: "approved-snapshot",
    approvalStatus: "approved",
    active: "true",
    hasLocalLink: true,
  });
  await page.screenshot({ path: `${screenshotPrefix}-after-approve.png`, fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelector("[data-share-surface-contract='SURF-007']")?.getAttribute("data-share-agent-status") === "approved-snapshot", { timeout: 20_000 });
  const afterApproveRefresh = await dumpState(page, "after-approve-refresh");
  assertShareState(afterApproveRefresh, {
    agentStatus: "approved-snapshot",
    approvalStatus: "approved",
    active: "true",
    hasLocalLink: true,
  });

  await clickAction(page, "revoke");
  await page.waitForFunction(() => document.querySelector("[data-share-surface-contract='SURF-007']")?.getAttribute("data-share-agent-status") === "revoked", { timeout: 20_000 });
  const afterRevoke = await dumpState(page, "after-revoke");
  assertShareState(afterRevoke, {
    agentStatus: "revoked",
    approvalStatus: "revoked",
    active: "false",
    hasLocalLink: true,
  });
  await page.screenshot({ path: `${screenshotPrefix}-after-revoke.png`, fullPage: true });

  await browser.close();

  const restored = await apiJson(`/api/projects/${projectId}`);
  const project = restored.project ?? restored;
  const report = {
    taskId: "EXP-005",
    baseUrl,
    userId,
    projectId,
    reportPath,
    screenshots: {
      initial: `${screenshotPrefix}-initial.png`,
      afterPrepare: `${screenshotPrefix}-after-prepare.png`,
      afterApprove: `${screenshotPrefix}-after-approve.png`,
      afterRevoke: `${screenshotPrefix}-after-revoke.png`,
    },
    states: [initial, afterPrepare, afterPrepareRefresh, afterApprove, afterApproveRefresh, afterRevoke],
    projectTruth: {
      shareTaskId: project.shareDemoAgent?.taskId ?? null,
      status: project.shareDemoAgent?.status ?? null,
      approvalStatus: project.shareDemoAgent?.approvalStatus ?? null,
      active: project.shareDemoAgent?.active ?? null,
      shareLink: project.shareDemoAgent?.shareLink ?? null,
      providerBoundary: project.shareDemoAgent?.providerBoundary ?? null,
    },
    badEvents: events.filter((event) => !(event.kind === "console" && /404/.test(event.text ?? ""))),
  };

  if (
    report.projectTruth.shareTaskId !== "SHARE-AGT-001"
    || report.projectTruth.status !== "revoked"
    || report.projectTruth.approvalStatus !== "revoked"
    || report.projectTruth.active !== false
    || !String(report.projectTruth.shareLink).includes(`/share?projectId=${projectId}`)
    || !/אין פרסום חיצוני/u.test(report.projectTruth.providerBoundary ?? "")
    || report.badEvents.length > 0
  ) {
    throw new Error(`EXP-005 project truth failed: ${JSON.stringify(report, null, 2)}`);
  }

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
