import test from "node:test";
import assert from "node:assert/strict";

import { createExternalExecutionDispatchModule } from "../src/core/external-execution-dispatch-module.js";

test("external execution dispatch module returns canonical dispatched result when connector can execute", () => {
  const { externalExecutionResult } = createExternalExecutionDispatchModule({
    atomicExecutionEnvelope: {
      atomicExecutionEnvelopeId: "atomic-envelope:req-1",
      executionRequestId: "req-1",
      status: "ready",
      canDispatch: true,
      blockedReasons: [],
      action: {
        actionType: "deploy",
        requestedOperation: "deploy",
      },
      target: {
        providerType: "hosting",
        targetSurface: "sandbox",
      },
      atomicityContract: {
        idempotencyKey: "external-action:proj-1:ws-1:deploy:deploy",
      },
    },
    resolvedExecutionConfig: {
      providerType: "hosting",
      connectorStatus: "connected",
      operationTypes: ["deploy", "validate"],
      targetSurface: "sandbox",
      credentialReference: "cred-ref",
      artifactCount: 2,
    },
  });

  assert.equal(externalExecutionResult.status, "dispatched");
  assert.equal(externalExecutionResult.dispatchDecision, "accepted");
  assert.equal(externalExecutionResult.providerResultStatus, "accepted");
  assert.equal(externalExecutionResult.stateUpdateProposal.status, "pending-reconcile");
  assert.equal(Array.isArray(externalExecutionResult.storedEvidence), true);
  assert.equal(externalExecutionResult.storedEvidence.length >= 2, true);
});

test("external execution dispatch module emits blocked result when envelope is blocked", () => {
  const { externalExecutionResult } = createExternalExecutionDispatchModule({
    atomicExecutionEnvelope: {
      atomicExecutionEnvelopeId: "atomic-envelope:req-2",
      executionRequestId: "req-2",
      status: "blocked",
      canDispatch: false,
      blockedReasons: ["approval-pending"],
      action: {
        actionType: "deploy",
        requestedOperation: "deploy",
      },
      target: {
        providerType: "hosting",
      },
      atomicityContract: {
        idempotencyKey: "idempotency",
      },
    },
    resolvedExecutionConfig: {
      providerType: "hosting",
      connectorStatus: "connected",
      operationTypes: ["deploy"],
    },
  });

  assert.equal(externalExecutionResult.status, "blocked");
  assert.equal(externalExecutionResult.dispatchDecision, "blocked");
  assert.equal(externalExecutionResult.blockedReasons.includes("approval-pending"), true);
});
