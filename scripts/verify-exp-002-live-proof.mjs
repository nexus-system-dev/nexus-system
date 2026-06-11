import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `exp002-user-${now}`;
const projectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `exp002-live-${now}`;
const reportPath = process.env.NEXUS_EXP002_REPORT_PATH ?? `/private/tmp/nexus-exp-002-${now}-report.json`;
const screenshotPrefix = process.env.NEXUS_EXP002_SCREENSHOT_PREFIX ?? `/private/tmp/nexus-exp-002-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק זרימת שינוי",
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
      name: "ניהול לידים עם זרימת שינוי",
      goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא. בלי וואטסאפ אמיתי ובלי פרסום.",
      artifactExpectation: {
        projectType: "internal tool",
        deliverableLabel: "רשימת לידים עם זרימת שינוי",
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
    const stepStatus = (stepId) => attr(`[data-canonical-mutation-flow-step="${stepId}"]`, "data-canonical-mutation-flow-step-status");
    const text = document.body.innerText || "";
    return {
      label: stateLabel,
      url: location.href,
      flowTask: attr("[data-canonical-mutation-flow-task]", "data-canonical-mutation-flow-task"),
      flowOwner: attr("[data-canonical-mutation-flow-task]", "data-canonical-mutation-flow-owner"),
      flowStatus: attr("[data-canonical-mutation-flow-task]", "data-canonical-mutation-flow-status"),
      flowRequiresApproval: attr("[data-canonical-mutation-flow-task]", "data-canonical-mutation-flow-requires-approval"),
      flowRequiresProductTruth: attr("[data-canonical-mutation-flow-task]", "data-canonical-mutation-flow-requires-product-truth"),
      flowHistoryCount: attr("[data-canonical-mutation-flow-task]", "data-canonical-mutation-flow-history-count"),
      requestStep: stepStatus("request"),
      decisionStep: stepStatus("decision"),
      approvalStep: stepStatus("approval"),
      applyStep: stepStatus("apply"),
      historyStep: stepStatus("history"),
      mutationTask: attr("[data-mutation-change-task]", "data-mutation-change-task"),
      mutationStatus: attr("[data-mutation-change-task]", "data-mutation-change-status"),
      buildAgentStatus: attr("[data-build-agent-turn-task]", "data-build-agent-turn-status"),
      hasFlowCopy: /זרימת שינוי/u.test(text),
      hasApprovalCopy: /המוצר לא משתנה עד שהמשתמש מאשר|ממתין לאישור/u.test(text),
      hasAppliedCopy: /השינוי עבר דרך החלטת שינוי|השינוי הוחל ונשמר/u.test(text),
      hasSilentDirectionChange: /הזמנות.*בוצע|שיניתי.*להזמנות/u.test(text),
      excerpt: text.slice(0, 1400),
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
  const afterSafeChange = await dumpState(page, "after-safe-change");
  assertState(afterSafeChange, {
    flowTask: "EXP-002",
    flowOwner: "MUT-001",
    flowStatus: "applied",
    flowRequiresApproval: "false",
    flowRequiresProductTruth: "true",
    requestStep: "done",
    decisionStep: "done",
    applyStep: "done",
    historyStep: "done",
    mutationTask: "MUT-001",
    mutationStatus: "applied",
  });
  if (!afterSafeChange.hasFlowCopy || !afterSafeChange.hasAppliedCopy) {
    throw new Error(`Safe mutation flow did not render applied copy: ${JSON.stringify(afterSafeChange, null, 2)}`);
  }
  await page.screenshot({ path: `${screenshotPrefix}-after-safe-change.png`, fullPage: true });

  await sendBuildRailMessage(page, "תשנה את זה להזמנות במקום לידים");
  await page.waitForSelector("[data-canonical-mutation-flow-task='EXP-002'][data-canonical-mutation-flow-status='pending-approval']", { timeout: 20_000 });
  const afterDirectionRequest = await dumpState(page, "after-direction-request");
  assertState(afterDirectionRequest, {
    flowTask: "EXP-002",
    flowOwner: "MUT-001",
    flowStatus: "pending-approval",
    flowRequiresApproval: "true",
    flowRequiresProductTruth: "true",
    requestStep: "done",
    decisionStep: "done",
    approvalStep: "waiting",
    applyStep: "blocked",
    historyStep: "done",
    mutationTask: "MUT-001",
    mutationStatus: "pending-approval",
  });
  if (!afterDirectionRequest.hasApprovalCopy || afterDirectionRequest.hasSilentDirectionChange) {
    throw new Error(`Direction mutation flow did not stay approval-bound: ${JSON.stringify(afterDirectionRequest, null, 2)}`);
  }
  await page.screenshot({ path: `${screenshotPrefix}-after-direction-request.png`, fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-canonical-mutation-flow-task='EXP-002'][data-canonical-mutation-flow-status='pending-approval']", { timeout: 20_000 });
  const afterRefresh = await dumpState(page, "after-refresh");
  assertState(afterRefresh, {
    flowTask: "EXP-002",
    flowStatus: "pending-approval",
    approvalStep: "waiting",
    applyStep: "blocked",
  });
  await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });

  await browser.close();

  const restored = await apiJson(`/api/projects/${projectId}`);
  const project = restored.project ?? restored;
  const report = {
    taskId: "EXP-002",
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
      flowTask: project.canonicalMutationFlow?.taskId ?? null,
      flowStatus: project.canonicalMutationFlow?.status ?? null,
      flowOwner: project.canonicalMutationFlow?.ownerTaskId ?? null,
      flowHistoryCount: project.canonicalMutationFlow?.historyCount ?? 0,
      mutationDecisionStatus: project.mutationChangeDecision?.status ?? null,
      mutationHistoryCount: project.mutationChangeHistory?.length ?? 0,
      buildMutationHistoryCount: project.buildMutationHistory?.length ?? 0,
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
    report.backendTruth.flowTask !== "EXP-002"
    || report.backendTruth.flowStatus !== "pending-approval"
    || report.backendTruth.flowOwner !== "MUT-001"
    || report.backendTruth.flowHistoryCount < 2
    || report.backendTruth.mutationDecisionStatus !== "pending-approval"
    || report.backendTruth.mutationHistoryCount < 2
    || report.backendTruth.buildMutationHistoryCount < 1
    || report.badEvents.length > 0
  ) {
    throw new Error(`EXP-002 live proof failed: ${JSON.stringify(report, null, 2)}`);
  }

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
