import test from "node:test";
import assert from "node:assert/strict";

import { defineCollaborationEventSchema } from "../src/core/collaboration-event-schema.js";

test("collaboration event schema returns canonical shared approval event", () => {
  const { collaborationEvent } = defineCollaborationEventSchema({
    workspaceAction: {
      actionType: "shared-approval",
      message: "Approval is waiting for review",
      workspaceId: "workspace-1",
      projectId: "project-1",
      workspaceArea: "release-workspace",
      approvalStatus: "pending",
      resourceId: "approval-1",
    },
    actorContext: {
      actorId: "user-1",
      displayName: "Nexus Owner",
      role: "owner",
      presence: "active",
      workspaceVisibility: "private",
    },
  });

  assert.equal(collaborationEvent.eventType, "shared-approval");
  assert.equal(collaborationEvent.actor.role, "owner");
  assert.equal(collaborationEvent.target.workspaceArea, "release-workspace");
  assert.equal(collaborationEvent.payload.approvalStatus, "pending");
  assert.equal(collaborationEvent.summary.isSharedEvent, true);
});

test("collaboration event schema falls back safely to presence signal", () => {
  const { collaborationEvent } = defineCollaborationEventSchema();

  assert.equal(typeof collaborationEvent.eventId, "string");
  assert.equal(collaborationEvent.eventType, "presence-signal");
  assert.equal(typeof collaborationEvent.summary.workspaceArea, "string");
});
