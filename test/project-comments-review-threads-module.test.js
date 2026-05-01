import test from "node:test";
import assert from "node:assert/strict";

import { createProjectCommentsAndReviewThreadsModule } from "../src/core/project-comments-review-threads-module.js";

test("project comments and review threads module links approval discussions to contextual targets", () => {
  const { reviewThreadState } = createProjectCommentsAndReviewThreadsModule({
    collaborationEvent: {
      eventId: "collaboration-event:project-1:shared-approval",
      eventType: "shared-approval",
      actor: {
        actorId: "user-1",
        displayName: "Owner",
      },
      target: {
        resourceId: "approval-1",
        workspaceArea: "release-workspace",
      },
      payload: {
        message: "Please review this approval",
        approvalStatus: "pending",
        mentions: ["user-2"],
      },
    },
    branchDiffActivityPanel: {
      diffs: {
        headline: "2 files changed",
        executionRequestId: "exec-1",
        totalChanges: 2,
      },
      pendingApprovals: [
        {
          approvalRecordId: "approval-1",
          actionType: "deploy",
          status: "pending",
        },
      ],
      pullRequests: [
        {
          id: "pr-1",
          title: "Release auth improvements",
          state: "open",
          targetBranch: "main",
        },
      ],
    },
  });

  assert.equal(reviewThreadState.threads[0].threadType, "approval-thread");
  assert.equal(reviewThreadState.threads[0].contextTarget.approvalRecordId, "approval-1");
  assert.equal(reviewThreadState.threads[0].messages[0].body, "Please review this approval");
  assert.equal(reviewThreadState.threads.some((thread) => thread.threadType === "review-thread"), true);
  assert.equal(reviewThreadState.threads.some((thread) => thread.threadType === "release-thread"), true);
  assert.equal(reviewThreadState.summary.totalThreads, 4);
  assert.equal(reviewThreadState.summary.linkedToApproval, true);
  assert.equal(reviewThreadState.summary.linkedToReleaseStep, true);
});

test("project comments and review threads module falls back safely", () => {
  const { reviewThreadState } = createProjectCommentsAndReviewThreadsModule();

  assert.equal(typeof reviewThreadState.threadStateId, "string");
  assert.equal(Array.isArray(reviewThreadState.threads), true);
  assert.equal(reviewThreadState.threads.length, 0);
  assert.equal(typeof reviewThreadState.summary.totalThreads, "number");
  assert.equal(reviewThreadState.summary.hasContextualDiscussion, false);
});

test("project comments and review threads module merges persisted discussion threads", () => {
  const { reviewThreadState } = createProjectCommentsAndReviewThreadsModule({
    branchDiffActivityPanel: {
      diffs: {
        headline: "2 files changed",
        executionRequestId: "exec-1",
        totalChanges: 2,
      },
    },
    persistedThreads: [
      {
        threadId: "thread:diff:exec-1",
        projectId: "project-1",
        title: "Review pending changes",
        threadType: "review-thread",
        contextTarget: {
          workspaceArea: "developer-workspace",
          resourceType: "diff",
          resourceId: "exec-1",
          filePath: "workspace/diff-preview",
        },
        messages: [
          {
            messageId: "persisted-message-1",
            authorId: "user-1",
            authorName: "Owner",
            body: "Check the changed copy before merge",
            status: "open",
          },
        ],
        participants: [{ participantId: "user-1", displayName: "Owner" }],
        status: "open",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:01:00.000Z",
      },
    ],
  });

  assert.equal(reviewThreadState.threads.length, 1);
  assert.equal(reviewThreadState.threads[0].messages.length, 2);
  assert.equal(reviewThreadState.threads[0].messages[1].body, "Check the changed copy before merge");
  assert.equal(reviewThreadState.summary.openThreads, 1);
});

test("project comments and review threads module normalizes malformed identifiers and statuses", () => {
  const { reviewThreadState } = createProjectCommentsAndReviewThreadsModule({
    collaborationEvent: {
      eventId: " collaboration-event:project-1:shared-review ",
      eventType: " shared-review ",
      actor: {
        actorId: " reviewer-1 ",
        displayName: " Reviewer ",
      },
      target: {
        projectId: "  ",
        resourceId: " diff-1 ",
        workspaceArea: " release-workspace ",
      },
      payload: {
        message: " Review this diff ",
        reviewStatus: " open ",
        mentions: [" user-2 ", "   "],
      },
    },
    branchDiffActivityPanel: {
      diffs: {
        headline: " 2 files changed ",
        executionRequestId: " exec-1 ",
        totalChanges: 2,
      },
    },
  });

  assert.equal(reviewThreadState.threadStateId, "review-thread-state:project");
  assert.equal(reviewThreadState.threads[0].threadId, "thread:collaboration-event:project-1:shared-review");
  assert.equal(reviewThreadState.threads[0].threadType, "review-thread");
  assert.equal(reviewThreadState.threads[0].title, "Review this diff");
  assert.equal(reviewThreadState.threads[0].messages[0].authorId, "reviewer-1");
  assert.deepEqual(reviewThreadState.threads[0].messages[0].mentions, ["user-2"]);
  assert.equal(reviewThreadState.threads[0].messages[0].status, "open");
  assert.equal(reviewThreadState.summary.openThreads >= 1, true);
});
