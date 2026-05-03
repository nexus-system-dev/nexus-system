function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function resolveExecutorType({ executionModeDecision, remoteMacRunner, localDevelopmentBridge }) {
  const selectedMode = normalizeString(executionModeDecision.selectedMode, "manual");
  if (selectedMode === "xcode") {
    return normalizeString(remoteMacRunner.connection?.runnerType, "remote-xcode-runner");
  }
  if (selectedMode === "local-terminal") {
    return normalizeString(localDevelopmentBridge.connection?.runnerType, "local-runner");
  }
  return "ide-handoff-planned";
}

function resolveStatus({ executionModeDecision, remoteMacRunner, localDevelopmentBridge, actionToProviderMapping }) {
  const selectedMode = normalizeString(executionModeDecision.selectedMode, "manual");
  const mappingReady = actionToProviderMapping.summary?.isMapped === true;

  if (!mappingReady) {
    return "blocked";
  }

  if (selectedMode === "xcode") {
    return remoteMacRunner.summary?.isReady === true ? "ready" : "planned";
  }

  if (selectedMode === "local-terminal") {
    return localDevelopmentBridge.summary?.isReady === true ? "ready" : "planned";
  }

  return "planned";
}

export function defineIdeAgentExecutorContract({
  executionModeDecision = null,
  localDevelopmentBridge = null,
  remoteMacRunner = null,
  actionToProviderMapping = null,
  commandConsoleView = null,
} = {}) {
  const modeDecision = normalizeObject(executionModeDecision);
  const localBridge = normalizeObject(localDevelopmentBridge);
  const remoteRunner = normalizeObject(remoteMacRunner);
  const mapping = normalizeObject(actionToProviderMapping);
  const consoleView = normalizeObject(commandConsoleView);
  const selectedMode = normalizeString(modeDecision.selectedMode, "manual");
  const executorType = resolveExecutorType({
    executionModeDecision: modeDecision,
    remoteMacRunner: remoteRunner,
    localDevelopmentBridge: localBridge,
  });
  const status = resolveStatus({
    executionModeDecision: modeDecision,
    remoteMacRunner: remoteRunner,
    localDevelopmentBridge: localBridge,
    actionToProviderMapping: mapping,
  });
  const blockedReasons = [
    mapping.summary?.isMapped === true ? null : "action-provider-mapping-unready",
    selectedMode === "xcode" && remoteRunner.summary?.isReady !== true ? "remote-mac-runner-unready" : null,
    selectedMode === "local-terminal" && localBridge.summary?.isReady !== true ? "local-development-bridge-unready" : null,
  ].filter(Boolean);

  return {
    ideAgentExecutorContract: {
      ideAgentExecutorContractId: `ide-agent-executor:${normalizeString(mapping.actionToProviderMappingId, selectedMode)}`,
      status,
      selectedMode,
      executorType,
      targetSurface: normalizeString(mapping.targetSurface, selectedMode),
      providerType: normalizeString(mapping.providerType, "generic"),
      handoff: {
        workspacePath: normalizeString(localBridge.environment?.workspacePath, null),
        host: normalizeString(remoteRunner.connection?.host, null),
        requestedOperation: normalizeArray(mapping.operationTypes)[0] ?? null,
        commandPreview: normalizeArray(consoleView.commands).map((command) => command.command).slice(0, 3),
      },
      capabilities: {
        supportsLocalTerminal: localBridge.capabilities?.supportsCommandExecution === true,
        supportsRemoteAppleTooling: remoteRunner.capabilities?.supportsAppleTooling === true,
        supportedActions: normalizeArray(
          selectedMode === "xcode"
            ? remoteRunner.capabilities?.supportedActions
            : localBridge.capabilities?.supportedActions,
        ),
      },
      guardrails: {
        requiresNexusContext: localBridge.guardrails?.requiresNexusContext !== false,
        requiresApproval: remoteRunner.signing?.requiresManualApproval === true,
        handoffMode: normalizeString(localBridge.guardrails?.handoffMode, "optional-bridge"),
      },
      blockedReasons,
      summary: {
        canExecuteInIde: status === "ready",
        requiresLocalAdapter: selectedMode === "local-terminal",
        requiresRemoteAdapter: selectedMode === "xcode",
      },
    },
  };
}
