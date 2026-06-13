import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  applyPrivacyCenterAction,
  buildFirstReleasePrivacyCenter,
  createPrivacyExportPayload,
} from "../src/core/first-release-privacy-boundary.js";
import { ProjectService } from "../src/core/project-service.js";
import { createServer } from "../src/server.js";

function requestJsonWithBody(server, method, pathname, payload, options = {}) {
  return new Promise((resolve, reject) => {
    const request = new EventEmitter();
    request.method = method;
    request.url = pathname;
    request.headers = {
      "content-type": "application/json",
      ...(options.headers ?? {}),
    };
    request.socket = { remoteAddress: "127.0.0.1" };
    const body = JSON.stringify(payload ?? {});
    request.on = (event, callback) => {
      if (event === "data") callback(Buffer.from(body));
      if (event === "end") callback();
      return request;
    };

    const response = {
      statusCode: 200,
      headers: {},
      writeHead(statusCode, headers) {
        this.statusCode = statusCode;
        this.headers = headers;
      },
      end(responseBody) {
        try {
          resolve({
            statusCode: this.statusCode,
            body: responseBody ? JSON.parse(responseBody) : null,
            headers: this.headers,
          });
        } catch (error) {
          reject(error);
        }
      },
    };

    server.emit("request", request, response);
  });
}

