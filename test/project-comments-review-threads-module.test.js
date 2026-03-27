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
