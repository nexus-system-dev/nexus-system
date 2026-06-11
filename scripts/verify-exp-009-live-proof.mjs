import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

function requestJson({ port, method = "GET", pathname, payload = null, headers = {} }) {
  return new Promise((resolve, reject) => {
    const body = payload == null ? null : JSON.stringify(payload);
    const request = http.request({
      hostname: "127.0.0.1",
      port,
      path: pathname,
      method,
      headers: {
        ...(body ? { "content-type": "application/json", "content-length": Buffer.byteLength(body) } : {}),
        ...headers,
      },
      timeout: 6000,
    }, (response) => {
      let raw = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        raw += chunk;
      });
      response.on("end", () => {
        let parsed = null;
        try {
          parsed = raw ? JSON.parse(raw) : null;
        } catch {
          parsed = { raw };
        }
        resolve({ statusCode: response.statusCode, body: parsed });
      });
    });
    request.on("error", reject);
    request.on("timeout", () => {
      request.destroy(new Error(`timeout ${method} ${pathname}`));
    });
    if (body) {
      request.write(body);
    }
    request.end();
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve(server.address().port);
    });
  });
}

function close(server) {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}

function assertStep(failures, condition, label, details = {}) {
  if (!condition) {
    failures.push({ label, details });
  }
}

const reportPath = path.join(os.tmpdir(), `nexus-exp-009-${Date.now()}-report.json`);
const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-exp-009-live-"));
const service = new ProjectService({
  eventLogPath: path.join(directory, "events.ndjson"),
});
const server = createServer(service, { runtimeId: "exp-009-live-proof" });
const failures = [];

let port = null;
try {
  port = await listen(server);
  await requestJson({
    port,
    method: "POST",
    pathname: "/api/auth/signup",
    payload: {
      userInput: { userId: "owner-live", email: "owner-live@example.com", displayName: "Owner Live" },
      credentials: { password: "secret" },
    },
  });
  await requestJson({
    port,
    method: "POST",
    pathname: "/api/auth/signup",
    payload: {
      userInput: { userId: "editor-live", email: "editor-live@example.com", displayName: "Editor Live" },
      credentials: { password: "secret" },
    },
  });

  const created = await requestJson({
    port,
    method: "POST",
    pathname: "/api/projects",
    headers: { "x-user-id": "owner-live" },
    payload: {
      id: "exp-009-live-project",
      name: "EXP 009 Live Project",
      goal: "Build a shared lead workspace",
    },
  });
  assertStep(failures, created.statusCode === 201, "project-created", { statusCode: created.statusCode });

  const ownerTeam = await requestJson({
    port,
    pathname: "/api/projects/exp-009-live-project/team",
    headers: { "x-user-id": "owner-live" },
  });
  assertStep(
    failures,
    ownerTeam.statusCode === 200 && ownerTeam.body?.teamMembershipBoundary?.taskId === "EXP-009",
    "owner-team-boundary-ready",
    { statusCode: ownerTeam.statusCode, body: ownerTeam.body },
  );

  const invited = await requestJson({
    port,
    method: "POST",
    pathname: "/api/projects/exp-009-live-project/team/invitations",
    headers: { "x-user-id": "owner-live" },
    payload: {
      invitationRequest: { email: "editor-live@example.com", role: "editor" },
    },
  });
  assertStep(failures, invited.statusCode === 201, "team-invitation-created", { statusCode: invited.statusCode, body: invited.body });

  const accepted = await requestJson({
    port,
    method: "POST",
    pathname: "/api/team-invitations/accept",
    headers: { "x-user-id": "editor-live" },
    payload: {
      projectId: "exp-009-live-project",
      email: "editor-live@example.com",
      invitationId: invited.body?.invitationRecord?.invitationId,
    },
  });
  assertStep(failures, accepted.statusCode === 200, "team-invitation-accepted", { statusCode: accepted.statusCode, body: accepted.body });

  const editorRead = await requestJson({
    port,
    pathname: "/api/projects/exp-009-live-project",
    headers: { "x-user-id": "editor-live" },
  });
  assertStep(failures, editorRead.statusCode === 200, "accepted-member-can-read-project", { statusCode: editorRead.statusCode });
  assertStep(
    failures,
    editorRead.body?.state?.workspaceModel?.members?.some((member) => member.userId === "editor-live" && member.role === "editor"),
    "accepted-member-restored-in-project-truth",
    { members: editorRead.body?.state?.workspaceModel?.members },
  );

  const outsiderRead = await requestJson({
    port,
    pathname: "/api/projects/exp-009-live-project",
    headers: { "x-user-id": "outsider-live" },
  });
  assertStep(failures, outsiderRead.statusCode === 404, "outsider-cannot-read-project", { statusCode: outsiderRead.statusCode });

  const removed = await requestJson({
    port,
    method: "POST",
    pathname: "/api/projects/exp-009-live-project/team/remove-member",
    headers: { "x-user-id": "owner-live" },
    payload: { memberUserId: "editor-live" },
  });
  assertStep(failures, removed.statusCode === 200, "member-removed", { statusCode: removed.statusCode, body: removed.body });

  const removedRead = await requestJson({
    port,
    pathname: "/api/projects/exp-009-live-project",
    headers: { "x-user-id": "editor-live" },
  });
  assertStep(failures, removedRead.statusCode === 404, "removed-member-cannot-read-project", { statusCode: removedRead.statusCode });

  const reinvite = await requestJson({
    port,
    method: "POST",
    pathname: "/api/projects/exp-009-live-project/team/invitations",
    headers: { "x-user-id": "owner-live" },
    payload: {
      invitationRequest: { email: "editor-live@example.com", role: "admin" },
    },
  });
  const reaccepted = await requestJson({
    port,
    method: "POST",
    pathname: "/api/team-invitations/accept",
    headers: { "x-user-id": "editor-live" },
    payload: {
      projectId: "exp-009-live-project",
      email: "editor-live@example.com",
      invitationId: reinvite.body?.invitationRecord?.invitationId,
    },
  });
  const transferred = await requestJson({
    port,
    method: "POST",
    pathname: "/api/projects/exp-009-live-project/team/transfer-ownership",
    headers: { "x-user-id": "owner-live" },
    payload: { nextOwnerUserId: "editor-live" },
  });
  assertStep(
    failures,
    reaccepted.statusCode === 200 && transferred.statusCode === 200 && transferred.body?.project?.state?.workspaceModel?.ownerUserId === "editor-live",
    "ownership-transferred-to-active-member",
    { reacceptedStatus: reaccepted.statusCode, transferredStatus: transferred.statusCode, ownerUserId: transferred.body?.project?.state?.workspaceModel?.ownerUserId },
  );
} finally {
  if (port != null) {
    await close(server);
  }
}

const report = {
  taskId: "EXP-009",
  status: failures.length === 0 ? "passed" : "failed",
  failures,
  reportPath,
};
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

if (failures.length > 0) {
  process.exit(1);
}