function requestJson(server, pathname, options = {}) {
  return requestJsonWithBody(server, "GET", pathname, null, options);
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

function makeAccount(overrides = {}) {
  return {
    userIdentity: {
      userId: "privacy-user",
      email: "privacy@example.com",
      displayName: "Privacy User",
      verificationStatus: "verified",
    },
    tokenBundle: {
      accessToken: "secret-access-token",
      refreshToken: "secret-refresh-token",
    },
    credentialReference: "credential:privacy-user:password",
    notificationPreferences: { emailEnabled: true },
    accountActivityHistory: [],
    ...overrides,
  };
}

function makeProject(overrides = {}) {
  return {
    id: "privacy-project",
    userId: "privacy-user",
    name: "Privacy project",
    goal: "Build privacy proof",
    projectIntake: {
      uploadedFiles: [{ fileId: "file-1", name: "brief.pdf" }],
    },
    manualContext: {
      consentEntries: [
        {
          entryId: "consent-1",
          userId: "privacy-user",
          processingScope: "growth",
          scopeType: "project",
          scopeId: "privacy-project",
          status: "granted",
        },
      ],
      normalizedBillingEvents: [{ eventId: "billing-1", amount: 12 }],
    },
    context: {
      productOwnedBackendSkeleton: { entities: [{ name: "Lead" }] },
      growthMeasurementTruth: { status: "ready" },
    },
    ...overrides,
  };
}

test("PRIVACY-001 center inventories all release data classes and names blocked deletion boundaries", () => {
  const privacyCenter = buildFirstReleasePrivacyCenter({
    account: makeAccount(),
    projects: [makeProject()],
  });

  assert.equal(privacyCenter.taskId, "PRIVACY-001");
  assert.equal(privacyCenter.status, "ready");
  assert.deepEqual(
    privacyCenter.dataInventory.map((item) => item.key),
    [
      "account",
      "project",
      "history",
      "files",
      "generated-product-package",
      "provider-metadata",
      "billing",
      "logs",
      "analytics",
      "audit",
    ],
  );
  assert.equal(privacyCenter.rights.export.status, "available");
  assert.equal(privacyCenter.rights.deletion.status, "request-available-with-retention-review");
  assert.equal(
    privacyCenter.rights.deletion.blockedScopes.some((item) => item.key === "audit"),
    true,
  );
  assert.equal(privacyCenter.consentStates.some((item) => item.key === "provider-connection"), true);
});

test("PRIVACY-001 export redacts secrets and includes only supplied user-owned projects", () => {
  const exportPayload = createPrivacyExportPayload({
    account: makeAccount(),
    projects: [
      makeProject(),
      makeProject({ id: "other-project", userId: "privacy-user", name: "Other project" }),
    ],
    privacyCenter: buildFirstReleasePrivacyCenter({ account: makeAccount(), projects: [makeProject()] }),
  });
  const serialized = JSON.stringify(exportPayload);

  assert.equal(exportPayload.taskId, "PRIVACY-001");
  assert.equal(exportPayload.projects.length, 2);
  assert.equal(serialized.includes("secret-access-token"), false);
  assert.equal(serialized.includes("secret-refresh-token"), false);
  assert.equal(serialized.includes("credential:privacy-user:password"), false);
  assert.equal("tokenBundle" in exportPayload.account, false);
});

test("PRIVACY-001 actions record retention truth instead of fake deletion success", () => {
  const result = applyPrivacyCenterAction({
    account: makeAccount(),
    projects: [makeProject()],
    actionType: "request-project-deletion",
    payload: { projectId: "privacy-project" },
    actorUserId: "privacy-user",
  });

  assert.equal(result.status, "recorded");
  assert.equal(result.privacyRequest.status, "pending-retention-review");
  assert.equal(result.privacyRequest.retentionReason, "project-history-and-audit-review");
  assert.equal(result.projects[0].context.privacyDeletionRequest.privacyRequestId, result.privacyRequest.privacyRequestId);

  const blocked = applyPrivacyCenterAction({
    account: makeAccount(),
    projects: [makeProject()],
    actionType: "request-provider-deletion",
    actorUserId: "privacy-user",
  });
  assert.equal(blocked.status, "blocked");
  assert.equal(blocked.privacyRequest.retentionReason, "provider-side-deletion-requires-connected-provider-proof");
});

test("PRIVACY-001 server routes require auth, expose privacy center, export safe payload, and record actions", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-privacy-001-server-"));
  const service = new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
  const server = createServer(service, { runtimeId: "privacy-001-test" });

  const unauthorized = await requestJson(server, "/api/privacy-center");
  assert.equal(unauthorized.statusCode, 401);

  const signup = await requestJsonWithBody(server, "POST", "/api/auth/signup", {
    userInput: { userId: "privacy-server", email: "privacy-server@example.com", displayName: "Privacy Server" },
    credentials: { password: "secret" },
  });
  const token = signup.body.authPayload.tokenBundle.accessToken;
  const project = service.createProject({
    id: "privacy-owned-project",
    name: "Privacy owned project",
    goal: "Make privacy real",
    userId: "privacy-server",
  });
  assert.equal(project.id, "privacy-owned-project");

  const center = await requestJson(server, "/api/privacy-center", {
    headers: authHeader(token),
  });
  assert.equal(center.statusCode, 200);
  assert.equal(center.body.privacyCenter.taskId, "PRIVACY-001");
  assert.equal(center.body.privacyCenter.rights.export.status, "available");

  const exported = await requestJsonWithBody(server, "POST", "/api/privacy/export", {}, {
    headers: authHeader(token),
  });
  assert.equal(exported.statusCode, 200);
  assert.equal(exported.body.exportPayload.projects.length, 1);
  assert.equal(JSON.stringify(exported.body.exportPayload).includes(token), false);

  const action = await requestJsonWithBody(server, "POST", "/api/privacy/actions", {
    actionType: "request-project-deletion",
    payload: { projectId: "privacy-owned-project" },
  }, {
    headers: authHeader(token),
  });
  assert.equal(action.statusCode, 200);
  assert.equal(action.body.privacyRequest.status, "pending-retention-review");
  assert.equal(action.body.privacyCenter.rights.rightsRequest.status, "pending-retention-review");

  const updatedProject = service.getProject("privacy-owned-project");
  assert.equal(updatedProject.privacyCenter.taskId, "PRIVACY-001");
  assert.equal(updatedProject.state.privacyDeletionRequest.status, "pending-retention-review");
});
