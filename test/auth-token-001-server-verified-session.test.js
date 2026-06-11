import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

function createHarness() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-auth-token-001-"));
  const service = new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
  return {
    service,
    server: createServer(service, { runtimeId: "auth-token-001-test" }),
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

function signup(server, userId) {
  return requestJsonWithBody(server, "POST", "/api/auth/signup", {
    userInput: {
      userId,
      email: `${userId}@example.test`,
      displayName: userId,
    },
    credentials: { password: "local-secret" },
  });
}

function requestSseHeaders(server, pathname, options = {}) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const request = new EventEmitter();
    request.method = "GET";
    request.url = pathname;
    request.headers = options.headers ?? {};
    request.socket = { remoteAddress: "127.0.0.1" };
    request.on = request.addListener.bind(request);

    const response = new EventEmitter();
    response.statusCode = 200;
    response.headers = {};
    response.writeHead = (statusCode, headers) => {
      response.statusCode = statusCode;
      response.headers = headers;
      if (String(headers?.["Content-Type"] ?? headers?.["content-type"] ?? "").includes("text/event-stream")) {
        settled = true;
        resolve({
          statusCode,
          headers,
        });
        queueMicrotask(() => request.emit("close"));
      }
    };
    response.write = () => {};
    response.end = (body) => {
      if (settled) {
        return;
      }
      settled = true;
      try {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: body ? JSON.parse(body) : null,
        });
      } catch (error) {
        reject(error);
      }
    };

    server.emit("request", request, response);
  });
}

test("AUTH-TOKEN-001 verifies server-issued session tokens for project routes and rejects forged user ids", async () => {
  const { server } = createHarness();
  const ownerSignup = await signup(server, "auth-owner");
  const outsiderSignup = await signup(server, "auth-outsider");
  const ownerToken = ownerSignup.body.authPayload.tokenBundle.accessToken;
  const outsiderToken = outsiderSignup.body.authPayload.tokenBundle.accessToken;

  assert.equal(typeof ownerToken, "string");
  assert.match(ownerSignup.headers["Set-Cookie"], /nexus_access_token=/);

  const created = await requestJsonWithBody(server, "POST", "/api/projects", {
    id: "auth-token-project",
    name: "Auth Token Project",
    goal: "Verify server session identity",
  }, {
    headers: authHeader(ownerToken),
  });
  assert.equal(created.statusCode, 201);
  assert.equal(created.body.userId, "auth-owner");

  const forgedHeaderOnly = await requestJson(server, "/api/projects/auth-token-project", {
    headers: { "x-user-id": "auth-owner" },
  });
  assert.equal(forgedHeaderOnly.statusCode, 401);
  assert.equal(forgedHeaderOnly.body.reason, "authentication-required");

  const ownerWithForgedHeader = await requestJson(server, "/api/projects/auth-token-project", {
    headers: {
      ...authHeader(ownerToken),
      "x-user-id": "auth-outsider",
    },
  });
  assert.equal(ownerWithForgedHeader.statusCode, 200);
  assert.equal(ownerWithForgedHeader.body.userId, "auth-owner");

  const outsiderRead = await requestJson(server, "/api/projects/auth-token-project", {
    headers: authHeader(outsiderToken),
  });
  assert.equal(outsiderRead.statusCode, 404);
});

test("AUTH-TOKEN-001 authorizes live events from cookie session and rejects user id query auth", async () => {
  const { server } = createHarness();
  const signupResponse = await signup(server, "auth-live-owner");
  const token = signupResponse.body.authPayload.tokenBundle.accessToken;

  await requestJsonWithBody(server, "POST", "/api/projects", {
    id: "auth-token-live-project",
    name: "Auth Token Live Project",
    goal: "Verify live events identity",
  }, {
    headers: authHeader(token),
  });

  const queryOnly = await requestSseHeaders(server, "/api/projects/auth-token-live-project/live-events?userId=auth-live-owner");
  assert.equal(queryOnly.statusCode, 401);
  assert.equal(queryOnly.body.reason, "authentication-required");

  const cookieAuth = await requestSseHeaders(server, "/api/projects/auth-token-live-project/live-events", {
    headers: {
      cookie: `nexus_access_token=${encodeURIComponent(token)}`,
    },
  });
  assert.equal(cookieAuth.statusCode, 200);
  assert.equal(cookieAuth.headers["Content-Type"], "text/event-stream; charset=utf-8");
});

test("AUTH-TOKEN-001 revoked sessions fail closed for future sensitive actions", async () => {
  const { server } = createHarness();
  const signupResponse = await signup(server, "auth-revoke-owner");
  const token = signupResponse.body.authPayload.tokenBundle.accessToken;

  await requestJsonWithBody(server, "POST", "/api/projects", {
    id: "auth-token-revoke-project",
    name: "Auth Token Revoke Project",
    goal: "Verify revoke closes access",
  }, {
    headers: authHeader(token),
  });

  const revoke = await requestJsonWithBody(server, "POST", "/api/account/actions", {
    actionType: "logout-all",
  }, {
    headers: authHeader(token),
  });
  assert.equal(revoke.statusCode, 200);
  assert.equal(revoke.body.settingsProfileSurface.accountBoundary.activeSession.status, "revoked");

  const afterRevoke = await requestJson(server, "/api/projects/auth-token-revoke-project", {
    headers: authHeader(token),
  });
  assert.equal(afterRevoke.statusCode, 401);
  assert.equal(afterRevoke.body.reason, "authentication-required");
});
