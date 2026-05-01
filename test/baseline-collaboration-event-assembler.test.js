import test from "node:test";
import assert from "node:assert/strict";

import { createBaselineCollaborationEventAssembler } from "../src/core/baseline-collaboration-event-assembler.js";

test("baseline collaboration event assembler preserves explicit workspace action input", () => {
  const { baselineCollaborationEvent } = createBaselineCollaborationEventAssembler({
    userIdentity: {
      userId: "user-1",
      displayName: "User One",
    },
    membershipRecord: {
      role: "editor",
    },
    accessDecision: {
      effectiveRole: "viewer",
    },
    sessionState: {
      status: "active",
    },
    workspaceModel: {
      workspaceId: "workspace-1",
      visibility: "workspace",
    },
    approvalStatus: {
      status: "approved",
    },
    approvalRequestWithStatus: {
      projectId: "project-1",
      approvalRequestId: "approval-1",
    },
    workspaceAction: {
      eventId: "event-1",
      actionType: "comment-added",
      message: "Review comment added",
      mentions: ["@qa"],
      workspaceArea: "review-panel",
      visibility: "shared",
      resourceId: "thread-1",
      projectId: "project-1",
    },
  });

  assert.equal(baselineCollaborationEvent.workspaceAction.eventId, "event-1");
  assert.equal(baselineCollaborationEvent.workspaceAction.actionType, "comment-added");
  assert.equal(baselineCollaborationEvent.workspaceAction.visibility, "shared");
  assert.equal(baselineCollaborationEvent.actorContext.role, "editor");
  assert.equal(baselineCollaborationEvent.actorContext.presence, "active");
});

test("baseline collaboration event assembler falls back to approval or presence collaboration state", () => {
  const { baselineCollaborationEvent } = createBaselineCollaborationEventAssembler({
    userIdentity: {
      userId: "user-2",
    },
    membershipRecord: {},
    accessDecision: {
      effectiveRole: "operator",
    },
    sessionState: {
      status: "idle",
    },
    workspaceModel: {
      workspaceId: "workspace-2",
      visibility: "workspace",
    },
    approvalStatus: {
      status: "pending",
    },
    approvalRequestWithStatus: {
      projectId: "project-2",
      approvalRequestId: "approval-2",
    },
    workspaceAction: null,
  });

  assert.equal(baselineCollaborationEvent.workspaceAction.actionType, "shared-approval");
  assert.match(baselineCollaborationEvent.workspaceAction.message, /approval is waiting/i);
  assert.equal(baselineCollaborationEvent.workspaceAction.resourceId, "approval-2");
  assert.equal(baselineCollaborationEvent.actorContext.role, "operator");
  assert.equal(baselineCollaborationEvent.actorContext.presence, "idle");
});
