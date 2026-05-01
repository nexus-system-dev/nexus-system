import test from "node:test";
import assert from "node:assert/strict";

import { createBaselineCollaborationActivityHistoryAssembler } from "../src/core/baseline-collaboration-activity-history-assembler.js";

test("baseline collaboration activity history assembler combines collaboration event and presence contributions", () => {
  const { collaborationActivityHistory } = createBaselineCollaborationActivityHistoryAssembler({
    collaborationEvent: {
      eventId: "event-1",
      eventType: "comment",
      visibility: "workspace",
      actor: {
        displayName: "Owner",
        presence: "active",
      },
      target: {
        workspaceArea: "review-panel",
        resourceId: "thread-1",
      },
      payload: {
        message: "Review comment added",
        mentions: ["@qa"],
      },
      summary: {
        projectId: "project-1",
        workspaceId: "workspace-1",
      },
    },
    projectPresenceState: {
      projectId: "project-1",
      workspaceId: "workspace-1",
      workspaceArea: "developer-workspace",
      participants: [
        {
          participantId: "participant-1",
          displayName: "Owner",
          status: "active",
          role: "owner",
        },
      ],
      summary: {
        dominantWorkspaceArea: "developer-workspace",
        totalParticipants: 1,
        hasSharedPresence: false,
      },
    },
  });

  assert.equal(collaborationActivityHistory.items[0].source, "collaboration-event");
  assert.equal(collaborationActivityHistory.items[1].source, "project-presence");
  assert.equal(collaborationActivityHistory.summary.containsPresenceSignals, true);
});

test("baseline collaboration activity history assembler includes review-thread and shared-approval contributions", () => {
  const { collaborationActivityHistory } = createBaselineCollaborationActivityHistoryAssembler({
    collaborationEvent: {
      summary: {
        projectId: "project-2",
      },
    },
    projectPresenceState: {
      projectId: "project-2",
      workspaceId: "workspace-2",
      workspaceArea: "developer-workspace",
      summary: {
        dominantWorkspaceArea: "developer-workspace",
        totalParticipants: 2,
        hasSharedPresence: true,
      },
    },
    reviewThreadState: {
      threads: [
        {
          threadId: "thread-1",
          threadType: "review-thread",
          title: "Clarify release steps",
          status: "open",
          source: "review-thread",
          participants: [{ displayName: "Reviewer" }],
          contextTarget: {
            workspaceArea: "release-workspace",
            resourceId: "release-1",
          },
          messages: [{ id: "message-1" }],
        },
      ],
    },
    sharedApprovalState: {
      approvalRequestId: "approval-1",
      workspaceId: "workspace-2",
      workspaceArea: "release-workspace",
      visibility: "workspace",
      participantDecisions: [
        {
          participantRole: "owner",
          decision: "approved",
          actorName: "Owner",
        },
      ],
      coordinationStatus: {
        pendingRequiredRoles: ["operator"],
      },
      decisionState: {
        status: "pending",
      },
    },
  });

  assert.equal(collaborationActivityHistory.summary.containsThreadActivity, true);
  assert.equal(collaborationActivityHistory.summary.containsApprovalCoordination, true);
  assert.equal(
    collaborationActivityHistory.items.some((item) => item.source === "shared-approval-state"),
    true,
  );
});
