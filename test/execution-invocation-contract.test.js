import test from "node:test";
import assert from "node:assert/strict";

import { createExecutionInvocationContract } from "../src/core/execution-invocation-contract.js";

test("execution invocation contract returns invoke-ready contract from ready envelope", () => {
  const { executionInvocationContract } = createExecutionInvocationContract({
    atomicExecutionEnvelope: {
      executionRequestId: "req-1",
      canDispatch: true,
      blockedReasons: [],
      action: {
        actionType: "deploy",
        requestedOperation: "deploy",
        workflow: "action:deploy",
      },
      target: {
        targetSurface: "sandbox",
        executionMode: "temp-branch",
        providerType: "hosting",
      },
      policyPosture: {
        policyDecision: "allowed",
        approvalStatus: "approved",
      },
      atomicityContract: {
        credentialReference: "cred-ref",
        prepareRequired: true,
        reconcileRequired: true,
        abortOnFailure: true,
      },
    },
    externalExecutionSession: {
      executionRequestId: "req-1",
      status: "planned",
      blockedReasons: [],
      reconciliation: {
        stateUpdateStatus: "pending-reconcile",
        nextPatchType: "external-action-pending",
      },
    },
    ideAgentResultNormalization: {
      status: "planned",
      blockedReasons: [],
      evidenceRefs: [{ evidenceType: "command-console", reference: "console-1" }],
    },
    ideAgentExecutorContract: {
      executorType: "local-runner",
      targetSurface: "sandbox",
      selectedMode: "temp-branch",
    },
  });

  assert.equal(executionInvocationContract.status, "ready");
  assert.equal(executionInvocationContract.invocationStage, "invoke-ready");
  assert.equal(executionInvocationContract.summary.canInvoke, true);
  assert.equal(executionInvocationContract.reconcileContract.requiresReconcile, true);
});

test("execution invocation contract returns invoked state for active running session", () => {
  const { executionInvocationContract } = createExecutionInvocationContract({
    atomicExecutionEnvelope: {
      executionRequestId: "req-2",
      canDispatch: true,
      blockedReasons: [],
      action: {
        actionType: "codegen",
        requestedOperation: "validate",
      },
      target: {
        targetSurface: "local-terminal",
        executionMode: "local-terminal",
        providerType: "source-control",
      },
      atomicityContract: {
        prepareRequired: true,
        reconcileRequired: true,
        abortOnFailure: true,
      },
    },
    externalExecutionSession: {
      executionRequestId: "req-2",
      status: "active",
      providerType: "source-control",
      blockedReasons: [],
      reconciliation: {
        stateUpdateStatus: "pending-reconcile",
        nextPatchType: "external-action-pending",
      },
    },
    ideAgentResultNormalization: {
      status: "running",
      blockedReasons: [],
      normalizedResult: {
        reconciliationStatus: "pending-reconcile",
        nextPatchType: "external-action-pending",
      },
      evidenceRefs: [{ evidenceType: "execution-receipt", reference: "receipt-2" }],
    },
    ideAgentExecutorContract: {
      executorType: "local-runner",
      targetSurface: "local-terminal",
      selectedMode: "local-terminal",
    },
  });

  assert.equal(executionInvocationContract.status, "invoked");
  assert.equal(executionInvocationContract.invocationStage, "reconcile-pending");
  assert.equal(executionInvocationContract.invocationTarget.executorType, "local-runner");
});

test("execution invocation contract preserves blocked reasons from upstream contracts", () => {
  const { executionInvocationContract } = createExecutionInvocationContract({
    atomicExecutionEnvelope: {
      executionRequestId: "req-3",
      canDispatch: false,
      blockedReasons: ["approval-pending"],
      atomicityContract: {},
    },
    externalExecutionSession: {
      executionRequestId: "req-3",
      status: "blocked",
      blockedReasons: ["provider-capability-sync-unready"],
      reconciliation: {},
    },
    ideAgentResultNormalization: {
      status: "blocked",
      blockedReasons: ["workspace-path-missing"],
    },
  });

  assert.equal(executionInvocationContract.status, "blocked");
  assert.equal(executionInvocationContract.blockedReasons.includes("approval-pending"), true);
  assert.equal(executionInvocationContract.blockedReasons.includes("provider-capability-sync-unready"), true);
  assert.equal(executionInvocationContract.blockedReasons.includes("workspace-path-missing"), true);
  assert.equal(executionInvocationContract.summary.canInvoke, false);
});
