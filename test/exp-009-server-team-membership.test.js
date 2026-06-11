import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

function createHarness() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-exp-009-server-"));
  const service = new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
  return {
    service,
    server: createServer(service, { runtimeId: "exp-009-test" }),
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

test("EXP-009 server routes preserve team membership and enforce project access", async () => {
  const { server } = createHarness();

  const ownerSignup = await requestJsonWithBody(server, "POST", "/api/auth/signup", {
    userInput: { userId: "owner-1", email: "owner@example.com", displayName: "Owner" },
    credentials: { password: "secret" },
  });
  const editorSignup = await requestJsonWithBody(server, "POST", "/api/auth/signup", {
    userInput: { userId: "editor-1", email: "editor@example.com", displayName: "Editor" },
    credentials: { password: "secret" },
  });
  const outsiderSignup = await requestJsonWithBody(server, "POST", "/api/auth/signup", {
    userInput: { userId: "outsider-1", email: "outsider@example.com", displayName: "Outsider" },
    credentials: { password: "secret" },
  });
  const ownerToken = ownerSignup.body.authPayload.tokenBundle.accessToken;
  const editorToken = editorSignup.body.authPayload.tokenBundle.accessToken;
  const outsiderToken = outsiderSignup.body.authPayload.tokenBundle.accessToken;

  const created = await requestJsonWithBody(server, "POST", "/api/projects", {
    id: "team-project",
    name: "Team Project",
    goal: "Build a shared lead workspace",
  }, {
    headers: authHeader(ownerToken),
  });
  assert.equal(created.statusCode, 201);
  const ownerProject = await requestJson(server, "/api/projects/team-project", {
    headers: authHeader(ownerToken),
  });
  assert.equal(ownerProject.statusCode, 200);
  assert.equal(ownerProject.body.state.teamMembershipBoundary.taskId, "EXP-009");

  const invited = await requestJsonWithBody(server, "POST", "/api/projects/team-project/team/invitations", {
    invitationRequest: { email: "editor@example.com", role: "editor" },
  }, {
    headers: authHeader(ownerToken),
  });
  assert.equal(invited.statusCode, 201);
  assert.equal(invited.body.invitationRecord.status, "pending");

  const accepted = await requestJsonWithBody(server, "POST", "/api/team-invitations/accept", {
    projectId: "team-project",
    email: "editor@example.com",
    invitationId: invited.body.invitationRecord.invitationId,
  }, {
    headers: authHeader(editorToken),
  });
  assert.equal(accepted.statusCode, 200);

  const editorRead = await requestJson(server, "/api/projects/team-project/team", {
    headers: authHeader(editorToken),
  });
  assert.equal(editorRead.statusCode, 200);
  assert.equal(
    editorRead.body.teamMembershipBoundary.members.some((member) => member.userId === "editor-1"),
    true,
  );

  const outsiderRead = await requestJson(server, "/api/projects/team-project", {
    headers: authHeader(outsiderToken),
  });
  assert.equal(outsiderRead.statusCode, 404);
});
