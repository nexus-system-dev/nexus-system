import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `exp001-user-${now}`;
const projectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `exp001-live-${now}`;
const reportPath = process.env.NEXUS_EXP001_REPORT_PATH ?? `/private/tmp/nexus-exp-001-${now}-report.json`;
const screenshotPrefix = process.env.NEXUS_EXP001_SCREENSHOT_PREFIX ?? `/private/tmp/nexus-exp-001-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק עריכה ישירה",
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
      name: "ניהול לידים לעריכה ישירה",
      goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא. בלי וואטסאפ אמיתי ובלי פרסום.",
      artifactExpectation: {
        projectType: "internal tool",
        deliverableLabel: "רשימת לידים עם עריכה ישירה",
      },
    },
  });
}

async function dumpState(page, label) {
  return page.evaluate((stateLabel) => {
    const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) ?? null;
    const text = document.body.innerText || "";
    return {
      label: stateLabel,
      url: location.href,
      screen: document.body.dataset.appScreen || "",
      runtimeProjectId: attr("[data-runtime-project-id]", "data-runtime-project-id"),
      expTask: attr("[data-exp-selection-direct-edit-task]", "data-exp-selection-direct-edit-task"),
      selectedRecordId: attr("[data-exp-selection-direct-edit-task]", "data-exp-selected-record-id"),
      productOwnedBackendTask: attr("[data-exp-selection-direct-edit-task]", "data-exp-product-owned-backend-task"),
      hasDirectEdit: /עריכה ישירה/u.test(text),
      hasProductionBoundary: /זה עדיין לא פריסת ייצור/u.test(text),
      hasRawOperationText: /(^|\n)(record\.create|record\.assignOwner|record\.updateReminder)(\n|$)/u.test(text),
      excerpt: text.slice(0, 1200),
    };
  }, label);
}

async function clickVisibleDomainOperation(page, operationId) {
  const clicked = await page.evaluate((requestedOperationId) => {
    const button = Array.from(document.querySelectorAll("[data-product-domain-operation]"))
      .find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        const style = window.getComputedStyle(candidate);
        return candidate.getAttribute("data-product-domain-operation") === requestedOperationId
          && rect.width > 0
          && rect.height > 0
          && style.visibility !== "hidden"
          && style.display !== "none"
          && candidate.closest("[hidden]") === null;
      });
    if (!button) {
      return false;
    }
    button.click();
    return true;
  }, operationId);
  if (!clicked) {
    throw new Error(`No visible operation button found for ${operationId}`);
  }
}

function assertState(state, label) {
  if (
    state.runtimeProjectId !== projectId
    || state.expTask !== "EXP-001"
    || state.productOwnedBackendTask !== "PRODUCT-BACKEND-SKEL-002"
    || !state.hasDirectEdit
    || !state.hasProductionBoundary
    || state.hasRawOperationText
  ) {
    throw new Error(`${label} failed EXP-001 live proof: ${JSON.stringify(state, null, 2)}`);
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
  await page.waitForSelector("[data-exp-selection-direct-edit-task='EXP-001']", { timeout: 20_000 });
  const initial = await dumpState(page, "initial");
  assertState(initial, "initial");
  await page.screenshot({ path: `${screenshotPrefix}-initial.png`, fullPage: true });

  await clickVisibleDomainOperation(page, "record.select");
  await page.waitForTimeout(700);
  const afterSelect = await dumpState(page, "after-select");
  assertState(afterSelect, "after-select");
  await page.screenshot({ path: `${screenshotPrefix}-after-select.png`, fullPage: true });

  await clickVisibleDomainOperation(page, "record.assignOwner");
  await page.waitForFunction(() => /האחראי עודכן|שינוי אחרון|נשמר בפרויקט/u.test(document.body.innerText || ""), { timeout: 20_000 });
  const afterOwner = await dumpState(page, "after-owner");
  assertState(afterOwner, "after-owner");
  await page.screenshot({ path: `${screenshotPrefix}-after-owner.png`, fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-exp-selection-direct-edit-task='EXP-001']", { timeout: 20_000 });
  const afterRefresh = await dumpState(page, "after-refresh");
  assertState(afterRefresh, "after-refresh");
  await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });

  await browser.close();

  const restored = await apiJson(`/api/projects/${projectId}`);
  const project = restored.project ?? restored;
  const firstRecord = project.productDomainSkeleton?.state?.records?.find((record) => record.id === "rec-1");
  const report = {
    taskId: "EXP-001",
    baseUrl,
    userId,
    projectId,
    reportPath,
    screenshots: {
      initial: `${screenshotPrefix}-initial.png`,
      afterSelect: `${screenshotPrefix}-after-select.png`,
      afterOwner: `${screenshotPrefix}-after-owner.png`,
      afterRefresh: `${screenshotPrefix}-after-refresh.png`,
    },
    states: [initial, afterSelect, afterOwner, afterRefresh],
    backendTruth: {
      selectedRecordId: project.productDomainSkeleton?.state?.selectedRecordId ?? null,
      firstRecordOwner: firstRecord?.owner ?? null,
      productOwnedBackendTask: project.productOwnedBackendSkeleton?.taskId ?? null,
      productionBackend: project.productOwnedBackendSkeleton?.productionBackend ?? null,
      persistenceBoundary: project.productOwnedBackendSkeleton?.persistenceBoundary ?? null,
      mutationHistoryCount: project.productOwnedBackendSkeleton?.mutationHistory?.length ?? 0,
      buildMutationHistoryCount: project.buildMutationHistory?.length ?? 0,
    },
    badEvents: events.filter((event) => !(event.kind === "console" && /404/.test(event.text ?? ""))),
  };

  if (
    report.backendTruth.selectedRecordId !== "rec-1"
    || report.backendTruth.firstRecordOwner !== "נועה"
    || report.backendTruth.productOwnedBackendTask !== "PRODUCT-BACKEND-SKEL-002"
    || report.backendTruth.productionBackend !== false
    || report.backendTruth.mutationHistoryCount < 1
    || report.badEvents.length > 0
  ) {
    throw new Error(`EXP-001 backend truth failed: ${JSON.stringify(report, null, 2)}`);
  }

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
