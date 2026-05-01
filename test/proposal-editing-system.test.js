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

test("proposal editing system normalizes malformed edit payloads and history entries", () => {
  const { editedProposal, proposalEditHistory } = createProposalEditingSystem({
    editableProposal: {
      proposalId: "  editable-proposal:workspace-recommendation:rec-1  ",
      status: "  proposed  ",
      sections: [
        { sectionId: " overview ", label: "  Overview  ", status: "   " },
      ],
      components: [
        { componentId: " headline ", sectionId: " overview ", componentType: "   " },
      ],
      copy: [
        { copyId: " headline-copy ", sectionId: " overview ", field: "   ", proposedText: "   " },
      ],
      nextAction: {
        actionId: "   ",
        label: "   ",
        intent: "   ",
      },
    },
    userEditInput: {
      revisionNumber: "3",
      status: "   ",
      sectionEdits: [{ sectionId: " overview ", label: "  Tightened Scope  ", contentSummary: "  Narrow rollout  " }],
      componentEdits: [{ componentId: " headline ", componentType: "   " }],
      copyEdits: [{ copyId: " headline-copy ", field: "   ", proposedText: "   Updated copy   " }],
      nextActionEdit: { actionId: "   ", label: "  Review edited proposal  ", intent: "   " },
      annotations: [
        {
          annotationId: "   ",
          targetType: "   ",
          targetId: "   ",
          note: "   ",
          comment: "  Use staged rollout  ",
          severity: "   ",
        },
      ],
      previousHistory: [
        {
          entryId: "   ",
          revisionNumber: "2",
          action: "   ",
          proposalId: "   ",
          annotationCount: "oops",
        },
      ],
    },
  });

  assert.equal(editedProposal.proposalId, "editable-proposal:workspace-recommendation:rec-1");
  assert.equal(editedProposal.revisionNumber, 3);
  assert.equal(editedProposal.status, "revised");
  assert.equal(editedProposal.sections[0].sectionId, "overview");
  assert.equal(editedProposal.sections[0].label, "Tightened Scope");
  assert.equal(editedProposal.sections[0].contentSummary, "Narrow rollout");
  assert.equal(editedProposal.components[0].componentId, "headline");
  assert.equal(editedProposal.components[0].componentType, "panel");
  assert.equal(editedProposal.copy[0].copyId, "headline-copy");
  assert.equal(editedProposal.copy[0].field, "body");
  assert.equal(editedProposal.copy[0].proposedText, "Updated copy");
  assert.equal(editedProposal.nextAction.actionId, "review-proposal");
  assert.equal(editedProposal.nextAction.label, "Review edited proposal");
  assert.equal(editedProposal.nextAction.intent, "review");
  assert.equal(editedProposal.annotations[0].annotationId, "annotation-1");
  assert.equal(editedProposal.annotations[0].targetType, "section");
  assert.equal(editedProposal.annotations[0].targetId, "overview");
  assert.equal(editedProposal.annotations[0].note, "Use staged rollout");
  assert.equal(editedProposal.annotations[0].severity, "info");
  assert.equal(proposalEditHistory.entries[0].entryId, "editable-proposal:workspace-recommendation:rec-1:history-2");
  assert.equal(proposalEditHistory.entries[0].revisionNumber, 2);
  assert.equal(proposalEditHistory.entries[0].action, "revised");
  assert.equal(proposalEditHistory.entries[0].proposalId, "editable-proposal:workspace-recommendation:rec-1");
  assert.equal(proposalEditHistory.entries[0].annotationCount, 0);
});
