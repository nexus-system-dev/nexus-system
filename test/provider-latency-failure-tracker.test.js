import test from "node:test";
import assert from "node:assert/strict";

import { createProviderLatencyFailureTracker } from "../src/core/provider-latency-failure-tracker.js";

test("provider latency failure tracker records healthy observed latency when provider chain is ready", () => {
  const { providerLatencyFailureTracker } = createProviderLatencyFailureTracker({
    aiGenerationObservability: {
      observabilityId: "ai-generation-observability:req-1",
      providerId: "canonical-local-provider",
      summary: {
        validationStatus: "valid",
        reviewStatus: "ready-for-review",
        applyStatus: "ready-for-state-integration",
      },
      contractChecks: [],
    },
    aiDesignProviderResult: {
      providerId: "canonical-local-provider",
      mode: "deterministic",
      status: "ready",
      latencyMs: 180,
      latencyBudgetMs: 400,
    },
    aiDesignServiceResult: {
      status: "ready",
    },
    aiDesignExecutionState: {
      status: "generated",
    },
    externalProviderHealthAndFailover: {
      lifecycleState: "healthy",
      providerHealth: "healthy",
      circuitState: "closed",
    },
  });

  assert.equal(providerLatencyFailureTracker.status, "healthy");
  assert.equal(providerLatencyFailureTracker.latency.observedLatencyMs, 180);
  assert.equal(providerLatencyFailureTracker.latency.latencyStatus, "within-budget");
  assert.equal(providerLatencyFailureTracker.failure.failureCount, 0);
  assert.equal(providerLatencyFailureTracker.summary.requiresAttention, false);
});

test("provider latency failure tracker flags degraded provider health and canonical blockers", () => {
  const { providerLatencyFailureTracker } = createProviderLatencyFailureTracker({
    aiGenerationObservability: {
      observabilityId: "ai-generation-observability:req-2",
      providerId: "canonical-local-provider",
      summary: {
        validationStatus: "invalid",
        reviewStatus: "blocked",
        applyStatus: "blocked",
      },
      contractChecks: [
        {
          key: "validation",
          status: "invalid",
          reason: "Proposal validation failed.",
        },
      ],
    },
    aiDesignProviderResult: {
      providerId: "canonical-local-provider",
      mode: "deterministic",
      status: "ready",
    },
    aiDesignServiceResult: {
      status: "ready",
    },
    aiDesignExecutionState: {
      status: "generated",
    },
    externalProviderHealthAndFailover: {
      lifecycleState: "degraded",
      providerHealth: "degraded",
      circuitState: "half-open",
      providerRoute: {
        activeTarget: "ai-provider-fallback",
      },
    },
  });

  assert.equal(providerLatencyFailureTracker.status, "needs-attention");
  assert.equal(providerLatencyFailureTracker.latency.latencyStatus, "unmeasured");
  assert.equal(providerLatencyFailureTracker.failure.failureCount > 0, true);
  assert.equal(providerLatencyFailureTracker.failure.failureCategories.includes("provider-health"), true);
  assert.equal(providerLatencyFailureTracker.failure.failureCategories.includes("contract-blocker"), true);
  assert.equal(providerLatencyFailureTracker.summary.requiresAttention, true);
});
