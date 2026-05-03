import test from "node:test";
import assert from "node:assert/strict";

import { createGenerationSuccessAcceptanceTracker } from "../src/core/generation-success-acceptance-tracker.js";

test("generation success acceptance tracker records accepted proposal outcomes", () => {
  const { generationSuccessAcceptanceTracker } = createGenerationSuccessAcceptanceTracker({
    aiGenerationObservability: {
      observabilityId: "ai-generation-observability:req-1",
      summary: {
        providerMode: "deterministic",
      },
    },
    aiDesignProposal: {
      proposalId: "ai-design-proposal:req-1",
      regions: [{ regionId: "hero" }, { regionId: "timeline" }],
    },
    renderableDesignProposal: {
      proposalId: "renderable-proposal:req-1",
      meta: {
        isRenderable: true,
      },
    },
    designProposalReviewState: {
      reviewStateId: "review:req-1",
      status: "ready-for-review",
      summary: {
        canEnterHumanReview: true,
      },
    },
    proposalApplyDecision: {
      decisionId: "apply:req-1",
      status: "ready-for-state-integration",
      summary: {
        canIntegrate: true,
      },
    },
    partialAcceptanceDecision: {
      decisionId: "partial:req-1",
      status: "partially-accepted",
      followUpAction: "regenerate-rejected-scope",
      approvedSections: [{ sectionId: "hero" }],
      approvedComponents: [{ componentId: "cta" }],
      approvedCopy: [{ copyId: "headline" }],
      rejectedSections: [],
      rejectedComponents: [],
      remainingCopy: [],
      summary: {
        approvedCount: 3,
        remainingCount: 0,
      },
    },
  });

  assert.equal(generationSuccessAcceptanceTracker.status, "accepted");
  assert.equal(generationSuccessAcceptanceTracker.generation.producedProposalCount, 1);
  assert.equal(generationSuccessAcceptanceTracker.proposalOutcomes.acceptedProposalCount, 1);
  assert.equal(generationSuccessAcceptanceTracker.summary.acceptanceRate, 1);
  assert.equal(generationSuccessAcceptanceTracker.operatorAcceptance.canIntegrate, true);
});

test("generation success acceptance tracker flags rejected proposal outcomes that need regeneration", () => {
  const { generationSuccessAcceptanceTracker } = createGenerationSuccessAcceptanceTracker({
    aiGenerationObservability: {
      observabilityId: "ai-generation-observability:req-2",
      summary: {
        providerMode: "deterministic",
        validationStatus: "invalid",
      },
    },
    aiDesignProposal: {
      proposalId: "ai-design-proposal:req-2",
      regions: [{ regionId: "hero" }],
    },
    renderableDesignProposal: {
      proposalId: "renderable-proposal:req-2",
      meta: {
        isRenderable: false,
      },
    },
    designProposalReviewState: {
      reviewStateId: "review:req-2",
      status: "blocked",
      summary: {
        canEnterHumanReview: false,
      },
    },
    proposalApplyDecision: {
      decisionId: "apply:req-2",
      status: "blocked",
      summary: {
        canIntegrate: false,
      },
    },
    partialAcceptanceDecision: {
      decisionId: "partial:req-2",
      status: "needs-regeneration",
      followUpAction: "review-full-proposal",
      approvedSections: [],
      approvedComponents: [],
      approvedCopy: [],
      rejectedSections: [{ sectionId: "hero" }],
      rejectedComponents: [{ componentId: "cta" }],
      remainingCopy: [{ copyId: "headline" }],
      summary: {
        approvedCount: 0,
        remainingCount: 3,
      },
    },
  });

  assert.equal(generationSuccessAcceptanceTracker.status, "needs-attention");
  assert.equal(generationSuccessAcceptanceTracker.proposalOutcomes.rejectedProposalCount, 1);
  assert.equal(generationSuccessAcceptanceTracker.summary.ownerAcceptanceStatus, "needs-regeneration");
  assert.equal(generationSuccessAcceptanceTracker.ownerAcceptance.rejectedElementCount, 2);
  assert.equal(generationSuccessAcceptanceTracker.summary.requiresAttention, true);
});
