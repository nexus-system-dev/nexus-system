import test from "node:test";
import assert from "node:assert/strict";

import { createProjectPresenceModel } from "../src/core/project-presence-model.js";

test("project presence model returns active collaborators by workspace area", () => {
  const { projectPresenceState } = createProjectPresenceModel({
    collaborationEvent: {
      actor: {
        actorId: "user-1",
        displayName: "Owner",
        role: "owner",
        presence: "active",
      },
      target: {
        workspaceId: "workspace-1",
        projectId: "project-1",
        workspaceArea: "development-workspace",
      },
    },
    userSessionMetric: {
      status: "active",
      activeUsers: [
        { userId: "user-1", displayName: "Owner", role: "owner", status: "active", workspaceArea: "development-workspace" },
        { userId: "user-2", displayName: "Reviewer", role: "editor", status: "active", workspaceArea: "release-workspace" },
      ],
    },
  });

  assert.equal(projectPresenceState.workspaceArea, "development-workspace");
  assert.equal(projectPresenceState.participants.length, 2);
  assert.equal(projectPresenceState.activeParticipantCount, 2);
  assert.equal(projectPresenceState.summary.hasSharedPresence, true);
  assert.equal(projectPresenceState.participants[0].lastSeenAt !== null, true);
  assert.equal(Array.isArray(projectPresenceState.summary.workspaceAreas), true);
});

test("project presence model falls back safely to current actor", () => {
  const { projectPresenceState } = createProjectPresenceModel();

  assert.equal(typeof projectPresenceState.presenceStateId, "string");
  assert.equal(Array.isArray(projectPresenceState.participants), true);
  assert.equal(typeof projectPresenceState.summary.totalParticipants, "number");
});

test("project presence model normalizes malformed participant identifiers and statuses", () => {
  const { projectPresenceState } = createProjectPresenceModel({
    collaborationEvent: {
      actor: {
        actorId: "  ",
        displayName: "  ",
        role: "  ",
        presence: " ACTIVE ",
      },
      target: {
        workspaceId: "  ",
        projectId: "  ",
        workspaceArea: " release-workspace ",
      },
    },
    userSessionMetric: {
      status: " ACTIVE ",
      activeUsers: [
        {
          userId: "  ",
          actorId: " reviewer-1 ",
          displayName: "  ",
          role: "  ",
          status: " ACTIVE ",
          workspaceArea: " release-workspace ",
          currentSurface: " review-panel ",
          currentTask: " ship review ",
          sessionId: " session-1 ",
          lastSeenAt: " 2026-04-20T10:00:00.000Z ",
        },
      ],
    },
  });

  assert.equal(projectPresenceState.presenceStateId, "project-presence:project");
  assert.equal(projectPresenceState.workspaceId, null);
  assert.equal(projectPresenceState.projectId, null);
  assert.equal(projectPresenceState.workspaceArea, "release-workspace");
  assert.equal(projectPresenceState.activeParticipantCount, 1);
  assert.equal(projectPresenceState.participants[0].participantId, "reviewer-1");
  assert.equal(projectPresenceState.participants[0].displayName, "Collaborator 1");
  assert.equal(projectPresenceState.participants[0].role, "viewer");
  assert.equal(projectPresenceState.participants[0].status, "active");
  assert.equal(projectPresenceState.participants[0].currentSurface, "review-panel");
  assert.equal(projectPresenceState.participants[0].currentTask, "ship review");
  assert.equal(projectPresenceState.participants[0].sessionId, "session-1");
  assert.equal(projectPresenceState.participants[0].lastSeenAt, "2026-04-20T10:00:00.000Z");
});
