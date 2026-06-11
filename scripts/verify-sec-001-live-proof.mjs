import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

const now = Date.now();
const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-sec-001-"));
const service = new ProjectService({
  eventLogPath: path.join(directory, "events.ndjson"),
});
const server = createServer(service, {
  runtimeId: "sec-001-live-proof",
  healthStatus: { status: "healthy", isHealthy: true },
  readinessStatus: { status: "ready", isReady: true },
});

function listen() {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve(server.address());
    });
  });
}

function close() {
  return new Promise((resolve) => server.close(resolve));
}

function requestJson({ origin, method = "GET", pathname, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const requestBody = body ? JSON.stringify(body) : null;
    const request = http.request(
      `${origin}${pathname}`,
      {
        method,
        headers: {
          ...(requestBody ? { "content-type": "application/json" } : {}),
          ...headers,
        },
      },
      (response) => {
        let raw = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          raw += chunk;
        });
        response.on("end", () => {
          try {
            resolve({
              statusCode: response.statusCode,
              body: raw ? JSON.parse(raw) : null,
            });
          } catch (error) {
            reject(error);
          }
        });
      },
    );
    request.on("error", reject);
    if (requestBody) {
      request.write(requestBody);
    }
    request.end();
  });
}

function requestSseHead({ origin, pathname, headers = {} }) {
  return new Promise((resolve, reject) => {
    const request = http.request(`${origin}${pathname}`, { method: "GET", headers }, (response) => {
      let raw = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        raw += chunk;
        if (raw.includes("event: live-state")) {
          request.destroy();
          resolve({
            statusCode: response.statusCode,
            hasLiveState: true,
            raw: raw.slice(0, 500),
          });
        }
      });
      response.on("end", () => {
        resolve({
          statusCode: response.statusCode,
          hasLiveState: raw.includes("event: live-state"),
          raw: raw.slice(0, 500),
        });
      });
    });
    request.on("error", (error) => {
      if (error.code === "ECONNRESET") {
        return;
      }
      reject(error);
    });
    request.setTimeout(5000, () => {
      request.destroy(new Error("SSE proof timed out"));
    });
    request.end();
  });
}

function assertProof(condition, message, failures) {
  if (!condition) {
    failures.push(message);
  }
}

const reportPath = path.join(os.tmpdir(), `nexus-sec-001-${now}-report.json`);
const failures = [];

try {
  const address = await listen();
  const origin = `http://${address.address}:${address.port}`;
  const ownerUserId = "sec-owner";
  const outsiderUserId = "sec-outsider";
  const projectId = `sec-live-${now}`;

  await requestJson({
    origin,
    method: "POST",
    pathname: "/api/auth/signup",
    body: {
      userInput: {
        userId: ownerUserId,
        email: "sec-owner@nexus.local",
        displayName: "Security Owner",
      },
      credentials: { password: "secret123" },
    },
  });
  await requestJson({
    origin,
    method: "POST",
    pathname: "/api/auth/signup",
    body: {
      userInput: {
        userId: outsiderUserId,
        email: "sec-outsider@nexus.local",
        displayName: "Security Outsider",
      },
      credentials: { password: "secret123" },
    },
  });

  const created = await requestJson({
    origin,
    method: "POST",
    pathname: "/api/projects",
    headers: { "x-user-id": ownerUserId },
    body: {
      id: projectId,
      name: "Security Live Project",
      goal: "Verify first-release security boundary",
    },
  });
  const unauthenticatedRead = await requestJson({
    origin,
    pathname: `/api/projects/${projectId}`,
  });
  const ownerRead = await requestJson({
    origin,
    pathname: `/api/projects/${projectId}`,
    headers: { "x-user-id": ownerUserId },
  });
  const outsiderRead = await requestJson({
    origin,
    pathname: `/api/projects/${projectId}`,
    headers: { "x-user-id": outsiderUserId },
  });
  const spoofedPrivilegedAction = await requestJson({
    origin,
    method: "POST",
    pathname: `/api/projects/${projectId}/proposal-edits`,
    headers: {
      "x-user-id": outsiderUserId,
      "x-actor-type": "owner",
    },
    body: {
      userEditInput: {
        acceptedSections: ["proposal"],
      },
    },
  });
  const workspaceMismatch = await requestJson({
    origin,
    pathname: `/api/projects/${projectId}`,
    headers: {
      "x-user-id": ownerUserId,
      "x-workspace-id": "workspace-other",
    },
  });
  const liveEvents = await requestSseHead({
    origin,
    pathname: `/api/projects/${projectId}/live-events`,
    headers: { "x-user-id": ownerUserId },
  });

  assertProof(created.statusCode === 201, "expected project creation to succeed", failures);
  assertProof(
    typeof created.body?.state?.roleCapabilityMatrix?.roleCapabilityMatrixId === "string",
    "expected new project to include role capability matrix",
    failures,
  );
  assertProof(
    typeof created.body?.state?.tenantIsolationSchema?.tenantIsolationSchemaId === "string",
    "expected new project to include tenant isolation schema",
    failures,
  );
  assertProof(unauthenticatedRead.statusCode === 401, "expected unauthenticated read to return 401", failures);
  assertProof(ownerRead.statusCode === 200, "expected owner read to return 200", failures);
  assertProof(outsiderRead.statusCode === 404, "expected outsider read to hide project existence", failures);
  assertProof(spoofedPrivilegedAction.statusCode === 403, "expected spoofed privileged action to return 403", failures);
  assertProof(
    spoofedPrivilegedAction.body?.projectAuthorizationDecision?.actorType === "viewer",
    "expected spoofed actor type to resolve as viewer",
    failures,
  );
  assertProof(workspaceMismatch.statusCode === 403, "expected workspace mismatch to return 403", failures);
  assertProof(liveEvents.statusCode === 200 && liveEvents.hasLiveState, "expected live-events to stream owner project state", failures);

  const report = {
    taskId: "SEC-001",
    generatedAt: new Date().toISOString(),
    origin,
    projectId,
    ownerUserId,
    outsiderUserId,
    checks: {
      createdStatus: created.statusCode,
      hasRoleCapabilityMatrix: typeof created.body?.state?.roleCapabilityMatrix?.roleCapabilityMatrixId === "string",
      hasTenantIsolationSchema: typeof created.body?.state?.tenantIsolationSchema?.tenantIsolationSchemaId === "string",
      unauthenticatedReadStatus: unauthenticatedRead.statusCode,
      ownerReadStatus: ownerRead.statusCode,
      outsiderReadStatus: outsiderRead.statusCode,
      spoofedPrivilegedActionStatus: spoofedPrivilegedAction.statusCode,
      spoofedActorType: spoofedPrivilegedAction.body?.projectAuthorizationDecision?.actorType ?? null,
      workspaceMismatchStatus: workspaceMismatch.statusCode,
      liveEventsStatus: liveEvents.statusCode,
      liveEventsHasState: liveEvents.hasLiveState,
      reportPath,
    },
    failures,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  if (failures.length > 0) {
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
} finally {
  await close();
}
