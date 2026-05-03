import test from "node:test";
import assert from "node:assert/strict";

import { createCanonicalExecutionResultEnvelope } from "../src/core/canonical-execution-result-envelope.js";

test("canonical execution result envelope accepts ready artifact-backed execution result", () => {
  const { canonicalExecutionResultEnvelope } = createCanonicalExecutionResultEnvelope({
    executionInvocationContract: {
      executionRequestId: "req-1",
      invocationStage: "reconcile-pending",
      invocationTarget: {
        providerType: "hosting",
        executorType: "local-runner",
      },
      reconcileContract: {
        stateUpdateStatus: "pending-reconcile",
      },
      evidenceRefs: ["dispatch-receipt:req-1"],
      blockedReasons: [],
    },
    ideAgentResultNormalization: {
      status: "running",
      blockedReasons: [],
    },
    artifactCollectionPipeline: {
      collectionStage: "collection-ready",
      collectedArtifacts: [{ artifactId: "artifact-1" }],
      evidenceRefs: ["command-console:test-project"],
      blockedReasons: [],
      summary: {
        canPromoteToResultEnvelope: true,
      },
    },
    externalExecutionResult: {
      status: "dispatched",
      dispatchDecision: "accepted",
      providerResultStatus: "accepted",
    },
    externalExecutionSession: {
      providerType: "hosting",
    },
  });

  assert.equal(canonicalExecutionResultEnvelope.status, "ready");
  assert.equal(canonicalExecutionResultEnvelope.outcome, "accepted");
  assert.equal(canonicalExecutionResultEnvelope.summary.hasArtifacts, true);
  assert.equal(canonicalExecutionResultEnvelope.summary.isReadyForDeploymentReality, true);
});

test("canonical execution result envelope preserves failure state from normalized result", () => {
  const { canonicalExecutionResultEnvelope } = createCanonicalExecutionResultEnvelope({
    executionInvocationContract: {
      executionRequestId: "req-2",
      invocationStage: "invoke-failed",
      invocationTarget: {},
      blockedReasons: [],
      evidenceRefs: [],
    },
    ideAgentResultNormalization: {
      status: "failed",
      blockedReasons: [],
    },
    artifactCollectionPipeline: {
      collectionStage: "evidence-collecting",
      collectedArtifacts: [],
      blockedReasons: [],
      evidenceRefs: [],
      summary: {
        canPromoteToResultEnvelope: false,
      },
    },
    externalExecutionResult: {
      status: "dispatched",
      dispatchDecision: "accepted",
    },
  });

  assert.equal(canonicalExecutionResultEnvelope.status, "failed");
  assert.equal(canonicalExecutionResultEnvelope.outcome, "failed");
});

test("canonical execution result envelope preserves blocked reasons from upstream contracts", () => {
  const { canonicalExecutionResultEnvelope } = createCanonicalExecutionResultEnvelope({
    executionInvocationContract: {
      executionRequestId: "req-3",
      blockedReasons: ["approval-pending"],
      evidenceRefs: [],
    },
    ideAgentResultNormalization: {
      blockedReasons: ["workspace-path-missing"],
    },
    artifactCollectionPipeline: {
      blockedReasons: ["artifacts-missing"],
      collectedArtifacts: [],
      evidenceRefs: [],
    },
    externalExecutionResult: {},
  });

  assert.equal(canonicalExecutionResultEnvelope.status, "blocked");
  assert.equal(canonicalExecutionResultEnvelope.blockedReasons.includes("approval-pending"), true);
  assert.equal(canonicalExecutionResultEnvelope.blockedReasons.includes("workspace-path-missing"), true);
  assert.equal(canonicalExecutionResultEnvelope.blockedReasons.includes("artifacts-missing"), true);
});
