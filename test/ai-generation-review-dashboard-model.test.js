import test from "node:test";
import assert from "node:assert/strict";

import { createAiGenerationReviewDashboardModel } from "../src/core/ai-generation-review-dashboard-model.js";

test("ai generation review dashboard summarizes a healthy generation lane", () => {
  const { aiGenerationReviewDashboard } = createAiGenerationReviewDashboardModel({
    aiGenerationObservability: {
      observabilityId: "obs-1",
      summary: {
        reviewStatus: "ready-for-review",
        blockingCheckCount: 0,
      },
    },
    providerLatencyFailureTracker: {
      providerId: "canonical-local-provider",
      status: "healthy",
      providerHealth: {
        providerHealth: "healthy",
      },
      latency: {
        latencyStatus: "within-budget",
      },
      summary: {
        requiresAttention: false,
      },
    },
    generationSuccessAcceptanceTracker: {
      status: "accepted",
      summary: {
        reviewStatus: "ready-for-review",
        acceptedProposalCount: 1,
        rejectedProposalCount: 0,
        acceptanceRate: 1,
        requiresAttention: false,
      },
    },
    promptContractFailureTracker: {
      status: "clear",
      failureSummary: {
        blockingFailureCount: 0,
        requiresAttention: false,
      },
      latestFailure: null,
    },
  });

  assert.equal(aiGenerationReviewDashboard.status, "healthy");
  assert.equal(aiGenerationReviewDashboard.summary.blockerCount, 0);
  assert.equal(aiGenerationReviewDashboard.summary.riskSignalCount, 0);
});

test("ai generation review dashboard elevates the primary action from active failures", () => {
  const { aiGenerationReviewDashboard } = createAiGenerationReviewDashboardModel({
    aiGenerationObservability: {
      observabilityId: "obs-2",
      summary: {
        reviewStatus: "blocked",
        blockingCheckCount: 4,
      },
    },
    providerLatencyFailureTracker: {
      providerId: "canonical-local-provider",
      status: "needs-attention",
      providerHealth: {
        providerHealth: "healthy",
      },
      latency: {
        latencyStatus: "unmeasured",
      },
      summary: {
        requiresAttention: true,
      },
      failure: {
        latestReason: "Renderable design proposal is not ready.",
      },
    },
    generationSuccessAcceptanceTracker: {
      status: "needs-attention",
      summary: {
        reviewStatus: "blocked",
        acceptedProposalCount: 0,
        rejectedProposalCount: 1,
        acceptanceRate: 0,
        requiresAttention: true,
      },
    },
    promptContractFailureTracker: {
      status: "needs-attention",
      failureSummary: {
        blockingFailureCount: 4,
        requiresAttention: true,
      },
      latestFailure: {
        reason: "Renderable design proposal is not ready.",
      },
    },
  });

  assert.equal(aiGenerationReviewDashboard.status, "needs-attention");
  assert.equal(aiGenerationReviewDashboard.summary.blockerCount, 8);
  assert.equal(aiGenerationReviewDashboard.summary.primaryAction, "Renderable design proposal is not ready.");
  assert.equal(aiGenerationReviewDashboard.riskSignals.includes("prompt-contract"), true);
});
