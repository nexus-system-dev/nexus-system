import test from "node:test";
import assert from "node:assert/strict";

import { createCollaborationActivityFeed } from "../src/core/collaboration-activity-feed.js";

test("collaboration activity feed combines team actions threads and workspace transitions", () => {
  const { collaborationFeed } = createCollaborationActivityFeed({
    collaborationActivityHistory: {
      historyId: "collaboration-history:project-1",
      items: [
        {
          feedItemId: "collaboration-feed:event:1",
          itemType: "comment",
          source: "collaboration-event",
        },
        {
          feedItemId: "collaboration-feed:presence:1",
          itemType: "presence",
          source: "project-presence",
        },
        {
          feedItemId: "collaboration-feed:thread:1",
          itemType: "review-thread",
          source: "review-thread",
        },
        {
          feedItemId: "collaboration-feed:approval:1",
          itemType: "shared-approval",
          source: "shared-approval-state",
        },
        {
          feedItemId: "collaboration-feed:transition:1",
          itemType: "workspace-transition",
          source: "workspace-transition",
        },
      ],
      summary: {
        totalItems: 5,
        containsThreadActivity: true,
        containsApprovalCoordination: true,
      },
    },
  });

  assert.equal(collaborationFeed.feedId, "collaboration-feed:collaboration-history:project-1");
  assert.equal(collaborationFeed.items.some((item) => item.itemType === "comment"), true);
  assert.equal(collaborationFeed.items.some((item) => item.itemType === "presence"), true);
  assert.equal(collaborationFeed.items.some((item) => item.itemType === "workspace-transition"), true);
  assert.equal(collaborationFeed.items.some((item) => item.itemType === "shared-approval"), true);
  assert.equal(collaborationFeed.summary.containsThreadActivity, true);
  assert.equal(collaborationFeed.summary.containsPresenceSignals, true);
  assert.equal(collaborationFeed.summary.containsWorkspaceTransitions, true);
  assert.equal(collaborationFeed.summary.containsApprovalCoordination, true);
});

test("collaboration activity feed falls back safely", () => {
  const { collaborationFeed } = createCollaborationActivityFeed();

  assert.equal(typeof collaborationFeed.feedId, "string");
  assert.equal(Array.isArray(collaborationFeed.items), true);
  assert.equal(typeof collaborationFeed.summary.totalItems, "number");
});
