import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

const report = {
  taskId: "ACCT-001",
  status: "pending",
  failures: [],
  evidence: {},
};

function fail(message, details = null) {
  report.failures.push({ message, details });
}

function assertCondition(condition, message, details = null) {
  if (!condition) {
    fail(message, details);
  }
}

async function requestJson(baseUrl, pathname, { method = "GET", body = null, userId = null } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(userId ? { "x-user-id": userId } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  return { statusCode: response.status, payload };
}

async function main() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-acct-001-live-"));
  const service = new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
  const server = createServer(service, { runtimeId: "acct-001-live-proof" });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;
    const userId = `acct-live-${Date.now()}`;

    const signup = await requestJson(baseUrl, "/api/auth/signup", {
      method: "POST",
      body: {
        userInput: {
          userId,
          email: `${userId}@example.com`,
          displayName: "Account Live User",
        },
        credentials: { password: "secret" },
      },
    });
    assertCondition(signup.statusCode === 201, "signup should create a local account", signup);

    const settings = await requestJson(baseUrl, "/api/settings-profile", { userId });
    const boundary = settings.payload?.settingsProfileSurface?.accountBoundary;
    assertCondition(settings.statusCode === 200, "settings profile should load for signed-in user", settings);
    assertCondition(boundary?.taskId === "ACCT-001", "settings profile should include ACCT-001 account boundary", boundary);
    assertCondition(boundary?.linkedTruth?.privacy?.ownerTask === "PRIVACY-001", "account boundary should link privacy truth", boundary?.linkedTruth);
    assertCondition(boundary?.linkedTruth?.team?.ownerTask === "EXP-009", "account boundary should link team truth", boundary?.linkedTruth);

    const update = await requestJson(baseUrl, "/api/settings-profile", {
      method: "PUT",
      userId,
      body: {
        profileInput: {
          displayName: "Updated Account User",
          email: `updated-${userId}@example.com`,
        },
      },
    });
    assertCondition(update.statusCode === 200, "profile update should succeed", update);
    assertCondition(
      update.payload?.settingsProfileSurface?.accountBoundary?.accountActivityHistory?.at(-1)?.eventType === "profile-updated",
      "profile update should record account activity",
      update.payload?.settingsProfileSurface?.accountBoundary,
    );

    const deletion = await requestJson(baseUrl, "/api/account/actions", {
      method: "POST",
      userId,
      body: { actionType: "request-account-deletion" },
    });
    assertCondition(deletion.statusCode === 200, "deletion request should be recorded without claiming full erasure", deletion);
    assertCondition(deletion.payload?.status === "pending", "deletion request should remain pending for privacy execution", deletion.payload);
    assertCondition(
      deletion.payload?.accountEvent?.metadata?.privacyOwnerTask === "PRIVACY-001",
      "deletion request should route full deletion to privacy task",
      deletion.payload?.accountEvent,
    );

    const logoutAll = await requestJson(baseUrl, "/api/account/actions", {
      method: "POST",
      userId,
      body: { actionType: "logout-all" },
    });
    assertCondition(logoutAll.statusCode === 200, "logout-all should succeed", logoutAll);
    assertCondition(
      logoutAll.payload?.settingsProfileSurface?.accountBoundary?.activeSession?.status === "revoked",
      "logout-all should revoke local session truth",
      logoutAll.payload?.settingsProfileSurface?.accountBoundary,
    );

    const browser = await chromium.launch({
      channel: "chrome",
      headless: true,
    });
    try {
      const page = await browser.newPage({ viewport: { width: 1365, height: 820 } });
      await page.addInitScript((appUser) => {
        localStorage.setItem("nexus.appUser", JSON.stringify(appUser));
      }, {
        userId,
        email: `updated-${userId}@example.com`,
        displayName: "Updated Account User",
      });
      await page.goto(`${baseUrl}/settings`, { waitUntil: "domcontentloaded", timeout: 20_000 });
      await page.waitForSelector("[data-settings-tab='account']", { timeout: 20_000 });
      await page.click("[data-settings-tab='account']");
      await page.waitForSelector("#settings-delete-account-button:visible", { timeout: 20_000 });
      const visibleSettings = await page.evaluate(() => ({
        screen: document.body.dataset.appScreen || "",
        text: document.body.innerText || "",
        hasDeleteButton: Boolean(document.querySelector("#settings-delete-account-button")),
        hasLogoutAllButton: Boolean(document.querySelector("#settings-logout-all-button")),
        hasInternalTaskLabels: /ACCT-001|PRIVACY-001|PROV-001|BILLING-001|SSO-001/u.test(document.body.innerText || ""),
      }));
      assertCondition(visibleSettings.screen === "settings", "browser should render settings route", visibleSettings);
      assertCondition(/גבול חשבון/u.test(visibleSettings.text), "settings screen should show account boundary copy", visibleSettings);
      assertCondition(visibleSettings.hasDeleteButton, "settings screen should expose deletion request action", visibleSettings);
      assertCondition(visibleSettings.hasLogoutAllButton, "settings screen should expose logout-all action", visibleSettings);
      assertCondition(!visibleSettings.hasInternalTaskLabels, "settings screen should hide internal task labels", visibleSettings);
      report.evidence.visibleSettings = {
        screen: visibleSettings.screen,
        hasDeleteButton: visibleSettings.hasDeleteButton,
        hasLogoutAllButton: visibleSettings.hasLogoutAllButton,
      };
    } finally {
      await browser.close();
    }

    report.evidence = {
      ...report.evidence,
      baseUrl,
      userId,
      accountBoundaryStatus: boundary?.status,
      finalSessionStatus: logoutAll.payload?.settingsProfileSurface?.accountBoundary?.activeSession?.status,
      activityCount: logoutAll.payload?.settingsProfileSurface?.accountBoundary?.accountActivityHistory?.length ?? 0,
    };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  report.status = report.failures.length === 0 ? "passed" : "failed";
  const reportPath = path.join(os.tmpdir(), `nexus-acct-001-${Date.now()}-report.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  report.reportPath = reportPath;

  console.log(JSON.stringify({
    taskId: report.taskId,
    status: report.status,
    failures: report.failures,
    reportPath,
  }, null, 2));

  if (report.failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
