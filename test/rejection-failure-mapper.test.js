import test from "node:test";
import assert from "node:assert/strict";

import { createRejectionAndFailureMapper } from "../src/core/rejection-failure-mapper.js";

test("rejection and failure mapper returns failure summary and follow-up tasks", () => {
  const { failureSummary, followUpTasks } = createRejectionAndFailureMapper({
    providerErrors: ["metadata rejected by store review"],
    reviewFeedback: ["approval missing for release"],
    bottleneck: {
      title: "Store Review",
    },
    taskResults: [
      {
        status: "failed",
        reason: "artifact build failed",
      },
    ],
  });

  assert.equal(failureSummary.status, "blocked");
  assert.equal(failureSummary.issueCount, 3);
  assert.equal(Array.isArray(failureSummary.categories), true);
  assert.equal(Array.isArray(followUpTasks), true);
  assert.equal(followUpTasks.length, 3);
});

test("rejection and failure mapper returns clear summary when no issues exist", () => {
  const { failureSummary, followUpTasks } = createRejectionAndFailureMapper();

  assert.equal(failureSummary.status, "clear");
  assert.equal(failureSummary.issueCount, 0);
  assert.equal(followUpTasks.length, 0);
});

test("rejection and failure mapper prefers active bottleneck and unblock actions over stale generic follow-ups", () => {
  const { failureSummary, followUpTasks } = createRejectionAndFailureMapper({
    providerErrors: ["build-output"],
    bottleneck: {
      title: "אין כרגע חסם מרכזי",
    },
    activeBottleneck: {
      blockerType: "approval-blocker",
      reason: "Execution is blocked on approval",
      summary: {
        isBlocking: true,
      },
    },
    unblockPlan: {
      nextActions: [
        {
          actionType: "approval",
          label: "Open approval request",
        },
      ],
    },
  });

  assert.equal(failureSummary.bottleneck, "Approval");
  assert.equal(failureSummary.primaryReason, "Execution is blocked on approval");
  assert.equal(followUpTasks.length, 1);
  assert.equal(followUpTasks[0].summary, "Open approval request");
  assert.deepEqual(followUpTasks[0].blockedBy, ["Approval"]);
});
