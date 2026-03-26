import test from "node:test";
import assert from "node:assert/strict";

import { defineExplanationSchema } from "../src/core/explanation-schema.js";

test("explanation schema returns canonical explanation types for active project context", () => {
  const { explanationSchema } = defineExplanationSchema({
    projectState: {
      projectId: "project-1",
      bottleneckState: {
        summary: {
          isBlocked: true,
        },
        reason: "Approval is still pending",
      },
      approvalStatus: {
        status: "pending",
      },
      diffPreview: {
        headline: "Updated auth flow and deploy config",
      },
      unblockPlan: {
        nextActions: [
          {
            label: "Open approval request",
          },
        ],
      },
    },
    decisionContext: {
      activeBottleneck: {
        reason: "Production deploy needs approval",
      },
      policyTrace: {
        summary: "Deploy is gated by production approval policy",
      },
    },
  });

  assert.equal(explanationSchema.summary.totalTypes, 5);
  assert.equal(explanationSchema.summary.availableTypes >= 4, true);
  assert.equal(explanationSchema.explanationTypes[0].explanationType, "why-this-task");
});

test("explanation schema falls back to canonical unavailable summaries", () => {
  const { explanationSchema } = defineExplanationSchema();

  assert.equal(explanationSchema.projectId, null);
  assert.equal(explanationSchema.summary.totalTypes, 5);
  assert.equal(Array.isArray(explanationSchema.explanationTypes), true);
});

test("explanation schema keeps why-approval available while approval blocker is active", () => {
  const { explanationSchema } = defineExplanationSchema({
    projectState: {
      projectId: "project-2",
      approvalStatus: {
        status: "approved",
      },
      approvalRequest: {
        status: "pending",
      },
    },
    decisionContext: {
      activeBottleneck: {
        blockerType: "approval-blocker",
        reason: "Owner approval is still missing",
      },
      policyTrace: {
        finalDecision: "requires-approval",
      },
    },
  });

  const whyApproval = explanationSchema.explanationTypes.find(
    (item) => item.explanationType === "why-approval",
  );

  assert.equal(whyApproval?.available, true);
  assert.equal(whyApproval?.summary, "Owner approval is still missing");
});

test("explanation schema turns off why-approval after blocker moves forward", () => {
  const { explanationSchema } = defineExplanationSchema({
    projectState: {
      projectId: "project-3",
      approvalStatus: {
        status: "approved",
      },
      approvalRequest: {
        status: "approved",
      },
    },
    decisionContext: {
      activeBottleneck: {
        blockerType: "release-blocker",
        reason: "Release checks are still failing",
      },
      policyTrace: {
        finalDecision: "allowed",
        requiresApproval: false,
      },
    },
  });

  const whyApproval = explanationSchema.explanationTypes.find(
    (item) => item.explanationType === "why-approval",
  );

  assert.equal(whyApproval?.available, false);
});
