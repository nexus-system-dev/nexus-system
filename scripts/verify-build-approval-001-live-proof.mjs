import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `buildapproval-user-${now}`;
const rejectProjectId = process.env.NEXUS_REJECT_PROJECT_ID ?? `buildapproval-reject-${now}`;
const approveProjectId = process.env.NEXUS_APPROVE_PROJECT_ID ?? `buildapproval-approve-${now}`;
const reportPath = process.env.NEXUS_BUILD_APPROVAL_REPORT_PATH ?? `/private/tmp/nexus-build-approval-001-${now}-report.json`;
const screenshotPrefix = process.env.NEXUS_BUILD_APPROVAL_SCREENSHOT_PREFIX ?? `/private/tmp/nexus-build-approval-001-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק אישור שינוי",
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

async function createProject(projectId, name) {
  await apiJson("/api/projects", {
    method: "POST",
    body: {
      id: projectId,
      name,
      goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא. בלי וואטסאפ אמיתי ובלי פרסום.",
      artifactExpectation: {
        projectType: "internal tool",
        deliverableLabel: name,
      },
    },
  });
}

async function sendBuildRailMessage(page, message) {
  const input = page.locator("[data-agent-rail-input]").last();
  await input.fill(message);
  await page.locator("[data-agent-rail-send]").last().click();
}

async function dumpApprovalState(page, label) {
  return page.evaluate((stateLabel) => {
    const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) ?? null;
    const text = document.body.innerText || "";
    return {
      label: stateLabel,
      url: location.href,
      approvalTask: attr("[data-build-approval-task]", "data-build-approval-task"),
      approvalStatus: attr("[data-build-approval-task]", "data-build-approval-status"),
      decisionStatus: attr("[data-build-approval-task]", "data-build-approval-decision-status"),
      backedByMutation: attr("[data-build-approval-task]", "data-build-approval-backed-by-mutation"),
      currentTruthUnchanged: attr("[data-build-approval-task]", "data-build-approval-current-truth-unchanged"),
      flowStatus: attr("[data-canonical-mutation-flow-task]", "data-canonical-mutation-flow-status"),
      mutationStatus: attr("[data-mutation-change-task]", "data-mutation-change-status"),
      hasApprove: !!document.querySelector("[data-build-approval-action='approve']"),
      hasReject: !!document.querySelector("[data-build-approval-action='reject']"),
      hasCancel: !!document.querySelector("[data-build-approval-action='cancel']"),
      seesOrders: /ניהול הזמנות|הזמנה 1001|מקור הזמנה/u.test(text),
      seesLeads: /ניהול לידים|לידים/u.test(text),
      fakeSuccess: /שיניתי.*להזמנות|בוצע.*הזמנות/u.test(text),
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

async function runProjectBranch({ page, projectId, action, screenshotLabel }) {
  await page.goto(`${baseUrl}/loop?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-agent-rail-input]", { timeout: 20_000 });
  await sendBuildRailMessage(page, "תשנה את זה להזמנות במקום לידים");
  await page.waitForSelector("[data-build-approval-task='BUILD-APPROVAL-001'][data-build-approval-decision-status='pending']", { timeout: 20_000 });
  const pending = await dumpApprovalState(page, `${screenshotLabel}-pending`);
  assertState(pending, {
    approvalTask: "BUILD-APPROVAL-001",
    approvalStatus: "pending-approval",
    decisionStatus: "pending",
    backedByMutation: "true",
    currentTruthUnchanged: "true",
    flowStatus: "pending-approval",
    mutationStatus: "pending-approval",
    hasApprove: true,
    hasReject: true,
    hasCancel: true,
  });
  if (pending.fakeSuccess) {
    throw new Error(`Approval pending state faked success: ${JSON.stringify(pending, null, 2)}`);
  }
  await page.screenshot({ path: `${screenshotPrefix}-${screenshotLabel}-pending.png`, fullPage: true });

  await page.locator(`[data-build-approval-action='${action}']`).click();
  await page.waitForSelector(`[data-build-approval-task='BUILD-APPROVAL-001'][data-build-approval-decision-status='${action === "approve" ? "approved" : action === "reject" ? "rejected" : "canceled"}']`, { timeout: 20_000 });
  const decided = await dumpApprovalState(page, `${screenshotLabel}-${action}`);
  await page.screenshot({ path: `${screenshotPrefix}-${screenshotLabel}-${action}.png`, fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(`[data-build-approval-task='BUILD-APPROVAL-001'][data-build-approval-decision-status='${decided.decisionStatus}']`, { timeout: 20_000 });
  const afterRefresh = await dumpApprovalState(page, `${screenshotLabel}-${action}-after-refresh`);
  await page.screenshot({ path: `${screenshotPrefix}-${screenshotLabel}-${action}-after-refresh.png`, fullPage: true });

  return { pending, decided, afterRefresh };
}

async function main() {
  await apiJson("/api/auth/signup", {
    method: "POST",
    body: {
      userInput: appUser,
      credentials: { password: "TestOnly123!" },
    },
  });
  await createProject(rejectProjectId, "ניהול לידים דחיית שינוי");
  await createProject(approveProjectId, "ניהול לידים אישור שינוי");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    slowMo: Number(process.env.NEXUS_LIVE_SLOW_MO ?? 100),
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });
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

  const rejectBranch = await runProjectBranch({
    page,
    projectId: rejectProjectId,
    action: "reject",
    screenshotLabel: "reject",
  });
  assertState(rejectBranch.decided, {
    decisionStatus: "rejected",
    currentTruthUnchanged: "true",
    flowStatus: "rejected",
  });
  if (!rejectBranch.decided.seesLeads) {
    throw new Error(`Reject branch changed visible product truth: ${JSON.stringify(rejectBranch.decided, null, 2)}`);
  }

  const approveBranch = await runProjectBranch({
    page,
    projectId: approveProjectId,
    action: "approve",
    screenshotLabel: "approve",
  });
  assertState(approveBranch.decided, {
    decisionStatus: "approved",
    currentTruthUnchanged: "false",
    flowStatus: "applied",
  });
  if (!approveBranch.decided.seesOrders || approveBranch.decided.fakeSuccess) {
    throw new Error(`Approve branch did not apply product direction truthfully: ${JSON.stringify(approveBranch.decided, null, 2)}`);
  }

  await browser.close();

  const rejectedProject = await apiJson(`/api/projects/${rejectProjectId}`);
  const approvedProject = await apiJson(`/api/projects/${approveProjectId}`);
  const rejected = rejectedProject.project ?? rejectedProject;
  const approved = approvedProject.project ?? approvedProject;
  const badEvents = events.filter((event) => {
    if (event.status === 404) return false;
    if (event.kind === "console" && /404|favicon|not found/i.test(event.text ?? "")) return false;
    return true;
  });
  const report = {
    taskId: "BUILD-APPROVAL-001",
    baseUrl,
    userId,
    rejectProjectId,
    approveProjectId,
    reportPath,
    screenshots: {
      rejectPending: `${screenshotPrefix}-reject-pending.png`,
      rejectDecision: `${screenshotPrefix}-reject-reject.png`,
      rejectRefresh: `${screenshotPrefix}-reject-reject-after-refresh.png`,
      approvePending: `${screenshotPrefix}-approve-pending.png`,
      approveDecision: `${screenshotPrefix}-approve-approve.png`,
      approveRefresh: `${screenshotPrefix}-approve-approve-after-refresh.png`,
    },
    states: [rejectBranch.pending, rejectBranch.decided, rejectBranch.afterRefresh, approveBranch.pending, approveBranch.decided, approveBranch.afterRefresh],
    backendTruth: {
      rejectedDecision: rejected.buildApprovalFlow?.decisionStatus ?? null,
      rejectedGoal: rejected.goal,
      rejectedFlowStatus: rejected.canonicalMutationFlow?.status ?? null,
      approvedDecision: approved.buildApprovalFlow?.decisionStatus ?? null,
      approvedGoal: approved.goal,
      approvedFlowStatus: approved.canonicalMutationFlow?.status ?? null,
      approvedDomainModel: approved.productDomainSkeleton?.models?.[0]?.name ?? null,
      approvedRuntimeTitle: approved.runtimeSkeletonTruth?.title ?? null,
    },
    badEvents,
  };

  if (
    report.backendTruth.rejectedDecision !== "rejected"
    || /הזמנות/u.test(report.backendTruth.rejectedGoal)
    || report.backendTruth.rejectedFlowStatus !== "rejected"
    || report.backendTruth.approvedDecision !== "approved"
    || !/הזמנות/u.test(report.backendTruth.approvedGoal)
    || report.backendTruth.approvedFlowStatus !== "applied"
    || report.backendTruth.approvedDomainModel !== "הזמנה"
    || report.backendTruth.approvedRuntimeTitle !== "ניהול הזמנות"
    || report.badEvents.length > 0
  ) {
    throw new Error(`BUILD-APPROVAL-001 live proof failed: ${JSON.stringify(report, null, 2)}`);
  }

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
