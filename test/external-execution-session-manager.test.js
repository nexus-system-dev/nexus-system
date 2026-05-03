import test from "node:test";
import assert from "node:assert/strict";

import { createExternalExecutionSessionManager } from "../src/core/external-execution-session-manager.js";

test("external execution session manager creates active session state for dispatched execution", () => {
  const { externalExecutionSession } = createExternalExecutionSessionManager({
    externalExecutionResult: {
      executionRequestId: "req-1",
      providerType: "hosting",
      status: "dispatched",
      lifecycleState: "reconcile-pending",
      receipt: {
        receiptId: "dispatch-receipt:req-1",
      },
      stateUpdateProposal: {
        status: "pending-reconcile",
        patchType: "external-action-pending",
      },
      blockedReasons: [],
    },
    executionProviderCapabilitySync: {
      executionProviderCapabilitySyncId: "execution-provider-capability-sync:hosting",
      summary: {
        isSynchronized: true,
      },
    },
    actionToProviderMapping: {
      providerType: "hosting",
      targetSurface: "local-terminal",
    },
  });

  assert.equal(externalExecutionSession.status, "active");
  assert.equal(externalExecutionSession.summary.hasReceipt, true);
  assert.equal(externalExecutionSession.summary.isDispatchActive, true);
  assert.equal(externalExecutionSession.reconciliation.nextAction, "await-provider-result");
});

test("external execution session manager blocks session when capability sync is not ready", () => {
  const { externalExecutionSession } = createExternalExecutionSessionManager({
    externalExecutionResult: {
      executionRequestId: "req-2",
      providerType: "hosting",
      status: "dispatched",
      lifecycleState: "reconcile-pending",
      stateUpdateProposal: {
        status: "pending-reconcile",
        patchType: "external-action-pending",
      },
      blockedReasons: [],
    },
    executionProviderCapabilitySync: {
      executionProviderCapabilitySyncId: "execution-provider-capability-sync:hosting",
      summary: {
        isSynchronized: false,
      },
    },
    actionToProviderMapping: {
      providerType: "hosting",
      targetSurface: "local-terminal",
    },
  });

  assert.equal(externalExecutionSession.status, "blocked");
  assert.equal(externalExecutionSession.blockedReasons.includes("provider-capability-sync-unready"), true);
  assert.equal(externalExecutionSession.summary.isDispatchActive, false);
});

test("external execution session manager preserves blocked dispatch reasons", () => {
  const { externalExecutionSession } = createExternalExecutionSessionManager({
    externalExecutionResult: {
      executionRequestId: "req-3",
      providerType: "hosting",
      status: "blocked",
      lifecycleState: "prepare-blocked",
      stateUpdateProposal: {
        status: "blocked",
        patchType: "no-op",
      },
      blockedReasons: ["approval-pending"],
    },
    executionProviderCapabilitySync: {
      executionProviderCapabilitySyncId: "execution-provider-capability-sync:hosting",
      summary: {
        isSynchronized: true,
      },
    },
    actionToProviderMapping: {
      providerType: "hosting",
      targetSurface: "local-terminal",
    },
  });

  assert.equal(externalExecutionSession.status, "blocked");
  assert.equal(externalExecutionSession.blockedReasons.includes("approval-pending"), true);
  assert.equal(externalExecutionSession.reconciliation.nextAction, "resolve-blockers");
});
