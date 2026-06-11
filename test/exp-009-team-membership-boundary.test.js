import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";

function createProjectService() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-exp-009-"));
  return new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
}

test("EXP-009 creates explicit owner team truth and restores it through project reads", () => {
  const service = createProjectService();
  service.signupUser({
    userInput: { userId: "owner-1", email: "owner@example.com", displayName: "Owner" },
    credentials: { password: "secret" },
  });

  service.createProject({
    id: "team-project",
    name: "Team Project",
    goal: "Build a shared lead workspace",
    userId: "owner-1",
  });

  const project = service.getProject("team-project", { userId: "owner-1" });
  assert.equal(project.state.teamMembershipBoundary.taskId, "EXP-009");
  assert.equal(project.state.workspaceModel.ownerUserId, "owner-1");
  assert.equal(project.state.workspaceModel.members[0].role, "owner");
  assert.equal(project.state.workspaceModel.roles.includes("admin"), true);
  assert.equal(project.state.roleCapabilityMatrix.roles.some((role) => role.role === "admin"), true);
});

test("EXP-009 invitation acceptance grants project access and removal revokes it", () => {
  const service = createProjectService();
  service.signupUser({
    userInput: { userId: "owner-1", email: "owner@example.com", displayName: "Owner" },
    credentials: { password: "secret" },
  });
  service.signupUser({
    userInput: { userId: "editor-1", email: "editor@example.com", displayName: "Editor" },
    credentials: { password: "secret" },
  });
  service.createProject({
    id: "team-project",
    name: "Team Project",
    goal: "Build a shared lead workspace",
    userId: "owner-1",
  });

  const invite = service.inviteProjectMember("team-project", {
    actorUserId: "owner-1",
    invitationRequest: { email: "editor@example.com", role: "editor" },
  });
  assert.equal(invite.httpStatus, 201);
  assert.equal(invite.invitationRecord.status, "pending");

  const accepted = service.acceptProjectInvitation("team-project", {
    actorUserId: "editor-1",
    email: "editor@example.com",
    invitationId: invite.invitationRecord.invitationId,
  });
  assert.equal(accepted.httpStatus, 200);
  assert.equal(accepted.membershipRecord.role, "editor");

  const editorProject = service.getProject("team-project", { userId: "editor-1" });
  assert.equal(editorProject.id, "team-project");
  assert.equal(editorProject.state.workspaceModel.members.some((member) => member.userId === "editor-1"), true);

  const removed = service.removeProjectMember("team-project", {
    actorUserId: "owner-1",
    memberUserId: "editor-1",
  });
  assert.equal(removed.httpStatus, 200);
  assert.equal(service.getProject("team-project", { userId: "editor-1" }), null);
});

test("EXP-009 ownership transfer changes project owner and preserves former owner as admin", () => {
  const service = createProjectService();
  service.signupUser({
    userInput: { userId: "owner-1", email: "owner@example.com", displayName: "Owner" },
    credentials: { password: "secret" },
  });
  service.signupUser({
    userInput: { userId: "admin-1", email: "admin@example.com", displayName: "Admin" },
    credentials: { password: "secret" },
  });
  service.createProject({
    id: "team-project",
    name: "Team Project",
    goal: "Build a shared lead workspace",
    userId: "owner-1",
  });
  const invite = service.inviteProjectMember("team-project", {
    actorUserId: "owner-1",
    invitationRequest: { email: "admin@example.com", role: "admin" },
  });
  service.acceptProjectInvitation("team-project", {
    actorUserId: "admin-1",
    email: "admin@example.com",
    invitationId: invite.invitationRecord.invitationId,
  });

  const transferred = service.transferProjectOwnership("team-project", {
    actorUserId: "owner-1",
    nextOwnerUserId: "admin-1",
  });

  assert.equal(transferred.httpStatus, 200);
  assert.equal(transferred.project.state.workspaceModel.ownerUserId, "admin-1");
  assert.equal(transferred.project.userId, "admin-1");
  assert.equal(
    transferred.project.state.workspaceModel.members.find((member) => member.userId === "owner-1").role,
    "admin",
  );
});
