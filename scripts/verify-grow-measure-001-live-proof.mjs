import assert from "node:assert/strict";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

const port = Number.parseInt(process.env.PORT ?? "4022", 10);
const baseUrl = `http://127.0.0.1:${port}`;
const now = Date.now();
const proofRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-grow-measure-"));
const reportPath = process.env.NEXUS_GROW_MEASURE_REPORT_PATH ?? path.join(proofRoot, "report.json");
const screenshotPath = process.env.NEXUS_GROW_MEASURE_SCREENSHOT_PATH ?? path.join(proofRoot, "growth-measurement.png");

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

async function main() {
  const projectService = new ProjectService({
    eventLogPath: path.join(proofRoot, "events.ndjson"),
  });
  const server = createServer(projectService, {
    runtimeId: "grow-measure-001-live-proof",
    healthStatus: { status: "healthy" },
    readinessStatus: { status: "ready" },
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

  try {
    const userId = `grow-measure-user-${now}`;
    const signup = await apiJson("/api/auth/signup", {
      method: "POST",
      expected: 201,
      body: {
        userInput: {
          userId,
          email: `${userId}@example.test`,
          displayName: "בודק מדידה",
        },
        credentials: { password: `secret-${now}` },
      },
    });
    const tokenBundle = signup.payload.authPayload.tokenBundle;
    const token = tokenBundle.accessToken;
    const projectId = `grow-measure-leads-${now}`;

    await apiJson("/api/projects", {
      method: "POST",
      token,
      expected: 201,
      body: {
        id: projectId,
        name: "ניהול לידים עם מדידה",
        goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
        state: {
          artifactExpectation: { projectType: "internal-tool" },
          runtimeSkeletonTruth: {
            runtimeSkeletonId: `runtime-skeleton:${projectId}:internal-tool`,
            title: "ניהול לידים",
            productClass: "internal-tool",
          },
          productDomainSkeleton: { productDomainSkeletonId: `product-domain:${projectId}:internal-tool` },
          productOwnedBackendSkeleton: {
            productOwnedBackendSkeletonId: `product-owned-backend:${projectId}:internal-tool`,
            productionBackend: false,
          },
        },
      },
    });

    const afterAgent = await apiJson(`/api/projects/${projectId}/growth-agent`, {
      method: "POST",
      token,
      expected: 200,
      body: { userInput: "תגדיר מדידה לדף נחיתה" },
    });
    assert.equal(afterAgent.payload.growthMeasurementTruth.taskId, "GROW-MEASURE-001");
    assert.equal(afterAgent.payload.growthMeasurementTruth.status, "measurement-not-available-yet");

    const unavailableProvider = await apiJson(`/api/projects/${projectId}/growth-measurement`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        record: {
          source: "google-analytics",
          sourceType: "provider",
          metric: "demo.viewed",
          value: 7,
          providerConnected: false,
          readScopeGranted: false,
        },
        externalAction: {
          actionType: "publish-campaign",
          draftOnly: false,
        },
      },
    });
    const unavailableRecord = unavailableProvider.payload.growthMeasurementTruth.records.at(-1);
    assert.equal(unavailableRecord.status, "rejected");
    assert.equal(unavailableProvider.payload.growthMeasurementTruth.externalActionGate.measurementAvailability, "measurement-not-available-yet");
    assert.equal(unavailableProvider.payload.growthMeasurementTruth.externalActionGate.noSuccessInference, true);

    await apiJson(`/api/projects/${projectId}/growth-measurement`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        record: {
          source: "nexus-internal-event",
          sourceType: "internal-event",
          growthPath: "landing-experiment",
          experimentId: "exp-1",
          metric: "landing.opened",
          value: 1,
        },
      },
    });
    const afterManual = await apiJson(`/api/projects/${projectId}/growth-measurement`, {
      method: "POST",
      token,
      expected: 200,
      body: {
        record: {
          source: "user-report",
          sourceType: "manual",
          growthPath: "manual-demo-call",
          experimentId: "exp-1",
          metric: "understood-value",
          value: 1,
        },
      },
    });
    const measurement = afterManual.payload.growthMeasurementTruth;
    assert.equal(measurement.status, "has-initial-signal");
    assert.deepEqual(measurement.records.slice(-2).map((record) => record.sourceType), ["internal-event", "manual"]);
    assert.equal(measurement.learningSummary.conclusionLanguage, "initial-signal");
    assert.equal(measurement.handoffs.productChangeOwner, "mutation-change-agent");
    assert.equal(measurement.handoffs.productChangeAllowedHere, false);

    const appUser = {
      userId,
      email: `${userId}@example.test`,
      displayName: "בודק מדידה",
      tokenBundle,
    };
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript((storedUser) => {
      localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
    }, appUser);
    await page.goto(`${baseUrl}/growth?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-growth-measurement-task='GROW-MEASURE-001']", { timeout: 20_000 });
    const domState = await page.evaluate(() => {
      const measurementRoot = document.querySelector("[data-growth-measurement-task='GROW-MEASURE-001']");
      const text = document.body.innerText || "";
      return {
        status: measurementRoot?.getAttribute("data-growth-measurement-status"),
        availability: measurementRoot?.getAttribute("data-growth-measurement-availability"),
        confidence: measurementRoot?.getAttribute("data-growth-measurement-confidence"),
        noSuccessInference: measurementRoot?.getAttribute("data-growth-measurement-no-success-inference"),
        hasInitialSignal: /סימן מדידה ראשוני|סימן ראשוני/u.test(text),
        hasManual: /manual|ידני|manual-measurement/u.test(text),
        hasProofClaim: /הוכחנו|זה עבד|worked|proven success/i.test(text),
      };
    });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await browser.close();

    assert.equal(domState.status, "has-initial-signal");
    assert.equal(domState.availability, "available");
    assert.equal(domState.confidence, "low");
    assert.equal(domState.hasInitialSignal, true);
    assert.equal(domState.hasProofClaim, false);

    const restored = await apiJson(`/api/projects/${projectId}`, { token, expected: 200 });
    assert.equal(restored.payload.growthMeasurementTruth.records.length, 3);

    const report = {
      taskId: "GROW-MEASURE-001",
      status: "passed",
      projectId,
      measurementStatus: measurement.status,
      sourceTypes: measurement.records.map((record) => record.sourceType),
      domState,
      screenshotPath,
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
