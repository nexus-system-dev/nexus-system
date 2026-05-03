function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function buildCommandPreview(commandConsoleView) {
  return normalizeArray(commandConsoleView.commands).slice(0, 5).map((command) => ({
    commandId: normalizeString(command.commandId, null),
    command: normalizeString(command.command, ""),
    status: normalizeString(command.status, "pending"),
    executionMode: normalizeString(command.executionMode, null),
  }));
}

export function createLocalCodingAgentAdapter({
  ideAgentExecutorContract = null,
  localDevelopmentBridge = null,
  actionToProviderMapping = null,
  commandConsoleView = null,
  fileEditorContract = null,
  developmentWorkspace = null,
} = {}) {
  const executorContract = normalizeObject(ideAgentExecutorContract);
  const localBridge = normalizeObject(localDevelopmentBridge);
  const mapping = normalizeObject(actionToProviderMapping);
  const consoleView = normalizeObject(commandConsoleView);
  const editor = normalizeObject(fileEditorContract);
  const workspace = normalizeObject(developmentWorkspace);
  const selectedMode = normalizeString(executorContract.selectedMode, "manual");
  const isLocalMode = selectedMode === "local-terminal";
  const status = executorContract.summary?.canExecuteInIde === true && isLocalMode ? "ready" : "blocked";
  const workspacePath = normalizeString(
    executorContract.handoff?.workspacePath,
    normalizeString(localBridge.environment?.workspacePath, null),
  );
  const activeFilePath = normalizeString(editor.editor?.activeFilePath, null);
  const blockedReasons = [
    isLocalMode ? null : "non-local-executor-mode",
    executorContract.summary?.canExecuteInIde === true ? null : "ide-executor-unready",
    localBridge.capabilities?.supportsCommandExecution === true ? null : "local-command-execution-unsupported",
    workspacePath ? null : "workspace-path-missing",
  ].filter(Boolean);

  return {
    localCodingAgentAdapter: {
      localCodingAgentAdapterId: `local-coding-agent:${normalizeString(mapping.actionToProviderMappingId, selectedMode)}`,
      status: blockedReasons.length === 0 ? status : "blocked",
      adapterMode: selectedMode,
      workspacePath,
      providerType: normalizeString(mapping.providerType, "generic"),
      targetSurface: normalizeString(mapping.targetSurface, selectedMode),
      handoff: {
        activeFilePath,
        commandPreview: buildCommandPreview(consoleView),
        focusedZone: normalizeString(workspace.navigation?.focusedZone, "code-zone"),
        requestedOperation: normalizeArray(mapping.operationTypes)[0] ?? null,
      },
      capabilities: {
        supportsCommandExecution: localBridge.capabilities?.supportsCommandExecution === true,
        supportsWriteback: localBridge.capabilities?.supportsWriteback === true,
        supportedActions: normalizeArray(localBridge.capabilities?.supportedActions),
      },
      guardrails: {
        requiresNexusContext: localBridge.guardrails?.requiresNexusContext !== false,
        handoffMode: normalizeString(localBridge.guardrails?.handoffMode, "optional-bridge"),
        isPrimaryWorkspace: localBridge.guardrails?.isPrimaryWorkspace === true,
      },
      blockedReasons,
      summary: {
        canRunLocalCodingAgent: blockedReasons.length === 0,
        hasWorkspaceBinding: Boolean(workspacePath),
        hasActiveFile: Boolean(activeFilePath),
      },
    },
  };
}
