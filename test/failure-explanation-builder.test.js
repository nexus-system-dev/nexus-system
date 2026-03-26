import test from "node:test";
import assert from "node:assert/strict";

import { createFailureExplanationBuilder } from "../src/core/failure-explanation-builder.js";

test("failure explanation builder explains failed task with likely cause and fix", () => {
  const { failureExplanation } = createFailureExplanationBuilder({
    failureSummary: {
      status: "blocked",
      categories: ["artifact"],
      primaryReason: "Build failed during bundle creation",
    },
    taskResult: {
      taskId: "build-task-1",
      status: "failed",
      reason: "Bundle output missing",
    },
    activeBottleneck: {
      bottleneckId: "active-bottleneck:task:1",
      blockerType: "failed-task",
      reason: "The build task is blocking release",
    },
  });

  assert.equal(failureExplanation.failedTaskId, "build-task-1");
  assert.equal(failureExplanation.failureStatus, "blocked");
  assert.equal(failureExplanation.likelyCause, "Build failed during bundle creation");
  assert.equal(
    failureExplanation.nextFix,
    "לנסות שוב את השלב האחרון או לעבור למסלול ההתאוששות שהוצע.",
  );
});

test("failure explanation builder falls back safely when details are partial", () => {
  const { failureExplanation } = createFailureExplanationBuilder({
    failureSummary: {
      status: "blocked",
      categories: [],
    },
    activeBottleneck: {
      bottleneckId: "active-bottleneck:approval:1",
      blockerType: "approval-blocker",
      reason: "Approval is missing",
    },
  });

  assert.equal(
    failureExplanation.failedWhat,
    "הביצוע ממתין לאישור שלך לפני שאפשר להמשיך.",
  );
  assert.equal(
    failureExplanation.likelyCause,
    "כמה הגדרות מפתח עדיין מחכות לאישור שלך.",
  );
  assert.equal(
    failureExplanation.nextFix,
    "לאשר את ההגדרות שמחכות לך כדי לפתוח את החסם.",
  );
});
