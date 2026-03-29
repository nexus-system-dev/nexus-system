import test from "node:test";
import assert from "node:assert/strict";

import { defineEditableProposalSchema } from "../src/core/editable-proposal-schema.js";

test("editable proposal schema builds editable sections components copy and next action", () => {
  const { editableProposal } = defineEditableProposalSchema({
    proposalType: "workspace-recommendation",
    proposalPayload: {
      sourceId: "recommendation-display:task-1",
      recommendationDisplay: {
        displayId: "recommendation-display:task-1",
        headline: "Approve deploy",
        whyNow: "Production fix is blocked",
        expectedImpact: "Unblocks release",
        alternatives: [{ label: "Run staging first" }],
        primaryCta: {
          actionId: "approve-deploy",
          label: "Approve deploy",
          intent: "approval",
        },
      },
      nextTaskPresentation: {
        presentationId: "next-task-presentation:task-1",
        approvalState: {
          requiresApproval: true,
        },
        expectedOutcome: {
          headline: "Deploy the fix",
        },
      },
      approvalStatus: {
        status: "pending",
        requiresApproval: true,
        reason: "Owner approval is required",
      },
    },
  });

  assert.equal(editableProposal.proposalType, "workspace-recommendation");
  assert.equal(editableProposal.sections.length >= 3, true);
  assert.equal(editableProposal.components.length >= 3, true);
  assert.equal(editableProposal.copy.length >= 3, true);
  assert.equal(editableProposal.nextAction.intent, "approval");
  assert.equal(editableProposal.summary.requiresApproval, true);
  assert.equal(editableProposal.summary.supportsPartialAcceptance, true);
});

test("editable proposal schema falls back safely", () => {
  const { editableProposal } = defineEditableProposalSchema();

  assert.equal(typeof editableProposal.proposalId, "string");
  assert.equal(Array.isArray(editableProposal.sections), true);
  assert.equal(Array.isArray(editableProposal.components), true);
  assert.equal(Array.isArray(editableProposal.copy), true);
  assert.equal(typeof editableProposal.nextAction.label, "string");
});
