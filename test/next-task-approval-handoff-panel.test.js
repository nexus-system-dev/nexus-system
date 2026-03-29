import test from "node:test";
import assert from "node:assert/strict";

import { createNextTaskApprovalHandoffPanel } from "../src/core/next-task-approval-handoff-panel.js";

test("next task approval handoff panel shows approval requirement and safe alternatives", () => {
  const { nextTaskApprovalPanel } = createNextTaskApprovalHandoffPanel({
    nextTaskPresentation: {
      presentationId: "next-task-presentation:approval",
      selectedTask: {
        summary: "Deploy production",
      },
      approvalState: {
        requiresApproval: true,
        reason: "Waiting for owner approval",
      },
      expectedOutcome: {
        headline: "Production deploy can continue",
        expectedImpact: "The release moves forward",
        successCriteria: ["Owner approval is granted"],
      },
      alternatives: ["wait-for-approval", "switch-to-safe-path", "open-approval-request"],
    },
    approvalExplanation: {
      whyApproval: "השינוי הזה דורש אישור לפני שנמשיך",
      whatIfRejected: "נישאר במסלול בטוח יותר",
      riskLevel: "high",
    },
  });

  assert.equal(nextTaskApprovalPanel.approvalRequired, true);
  assert.equal(nextTaskApprovalPanel.status, "attention");
  assert.equal(nextTaskApprovalPanel.explanation.riskLevel, "high");
  assert.deepEqual(nextTaskApprovalPanel.safeAlternatives, ["wait-for-approval", "switch-to-safe-path"]);
});

test("next task approval handoff panel falls back safely without explicit approval requirement", () => {
  const { nextTaskApprovalPanel } = createNextTaskApprovalHandoffPanel({
    nextTaskPresentation: {
      presentationId: "next-task-presentation:none",
      approvalState: {
        requiresApproval: false,
      },
      expectedOutcome: {
        successCriteria: [],
      },
      alternatives: [],
    },
    approvalExplanation: null,
  });

  assert.equal(nextTaskApprovalPanel.approvalRequired, false);
  assert.equal(nextTaskApprovalPanel.summary.canProceedWithoutApproval, true);
});
