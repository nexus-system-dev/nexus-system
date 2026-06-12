import assert from "node:assert/strict";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

const port = Number.parseInt(process.env.PORT ?? "4034", 10);
const baseUrl = `http://127.0.0.1:${port}`;
const now = Date.now();
const proofRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-file-001-"));
const reportPath = process.env.NEXUS_FILE_001_REPORT_PATH ?? path.join(proofRoot, "report.json");
const screenshotPath = process.env.NEXUS_FILE_001_SCREENSHOT_PATH ?? path.join(proofRoot, "files-boundary.png");

async function apiJson(pathname, { method = "GET", token = null, body = null, expected = null } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (expected && response.status !== expected) {
    throw new Error(`${method} ${pathname} expected ${expected}, got ${response.status}: ${text.slice(0, 800)}`);
  }
  if (!expected && !response.ok) {
    throw new Error(`${method} ${pathname} failed ${response.status}: ${text.slice(0, 800)}`);
  }
  return { status: response.status, payload };
}

async function signup() {
  const userId = `file-001-user-${now}`;
  const signupResult = await apiJson("/api/auth/signup", {
    method: "POST",
    expected: 201,
    body: {
      userInput: {
        userId,
        email: `${userId}@example.test`,
        displayName: "בודק קבצים",
      },
      credentials: { password: `secret-${now}` },
    },
  });
  const tokenBundle = signupResult.payload?.authPayload?.tokenBundle;
  assert.ok(tokenBundle?.accessToken, "signup must return an access token");
  return {
    token: tokenBundle.accessToken,
    appUser: {
      userId,
      email: `${userId}@example.test`,
      displayName: "בודק קבצים",
      tokenBundle,
      sessionState: signupResult.payload.authPayload.sessionState,
    },
  };
}

async function installSession(page, appUser, flowState = null) {
  await page.addInitScript(({ user, state }) => {
    window.localStorage.setItem("nexus.appUser", JSON.stringify(user));
    if (state) {
      window.localStorage.setItem("nexus.flowState", JSON.stringify(state));
    }
  }, { user: appUser, state: flowState });
}

async function readFilesBoundary(page) {
  return page.evaluate(() => {
    const boundary = document.querySelector("[data-file-intake-task='FILE-001']");
    const text = document.body.innerText || "";
    return {
      url: location.href,
      appScreen: document.body.dataset.appScreen ?? null,
      task: boundary?.getAttribute("data-file-intake-task") ?? null,
      status: boundary?.getAttribute("data-file-intake-status") ?? null,
      acceptedCount: boundary?.getAttribute("data-file-intake-accepted-count") ?? null,
      rejectedCount: boundary?.getAttribute("data-file-intake-rejected-count") ?? null,
      routing: boundary?.getAttribute("data-file-intake-routing") ?? null,
      retention: boundary?.getAttribute("data-file-intake-retention") ?? null,
      hasRequirementsFile: /requirements\.md/u.test(text),
      hasStorageTruth: /רשומת האחסון|אחסון/u.test(text),
      hasBoundaryCopy: /גבולות ההעלאה|גבול הקליטה/u.test(text),
      hasFakeFullBackendClaim: /backend מלא|אחסון ענן פעיל|סריקת וירוסים/u.test(text),
    };
  });
}

async function main() {
  const projectService = new ProjectService({
    eventLogPath: path.join(proofRoot, "events.ndjson"),
  });
  const server = createServer(projectService, {
    runtimeId: "file-001-live-proof",
    healthStatus: { status: "healthy" },
    readinessStatus: { status: "ready" },
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

  try {
    const { token, appUser } = await signup();
    const intake = await apiJson("/api/onboarding/intake", {
      method: "POST",
      expected: 200,
      body: {
        visionText: "שם הפרויקט: File Intake Live\nכלי פנימי לניהול לידים",
        uploadedFiles: [
          { name: "requirements.md", type: "text/markdown", content: "# Leads\nNeed owner and next action." },
          { name: "brand.png", type: "image/png", size: 120000 },
          { name: "installer.exe", type: "application/octet-stream", content: "no" },
        ],
        externalLinks: ["https://example.test/brief"],
      },
    });
    assert.equal(intake.payload.projectIntake.fileIntakeBoundary.taskId, "FILE-001");
    assert.equal(intake.payload.projectIntake.uploadedFiles.length, 2);
    assert.equal(intake.payload.projectIntake.fileIntakeBoundary.acceptedFiles.length, 2);
    assert.equal(intake.payload.projectIntake.fileIntakeBoundary.rejectedFiles.length, 1);
    assert.equal(intake.payload.projectIntake.fileIntakeBoundary.productUnderstandingRouting.status, "routed-to-project-understanding");

    const projectId = `file-001-live-${now}`;
    await apiJson("/api/projects", {
      method: "POST",
      token,
      expected: 201,
      body: {
        id: projectId,
        name: "File Intake Live",
        goal: "כלי פנימי לניהול לידים עם קבצי דרישות מוגבלים.",
        state: {
          intake: intake.payload.projectIntake,
          fileIntakeBoundary: intake.payload.projectIntake.fileIntakeBoundary,
          fileStorageRecord: {
            storageRecordId: `storage:${projectId}:intake`,
            projectId,
            storageScope: "intake",
            storageDriver: "project-intake-local-durable-state",
            attachments: intake.payload.projectIntake.fileIntakeBoundary.acceptedFiles.map((file, index) => ({
              storageItemId: `attachment:${projectId}:${index + 1}`,
              kind: "attachment",
              name: file.name,
              path: `attachments/${projectId}/${file.id}`,
              contentType: file.type,
              size: file.size,
              status: "stored",
            })),
            retentionPolicy: intake.payload.projectIntake.fileIntakeBoundary.policy.retentionPolicy,
            status: "ready",
            summary: {
              artifactCount: 0,
              attachmentCount: intake.payload.projectIntake.fileIntakeBoundary.acceptedFiles.length,
              totalStoredItems: intake.payload.projectIntake.fileIntakeBoundary.acceptedFiles.length,
            },
          },
        },
      },
    });
    const storedProject = await apiJson(`/api/projects/${projectId}`, {
      method: "GET",
      token,
      expected: 200,
    });
    assert.equal(storedProject.payload.fileIntakeBoundary.taskId, "FILE-001");
    assert.equal(storedProject.payload.fileStorageRecord.summary.attachmentCount, 2);

    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
    await installSession(page, appUser, {
      screen: "files",
      activeWorkspace: "files",
      currentProjectId: projectId,
      currentProjectSnapshot: {
        id: projectId,
        name: "File Intake Live",
      },
    });
    await page.goto(`${baseUrl}/files?projectId=${projectId}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForSelector("[data-file-intake-task='FILE-001']", { timeout: 10000 });
    const browserProof = await readFilesBoundary(page);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await browser.close();

    assert.equal(browserProof.task, "FILE-001");
    assert.equal(browserProof.status, "bounded-with-rejections");
    assert.equal(browserProof.acceptedCount, "2");
    assert.equal(browserProof.rejectedCount, "1");
    assert.equal(browserProof.routing, "routed-to-project-understanding");
    assert.equal(browserProof.hasRequirementsFile, true);
    assert.equal(browserProof.hasBoundaryCopy, true);
    assert.equal(browserProof.hasFakeFullBackendClaim, false);

    const report = {
      taskId: "FILE-001",
      baseUrl,
      projectId,
      proofRoot,
      reportPath,
      screenshotPath,
      intakeBoundary: intake.payload.projectIntake.fileIntakeBoundary,
      browserProof,
      verifiedAt: new Date().toISOString(),
    };
    await fsPromises.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
