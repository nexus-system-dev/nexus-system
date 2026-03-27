import test from "node:test";
import assert from "node:assert/strict";

import { createCollaborationActivityFeed } from "../src/core/collaboration-activity-feed.js";

test("collaboration activity feed combines team actions threads and workspace transitions", () => {
  const { collaborationFeed } = createCollaborationActivityFeed({
    collaborationEvent: {
      eventId: "collaboration-event:project-1:comment",
      eventType: "comment",
      visibility: "workspace",
      actor: {
        displayName: "Owner",
        presence: "active",
      },
      target: {
        workspaceArea: "development-workspace",
        resourceId: "diff-1",
      },
      payload: {
        message: "Please review the latest diff",
        mentions: ["user-2"],
      },
      summary: {
        projectId: "project-1",
        workspaceId: "workspace-1",
      },
    },
    projectPresenceState: {
      projectId: "project-1",
      workspaceId: "workspace-1",
      workspaceArea: "development-workspace",
      activeParticipantCount: 2,
      participants: [
        { participantId: "user-1", displayName: "Owner", role: "owner", status: "active", workspaceArea: "development-workspace" },
        { participantId: "user-2", displayName: "Reviewer", role: "reviewer", status: "active", workspaceArea: "release-workspace" },
      ],
      summary: {
        totalParticipants: 2,
        dominantWorkspaceArea: "development-workspace",
        hasSharedPresence: true,
      },
    },
    reviewThreadState: {
      threads: [
        {
          threadId: "thread:1",
          threadType: "review-thread",
          title: "Review pending changes",
          status: "open",
          source: "review-thread",
          messages: [{ messageId: "msg-1" }],
          contextTarget: {
            workspaceArea: "development-workspace",
            resourceType: "diff",
            resourceId: "diff-1",
          },
        },
      ],
    },
  });

  assert.equal(collaborationFeed.feedId, "collaboration-feed:project-1");
  assert.equal(collaborationFeed.items.some((item) => item.itemType === "comment"), true);
  assert.equal(collaborationFeed.items.some((item) => item.itemType === "presence"), true);
  assert.equal(collaborationFeed.items.some((item) => item.itemType === "workspace-transition"), true);
  assert.equal(collaborationFeed.summary.containsThreadActivity, true);
  assert.equal(collaborationFeed.summary.containsPresenceSignals, true);
  assert.equal(collaborationFeed.summary.containsWorkspaceTransitions, true);
});

test("collaboration activity feed falls back safely", () => {
  const { collaborationFeed } = createCollaborationActivityFeed();

  assert.equal(typeof collaborationFeed.feedId, "string");
  assert.equal(Array.isArray(collaborationFeed.items), true);
  assert.equal(typeof collaborationFeed.summary.totalItems, "number");
});
