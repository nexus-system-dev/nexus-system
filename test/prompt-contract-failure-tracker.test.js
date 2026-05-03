import test from "node:test";
import assert from "node:assert/strict";

import { createPromptContractFailureTracker } from "../src/core/prompt-contract-failure-tracker.js";

test("prompt contract failure tracker stays clear when the canonical AI chain is ready", () => {
  const { promptContractFailureTracker } = createPromptContractFailureTracker({
    aiGenerationObservability: {
      observabilityId: "ai-generation-observability:req-1",
      contractChecks: [
        { key: "request-contract", status: "ready", reason: "ok" },
        { key: "response-contract", status: "ready", reason: "ok" },
      ],
    },
    aiDesignExecutionState: {
      executionStateId: "execution:req-1",
      status: "generated",
    },
    aiDesignServiceResult: {
      serviceResultId: "service:req-1",
      status: "ready",
    },
  });

  assert.equal(promptContractFailureTracker.status, "clear");
  assert.equal(promptContractFailureTracker.failureSummary.blockingFailureCount, 0);
  assert.equal(promptContractFailureTracker.latestFailure, null);
});

test("prompt contract failure tracker classifies missing and invalid contract failures", () => {
  const { promptContractFailureTracker } = createPromptContractFailureTracker({
    aiGenerationObservability: {
      observabilityId: "ai-generation-observability:req-2",
      contractChecks: [
        { key: "request-contract", status: "missing", reason: "AI design request contract is missing." },
        { key: "validation", status: "invalid", reason: "Proposal validation failed." },
        { key: "review", status: "blocked", reason: "Review handoff is blocked." },
      ],
    },
    aiDesignExecutionState: {
      executionStateId: "execution:req-2",
      status: "generated",
    },
    aiDesignServiceResult: {
      serviceResultId: "service:req-2",
      status: "ready",
    },
  });

  assert.equal(promptContractFailureTracker.status, "needs-attention");
  assert.equal(promptContractFailureTracker.failureSummary.blockingFailureCount, 3);
  assert.equal(promptContractFailureTracker.failureSummary.missingContractCount, 1);
  assert.equal(promptContractFailureTracker.failureSummary.invalidContractCount, 1);
  assert.equal(promptContractFailureTracker.failureSummary.blockedContractCount, 1);
  assert.equal(promptContractFailureTracker.activeFailures[0].category, "missing-request-contract");
});
