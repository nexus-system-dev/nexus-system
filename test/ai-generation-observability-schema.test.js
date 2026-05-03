import test from "node:test";
import assert from "node:assert/strict";

import { defineAiGenerationObservabilitySchema } from "../src/core/ai-generation-observability-schema.js";

test("ai generation observability schema summarizes canonical AI generation chain health", () => {
  const { aiGenerationObservability } = defineAiGenerationObservabilitySchema({
    aiDesignRequest: {
      requestId: "ai-design-request:release-screen",
    },
    aiDesignProposal: {
      proposalId: "ai-design-proposal:release-screen",
      regions: [{ regionId: "hero" }, { regionId: "timeline" }],
    },
    aiDesignProviderResult: {
      providerResultId: "ai-design-provider-result:canonical-local-provider:release-screen",
      providerId: "canonical-local-provider",
      mode: "deterministic",
      status: "ready",
    },
    aiDesignServiceResult: {
      serviceResultId: "ai-design-service:release-screen",
    },
    aiDesignExecutionState: {
      executionStateId: "ai-design-execution:release-screen",
      status: "generated",
    },
    renderableDesignProposal: {
      meta: {
        isRenderable: true,
      },
    },
    designProposalValidation: {
      validationId: "design-validation:release-screen",
      status: "valid",
    },
    designProposalReviewState: {
      reviewStateId: "design-review:release-screen",
      status: "ready-for-review",
    },
    proposalApplyDecision: {
      decisionId: "proposal-apply:release-screen",
      status: "ready-for-state-integration",
    },
  });

  assert.equal(aiGenerationObservability.status, "ready");
  assert.equal(aiGenerationObservability.summary.blockingCheckCount, 0);
  assert.equal(aiGenerationObservability.runtimeSignals.reviewReady, true);
  assert.equal(aiGenerationObservability.reviewSignals.proposedRegionCount, 2);
  assert.equal(aiGenerationObservability.contractChecks.length >= 9, true);
});

test("ai generation observability schema flags missing canonical response chain pieces", () => {
  const { aiGenerationObservability } = defineAiGenerationObservabilitySchema({
    aiDesignRequest: {
      requestId: "ai-design-request:release-screen",
    },
  });

  assert.equal(aiGenerationObservability.status, "needs-attention");
  assert.equal(aiGenerationObservability.summary.blockingCheckCount > 0, true);
  assert.equal(
    aiGenerationObservability.contractChecks.some((check) => check.key === "response-contract" && check.status === "missing"),
    true,
  );
});
