import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createApplicationServerBootstrap } from "../src/core/application-server-bootstrap.js";

test("application server bootstrap returns canonical runtime without seeded demo projects by default", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-runtime-"));
  const dataDir = path.join(rootDir, "data");
  const publicDir = path.join(rootDir, "web");
  fs.mkdirSync(publicDir, { recursive: true });

  const { applicationRuntime } = createApplicationServerBootstrap({
    runtimeConfig: {
      rootDir,
      dataDir,
      publicDir,
      port: 4010,
    },
    createServer: (projectService) => ({ projectService, kind: "http-server" }),
  });

  assert.equal(applicationRuntime.status, "ready");
  assert.equal(applicationRuntime.host, "127.0.0.1");
  assert.equal(applicationRuntime.port, 4010);
  assert.equal(fs.existsSync(dataDir), true);
  assert.equal(applicationRuntime.server.kind, "http-server");
  assert.equal(applicationRuntime.apiRuntime.status, "ready");
  assert.equal(applicationRuntime.apiRuntime.totalRoutes >= 10, true);
  assert.equal(applicationRuntime.authenticatedRequest.authStatus, "authenticated");
  assert.equal(applicationRuntime.validatedRequest.isValid, true);
  assert.equal(applicationRuntime.errorEnvelope.status, "ok");
  assert.equal(applicationRuntime.workerRuntime.status, "ready");
  assert.equal(applicationRuntime.jobState.status, "queued");
  assert.equal(applicationRuntime.healthStatus.status, "healthy");
  assert.equal(applicationRuntime.healthStatus.summary.totalDependencies >= 4, true);
  assert.equal(applicationRuntime.readinessStatus.status, "ready");
  assert.equal(applicationRuntime.readinessStatus.isReady, true);
  assert.equal(applicationRuntime.startupSteps.some((step) => step.step === "seed-demo-projects"), false);
  assert.equal(applicationRuntime.projectService.getProject("giftwallet"), null);
});

test("application server bootstrap can explicitly skip demo seeding", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-runtime-"));

  const { applicationRuntime } = createApplicationServerBootstrap({
    runtimeConfig: {
      rootDir,
      seedDemoProjects: false,
    },
    createServer: () => ({ kind: "http-server" }),
  });

  assert.equal(applicationRuntime.startupSteps.some((step) => step.step === "seed-demo-projects"), false);
  assert.equal(applicationRuntime.startupSteps.some((step) => step.step === "create-api-runtime"), true);
  assert.equal(applicationRuntime.startupSteps.some((step) => step.step === "create-auth-middleware"), true);
  assert.equal(applicationRuntime.startupSteps.some((step) => step.step === "create-request-validation-layer"), true);
  assert.equal(applicationRuntime.startupSteps.some((step) => step.step === "create-background-worker-runtime"), true);
  assert.equal(applicationRuntime.projectService.getProject("giftwallet"), null);
});

test("application server bootstrap can opt in to demo seeding", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-runtime-"));

  const { applicationRuntime } = createApplicationServerBootstrap({
    runtimeConfig: {
      rootDir,
      seedDemoProjects: true,
    },
    createServer: () => ({ kind: "http-server" }),
  });

  assert.equal(applicationRuntime.startupSteps.some((step) => step.step === "seed-demo-projects"), true);
  assert.equal(typeof applicationRuntime.projectService.getProject("giftwallet")?.id, "string");
  assert.equal(typeof applicationRuntime.projectService.getProject("royal-casino")?.id, "string");
});
