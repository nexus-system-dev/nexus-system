import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

function createHarness() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-acct-001-server-"));
  const service = new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
  return {
    service,
    server: createServer(service, { runtimeId: "acct-001-test" }),
  };
}

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

test("ACCT-001 server settings route returns account boundary and executes bounded account actions", async () => {
  const { server } = createHarness();

  const signup = await requestJsonWithBody(server, "POST", "/api/auth/signup", {
    userInput: { userId: "acct-server", email: "server@example.com", displayName: "Server User" },
    credentials: { password: "secret" },
  });
  const token = signup.body.authPayload.tokenBundle.accessToken;

  const settings = await requestJson(server, "/api/settings-profile", {
    headers: authHeader(token),
  });
  assert.equal(settings.statusCode, 200);
  assert.equal(settings.body.settingsProfileSurface.accountBoundary.taskId, "ACCT-001");
  assert.equal(settings.body.settingsProfileSurface.accountBoundary.linkedTruth.team.ownerTask, "EXP-009");
  assert.equal(settings.body.settingsProfileSurface.supabasePersistenceDecision.taskId, "SUPABASE-001");
  assert.equal(settings.body.settingsProfileSurface.supabasePersistenceDecision.decision, "defer-for-first-release");

  const deletion = await requestJsonWithBody(server, "POST", "/api/account/actions", {
    actionType: "request-account-deletion",
  }, {
    headers: authHeader(token),
  });
  assert.equal(deletion.statusCode, 200);
  assert.equal(deletion.body.status, "pending");
  assert.equal(deletion.body.accountEvent.eventType, "account-deletion-requested");
  assert.equal(
    deletion.body.settingsProfileSurface.accountBoundary.accountActivityHistory.at(-1).metadata.privacyOwnerTask,
    "PRIVACY-001",
  );

  const logoutAll = await requestJsonWithBody(server, "POST", "/api/account/actions", {
    actionType: "logout-all",
  }, {
    headers: authHeader(token),
  });
  assert.equal(logoutAll.statusCode, 200);
  assert.equal(logoutAll.body.accountEvent.eventType, "sessions-revoked");
  assert.equal(logoutAll.body.settingsProfileSurface.accountBoundary.activeSession.status, "revoked");
});
