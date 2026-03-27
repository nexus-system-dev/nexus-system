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
});

test("project presence model falls back safely to current actor", () => {
  const { projectPresenceState } = createProjectPresenceModel();

  assert.equal(typeof projectPresenceState.presenceStateId, "string");
  assert.equal(Array.isArray(projectPresenceState.participants), true);
  assert.equal(typeof projectPresenceState.summary.totalParticipants, "number");
});
