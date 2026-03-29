import test from "node:test";
import assert from "node:assert/strict";

import { createProposalEditingSystem } from "../src/core/proposal-editing-system.js";

test("proposal editing system revises proposal with annotations and preserves history", () => {
  const { editedProposal, proposalEditHistory } = createProposalEditingSystem({
    editableProposal: {
      proposalId: "editable-proposal:workspace-recommendation:rec-1",
      status: "proposed",
      sections: [
        { sectionId: "overview", label: "Overview", status: "proposed" },
      ],
      components: [
        { componentId: "headline", sectionId: "overview", proposedValue: "Approve deploy" },
      ],
      copy: [
        { copyId: "headline-copy", sectionId: "overview", proposedText: "Approve deploy" },
      ],
      nextAction: {
        actionId: "approve-deploy",
        label: "Approve deploy",
        intent: "approval",
        requiresApproval: true,
      },
      summary: {
        supportsPartialAcceptance: true,
      },
    },
    userEditInput: {
      revisionNumber: 2,
      sectionEdits: [{ sectionId: "overview", status: "revised", contentSummary: "Deploy needs narrower scope" }],
      componentEdits: [{ componentId: "headline", proposedValue: "Approve deploy to staging first" }],
      copyEdits: [{ copyId: "headline-copy", proposedText: "Approve deploy to staging first" }],
      nextActionEdit: { label: "Approve staging deploy" },
      annotations: [{ targetType: "section", targetId: "overview", note: "Limit rollout to staging" }],
    },
  });

  assert.equal(editedProposal.revisionNumber, 2);
  assert.equal(editedProposal.annotations.length, 1);
  assert.equal(editedProposal.components[0].proposedValue, "Approve deploy to staging first");
  assert.equal(editedProposal.copy[0].proposedText, "Approve deploy to staging first");
  assert.equal(editedProposal.nextAction.label, "Approve staging deploy");
  assert.equal(proposalEditHistory.entries.length, 2);
  assert.equal(proposalEditHistory.summary.preservesHistory, true);
});

test("proposal editing system falls back safely without explicit edits", () => {
  const { editedProposal, proposalEditHistory } = createProposalEditingSystem({
    editableProposal: {
      proposalId: "editable-proposal:generic:unknown",
      sections: [],
      components: [],
      copy: [],
      nextAction: { label: "Review proposal" },
    },
  });

  assert.equal(typeof editedProposal.revisionId, "string");
  assert.equal(Array.isArray(editedProposal.annotations), true);
  assert.equal(typeof proposalEditHistory.historyId, "string");
  assert.equal(Array.isArray(proposalEditHistory.entries), true);
});
