function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function unique(values = []) {
  return [...new Set(normalizeArray(values))];
}

function resolveStatus({ session, adapter, result, consoleView }) {
  if (normalizeArray(session.blockedReasons).length > 0 || normalizeArray(adapter.blockedReasons).length > 0) {
    return "blocked";
  }
  if (consoleView.summary?.hasErrors === true) {
    return "failed";
  }
  if (normalizeString(result.providerResultStatus) === "accepted" && normalizeString(session.status) === "active") {
    return "running";
  }
  return "planned";
}

function resolveNextAction(status) {
  if (status === "blocked") {
    return "resolve-blockers";
  }
  if (status === "failed") {
    return "inspect-console-errors";
  }
  if (status === "running") {
    return "await-ide-agent-result";
  }
  return "manual-review";
}

function buildEvidenceRefs({ result, session, consoleView }) {
  const storedEvidence = normalizeArray(result.storedEvidence).map((entry) => ({
    evidenceType: normalizeString(entry.evidenceType, "unknown"),
    reference: normalizeString(entry.reference, null),
  }));

  if (consoleView.summary?.totalCommands > 0) {
    storedEvidence.push({
      evidenceType: "command-console",
      reference: normalizeString(consoleView.consoleId, null),
    });
  }

  if (session.receipt?.receiptId) {
    storedEvidence.push({
      evidenceType: "execution-receipt",
      reference: normalizeString(session.receipt.receiptId, null),
    });
  }

  return storedEvidence.filter((entry) => entry.reference);
}

export function createIdeAgentResultNormalizer({
  ideAgentExecutorContract = null,
  localCodingAgentAdapter = null,
  externalExecutionResult = null,
  externalExecutionSession = null,
  commandConsoleView = null,
} = {}) {
  const contract = normalizeObject(ideAgentExecutorContract);
  const adapter = normalizeObject(localCodingAgentAdapter);
  const result = normalizeObject(externalExecutionResult);
  const session = normalizeObject(externalExecutionSession);
  const consoleView = normalizeObject(commandConsoleView);
  const resolvedStatus = resolveStatus({ session, adapter, result, consoleView });
  const blockedReasons = unique([
    ...normalizeArray(adapter.blockedReasons),
    ...normalizeArray(session.blockedReasons),
    ...normalizeArray(result.blockedReasons),
  ]);
  const status = blockedReasons.length > 0 ? "blocked" : resolvedStatus;

  return {
    ideAgentResultNormalization: {
      ideAgentResultNormalizationId: `ide-agent-result:${normalizeString(session.executionRequestId, "unknown-request")}`,
      status,
      executorType: normalizeString(contract.executorType, normalizeString(adapter.adapterMode, "manual")),
      providerType: normalizeString(session.providerType, normalizeString(adapter.providerType, "generic")),
      executionRequestId: normalizeString(session.executionRequestId, null),
      targetSurface: normalizeString(contract.targetSurface, normalizeString(adapter.targetSurface, null)),
      normalizedResult: {
        lifecycleState: normalizeString(session.lifecycleState, normalizeString(result.lifecycleState, "prepare-blocked")),
        providerResultStatus: normalizeString(result.providerResultStatus, "unknown"),
        dispatchDecision: normalizeString(result.dispatchDecision, "blocked"),
        reconciliationStatus: normalizeString(session.reconciliation?.stateUpdateStatus, "missing"),
        nextPatchType: normalizeString(session.reconciliation?.nextPatchType, "no-op"),
        nextAction: resolveNextAction(status),
      },
      consoleSummary: {
        consoleId: normalizeString(consoleView.consoleId, null),
        totalCommands: Number.isFinite(consoleView.summary?.totalCommands) ? consoleView.summary.totalCommands : 0,
        stdoutLines: Number.isFinite(consoleView.summary?.stdoutLines) ? consoleView.summary.stdoutLines : 0,
        stderrLines: Number.isFinite(consoleView.summary?.stderrLines) ? consoleView.summary.stderrLines : 0,
        hasErrors: consoleView.summary?.hasErrors === true,
      },
      evidenceRefs: buildEvidenceRefs({ result, session, consoleView }),
      blockedReasons,
      summary: {
        isNormalized: blockedReasons.length === 0,
        hasReceipt: Boolean(session.receipt?.receiptId),
        canPromoteToArtifactCollection: blockedReasons.length === 0 && status !== "failed",
      },
    },
  };
}
