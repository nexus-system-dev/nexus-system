// BUILD-SPEECH-TRUTH-001 — live browser proof.
//
// Proves on a live Chrome session that:
// 1. an arbitrary, untrained free-text field request ("תוסיף לכל ליד שדה תקציב משוער")
//    creates a real visible/domain change — not just a confident chat reply
// 2. an unsupported request (screen-add) returns a truthful not-applied state
//    and the canvas does not change
// 3. an external-action request (WhatsApp/publish/payment) is bounded, never "done"
// 4. refresh preserves the same truthful artifact/history state: the applied field
//    survives, and no fake success claim survives in the transcript
//
// Run: NEXUS_BASE_URL=http://127.0.0.1:4015 node scripts/verify-build-speech-truth-001-live-proof.mjs

import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `speechtruth-user-${now}`;
const projectId = process.env.NEXUS_SPEECH_PROJECT_ID ?? `speechtruth-${now}`;
const reportPath = process.env.NEXUS_SPEECH_REPORT_PATH ?? `/private/tmp/nexus-build-speech-truth-001-${now}-report.json`;
const screenshotPrefix = process.env.NEXUS_SPEECH_SCREENSHOT_PREFIX ?? `/private/tmp/nexus-build-speech-truth-001-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק אמת דיבור",
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

async function sendBuildRailMessage(page, message) {
  const input = page.locator("[data-agent-rail-input]").last();
  await input.fill(message);
  await page.locator("[data-agent-rail-send]").last().click();
}

async function dumpSpeechState(page, label) {
  return page.evaluate((stateLabel) => {
    const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) ?? null;
    const text = document.body.innerText || "";
    return {
      label: stateLabel,
      url: location.href,
      speechTask: attr("[data-build-speech-truth-task]", "data-build-speech-truth-task"),
      speechState: attr("[data-build-speech-truth-task]", "data-build-speech-state"),
      requestClass: attr("[data-build-speech-truth-task]", "data-build-speech-request-class"),
      replyRewritten: attr("[data-build-speech-truth-task]", "data-build-speech-reply-rewritten"),
      mayClaimChanged: attr("[data-build-speech-truth-task]", "data-build-speech-may-claim-changed"),
      seesBudgetField: /תקציב משוער/u.test(text),
      seesMonthlyReportsScreen: /דוחות חודשיים/u.test(text) && /מסך דוחות/u.test(text),
      fakeSuccess: /מעדכן ומייצר|הוספתי את המסך|חיברתי וואטסאפ|פרסמתי את/u.test(text),
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
      name: "ניהול לידים אמת דיבור",
      goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא.",
      artifactExpectation: {
        projectType: "internal tool",
        deliverableLabel: "רשימת לידים עם אחריות",
      },
    },
  });

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

  await page.goto(`${baseUrl}/loop?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-agent-rail-input]", { timeout: 20_000 });

  // 1. Arbitrary untrained field request must create a real visible change.
  await sendBuildRailMessage(page, "תוסיף לכל ליד שדה תקציב משוער");
  await page.waitForSelector("[data-build-speech-truth-task='BUILD-SPEECH-TRUTH-001'][data-build-speech-state='applied']", { timeout: 20_000 });
  const appliedState = await dumpSpeechState(page, "arbitrary-field-applied");
  assertState(appliedState, {
    speechTask: "BUILD-SPEECH-TRUTH-001",
    speechState: "applied",
    requestClass: "field-add",
    mayClaimChanged: "true",
    seesBudgetField: true,
  });
  await page.screenshot({ path: `${screenshotPrefix}-applied.png`, fullPage: true });

  // 2. Unsupported screen request must be truthfully not-applied with no canvas change.
  await sendBuildRailMessage(page, "תוסיף מסך של דוחות חודשיים עם גרפים");
  await page.waitForSelector("[data-build-speech-truth-task='BUILD-SPEECH-TRUTH-001'][data-build-speech-state='unsupported-not-yet']", { timeout: 20_000 });
  const unsupportedState = await dumpSpeechState(page, "unsupported-screen-add");
  assertState(unsupportedState, {
    speechState: "unsupported-not-yet",
    requestClass: "screen-add",
    mayClaimChanged: "false",
    seesMonthlyReportsScreen: false,
    fakeSuccess: false,
  });
  await page.screenshot({ path: `${screenshotPrefix}-unsupported.png`, fullPage: true });

  // 3. External action must be bounded, never claimed as done.
  await sendBuildRailMessage(page, "תחבר לי וואטסאפ אמיתי ותפרסם את המוצר");
  await page.waitForSelector("[data-build-speech-truth-task='BUILD-SPEECH-TRUTH-001'][data-build-speech-state='pending-approval']", { timeout: 20_000 });
  const externalState = await dumpSpeechState(page, "external-action-bounded");
  assertState(externalState, {
    speechState: "pending-approval",
    mayClaimChanged: "false",
    fakeSuccess: false,
  });
  await page.screenshot({ path: `${screenshotPrefix}-external-bounded.png`, fullPage: true });

  // 4. Refresh must preserve the same truthful artifact/history state.
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-build-speech-truth-task='BUILD-SPEECH-TRUTH-001']", { timeout: 20_000 });
  const afterRefresh = await dumpSpeechState(page, "after-refresh");
  assertState(afterRefresh, {
    speechTask: "BUILD-SPEECH-TRUTH-001",
    seesBudgetField: true,
    seesMonthlyReportsScreen: false,
    fakeSuccess: false,
  });
  await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });

  const badEvents = events.filter((event) => !/live-events/.test(event.url ?? event.text ?? ""));
  const report = {
    taskId: "BUILD-SPEECH-TRUTH-001",
    baseUrl,
    projectId,
    appliedState,
    unsupportedState,
    externalState,
    afterRefresh,
    badEvents,
    createdAt: new Date().toISOString(),
  };
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`BUILD-SPEECH-TRUTH-001 live proof passed. Report: ${reportPath}`);
  console.log(`Screenshots: ${screenshotPrefix}-applied.png, ${screenshotPrefix}-unsupported.png, ${screenshotPrefix}-external-bounded.png, ${screenshotPrefix}-after-refresh.png`);
  if (badEvents.length > 0) {
    console.log(`Warning: ${badEvents.length} non-live-events console/network issues recorded in report.`);
  }
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
