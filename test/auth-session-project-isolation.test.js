import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";

function createProjectService(directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-auth-iso-"))) {
  return new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
}

function signup(service, userId, email) {
  return service.signupUser({
    userInput: {
      userId,
      email,
      displayName: userId,
    },
    credentials: {
      password: "local-test-password",
    },
  }).authPayload.userIdentity.userId;
}

test("AUTH-SESSION-PROJECT-ISO-001 scopes project list and restore to active user", () => {
  const service = createProjectService();
  const firstUserId = signup(service, "user-alpha", "alpha@nexus.local");
  const secondUserId = signup(service, "user-beta", "beta@nexus.local");

  service.createProject({
    id: "alpha-project",
    name: "Alpha Project",
    goal: "Alpha owner project",
    userId: firstUserId,
  });
  service.createProject({
    id: "beta-project",
    name: "Beta Project",
    goal: "Beta owner project",
    userId: secondUserId,
  });

  const alphaProjects = service.listProjects({ userId: firstUserId });
  assert.deepEqual(alphaProjects.map((project) => project.id), ["alpha-project"]);
  assert.equal(alphaProjects[0].userId, firstUserId);
  assert.equal(alphaProjects[0].state.workspaceModel.ownerUserId, firstUserId);

  assert.equal(service.getProject("alpha-project", { userId: firstUserId })?.id, "alpha-project");
  assert.equal(service.getProject("beta-project", { userId: firstUserId }), null);
});
