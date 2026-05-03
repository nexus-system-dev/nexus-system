import test from "node:test";
import assert from "node:assert/strict";

import { createIdeAgentResultNormalizer } from "../src/core/ide-agent-result-normalizer.js";

test("IDE agent result normalizer creates running normalized result from active session", () => {
  const { ideAgentResultNormalization } = createIdeAgentResultNormalizer({
    ideAgentExecutorContract: {
      executorType: "local-runner",
      targetSurface: "local-terminal",
    },
    localCodingAgentAdapter: {
      adapterMode: "local-terminal",
      providerType: "source-control",
      targetSurface: "local-terminal",
      blockedReasons: [],
    },
    externalExecutionResult: {
      providerResultStatus: "accepted",
      dispatchDecision: "accepted",
      lifecycleState: "reconcile-pending",
      storedEvidence: [{ evidenceType: "provider-receipt", reference: "dispatch-receipt:req-1" }],
      blockedReasons: [],
    },
    externalExecutionSession: {
      executionRequestId: "req-1",
      providerType: "source-control",
      status: "active",
      lifecycleState: "reconcile-pending",
      receipt: {
        receiptId: "dispatch-receipt:req-1",
      },
      reconciliation: {
        stateUpdateStatus: "pending-reconcile",
        nextPatchType: "external-action-pending",
      },
      blockedReasons: [],
    },
    commandConsoleView: {
      consoleId: "command-console:test-project",
      summary: {
        totalCommands: 2,
        stdoutLines: 4,
        stderrLines: 0,
        hasErrors: false,
      },
    },
  });

  assert.equal(ideAgentResultNormalization.status, "running");
  assert.equal(ideAgentResultNormalization.normalizedResult.nextAction, "await-ide-agent-result");
  assert.equal(ideAgentResultNormalization.summary.isNormalized, true);
  assert.equal(ideAgentResultNormalization.consoleSummary.totalCommands, 2);
  assert.equal(ideAgentResultNormalization.evidenceRefs.length >= 2, true);
});

test("IDE agent result normalizer blocks when upstream adapter or session is blocked", () => {
  const { ideAgentResultNormalization } = createIdeAgentResultNormalizer({
    localCodingAgentAdapter: {
      adapterMode: "local-terminal",
      blockedReasons: ["workspace-path-missing"],
    },
    externalExecutionResult: {
      providerResultStatus: "not-dispatched",
      blockedReasons: ["provider-disconnected"],
    },
    externalExecutionSession: {
      executionRequestId: "req-2",
      status: "blocked",
      blockedReasons: ["approval-pending"],
      reconciliation: {
        stateUpdateStatus: "blocked",
        nextPatchType: "no-op",
      },
    },
    commandConsoleView: {
      summary: {
        totalCommands: 0,
        stdoutLines: 0,
        stderrLines: 0,
        hasErrors: false,
      },
    },
  });

  assert.equal(ideAgentResultNormalization.status, "blocked");
  assert.equal(ideAgentResultNormalization.blockedReasons.includes("workspace-path-missing"), true);
  assert.equal(ideAgentResultNormalization.blockedReasons.includes("approval-pending"), true);
  assert.equal(ideAgentResultNormalization.normalizedResult.nextAction, "resolve-blockers");
  assert.equal(ideAgentResultNormalization.summary.isNormalized, false);
});

test("IDE agent result normalizer marks failed console runs for explicit inspection", () => {
  const { ideAgentResultNormalization } = createIdeAgentResultNormalizer({
    ideAgentExecutorContract: {
      executorType: "local-runner",
    },
    localCodingAgentAdapter: {
      adapterMode: "local-terminal",
      blockedReasons: [],
    },
    externalExecutionResult: {
      providerResultStatus: "accepted",
      dispatchDecision: "accepted",
      blockedReasons: [],
    },
    externalExecutionSession: {
      executionRequestId: "req-3",
      status: "active",
      blockedReasons: [],
      reconciliation: {
        stateUpdateStatus: "pending-reconcile",
        nextPatchType: "external-action-pending",
      },
    },
    commandConsoleView: {
      summary: {
        totalCommands: 1,
        stdoutLines: 0,
        stderrLines: 2,
        hasErrors: true,
      },
    },
  });

  assert.equal(ideAgentResultNormalization.status, "failed");
  assert.equal(ideAgentResultNormalization.normalizedResult.nextAction, "inspect-console-errors");
  assert.equal(ideAgentResultNormalization.summary.canPromoteToArtifactCollection, false);
});
