import test from "node:test";
import assert from "node:assert/strict";

import { createExplanationAssembler } from "../src/core/explanation-assembler.js";

test("explanation assembler combines next action, failure, approval and change explanations", () => {
  const { projectExplanation } = createExplanationAssembler({
    nextActionExplanation: {
      explanationId: "next-1",
      blockerType: "approval-blocker",
      userFacingAction: "לפתוח בקשת אישור",
    },
    failureExplanation: {
      explanationId: "failure-1",
      failureStatus: "blocked",
      failedWhat: "הביצוע ממתין לאישור שלך לפני שאפשר להמשיך.",
    },
    approvalExplanation: {
      explanationId: "approval-1",
      whyApproval: "יש כמה הגדרות שעדיין דורשות את האישור שלך",
      summary: {
        requiresApproval: true,
      },
    },
    changeExplanation: {
      explanationId: "change-1",
      changedWhat: "בוצעו שינויים חדשים והפרויקט התקדם צעד נוסף.",
    },
  });

  assert.equal(projectExplanation.summary.hasNextAction, true);
  assert.equal(projectExplanation.summary.hasFailure, true);
  assert.equal(projectExplanation.summary.hasApproval, true);
  assert.equal(projectExplanation.summary.hasChange, true);
  assert.equal(projectExplanation.headline, "צריך את האישור שלך כדי שנוכל להמשיך.");
  assert.match(projectExplanation.userSummary, /לפתוח בקשת אישור/);
});

test("explanation assembler falls back safely when explanation parts are missing", () => {
  const { projectExplanation } = createExplanationAssembler();

  assert.equal(typeof projectExplanation.explanationId, "string");
  assert.equal(projectExplanation.summary.hasFailure, false);
});
