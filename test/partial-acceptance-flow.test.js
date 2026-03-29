import test from "node:test";
import assert from "node:assert/strict";

import { createPartialAcceptanceFlow } from "../src/core/partial-acceptance-flow.js";

test("partial acceptance flow accepts part of proposal and returns remaining scope", () => {
  const { partialAcceptanceDecision, remainingProposalScope } = createPartialAcceptanceFlow({
    editedProposal: {
      proposalId: "editable-proposal:workspace-recommendation:rec-1",
      revisionId: "editable-proposal:workspace-recommendation:rec-1:revision-2",
      sections: [
        { sectionId: "overview", status: "revised" },
        { sectionId: "impact", status: "revised" },
      ],
      components: [
        { componentId: "headline", status: "proposed" },
        { componentId: "alternatives", status: "proposed" },
      ],
      copy: [
        { copyId: "headline-copy", status: "proposed" },
      ],
      nextAction: {
        actionId: "approve-staging",
        label: "Approve staging",
        requiresApproval: true,
      },
    },
    approvalOutcome: {
      sectionOutcomes: [
        { sectionId: "overview", decision: "approved" },
        { sectionId: "impact", decision: "rejected", note: "Needs narrower scope" },
      ],
      componentOutcomes: [
        { componentId: "headline", decision: "approved" },
        { componentId: "alternatives", decision: "rejected" },
      ],
      copyOutcomes: [
        { copyId: "headline-copy", decision: "approved" },
      ],
    },
  });

  assert.equal(partialAcceptanceDecision.status, "partially-accepted");
  assert.equal(partialAcceptanceDecision.summary.requiresRegeneration, true);
  assert.equal(partialAcceptanceDecision.rejectedSections.length, 1);
  assert.equal(remainingProposalScope.rejectedSections.length, 1);
  assert.equal(remainingProposalScope.componentsNeedingRegeneration.length, 1);
  assert.equal(remainingProposalScope.nextAction.status, "ready-after-partial-acceptance");
});

test("partial acceptance flow falls back safely", () => {
  const { partialAcceptanceDecision, remainingProposalScope } = createPartialAcceptanceFlow({
    editedProposal: {
      proposalId: "editable-proposal:generic:unknown",
      revisionId: "editable-proposal:generic:unknown:revision-1",
      sections: [],
      components: [],
      copy: [],
      nextAction: { label: "Review proposal" },
    },
  });

  assert.equal(typeof partialAcceptanceDecision.decisionId, "string");
  assert.equal(typeof partialAcceptanceDecision.summary.canProceed, "boolean");
  assert.equal(typeof remainingProposalScope.scopeId, "string");
  assert.equal(typeof remainingProposalScope.summary.remainingSectionCount, "number");
});
