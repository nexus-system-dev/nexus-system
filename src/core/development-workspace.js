function normalizeProjectWorkbenchLayout(projectWorkbenchLayout = null) {
  return projectWorkbenchLayout && typeof projectWorkbenchLayout === "object" && !Array.isArray(projectWorkbenchLayout)
    ? projectWorkbenchLayout
    : {};
}

function normalizeFileEditorContract(fileEditorContract = null) {
  return fileEditorContract && typeof fileEditorContract === "object" && !Array.isArray(fileEditorContract)
    ? fileEditorContract
    : {};
}

function normalizeCommandConsoleView(commandConsoleView = null) {
  return commandConsoleView && typeof commandConsoleView === "object" && !Array.isArray(commandConsoleView)
    ? commandConsoleView
    : {};
}

export function createDevelopmentWorkspace({
  projectWorkbenchLayout = null,
  fileEditorContract = null,
  commandConsoleView = null,
} = {}) {
  const normalizedLayout = normalizeProjectWorkbenchLayout(projectWorkbenchLayout);
  const normalizedEditorContract = normalizeFileEditorContract(fileEditorContract);
  const normalizedConsoleView = normalizeCommandConsoleView(commandConsoleView);

  const activeTabs = Array.isArray(normalizedEditorContract.editor?.tabs)
    ? normalizedEditorContract.editor.tabs.filter((tab) => tab.isActive)
    : [];

  return {
    developmentWorkspace: {
      workspaceId:
        normalizedLayout.workspaceId
        ?? normalizedEditorContract.workspaceId
        ?? null,
      layoutId: normalizedLayout.layoutId ?? null,
      consoleId: normalizedConsoleView.consoleId ?? null,
      navigation: {
        primaryNavigation: Array.isArray(normalizedLayout.primaryNavigation)
          ? normalizedLayout.primaryNavigation
          : [],
        focusedZone: normalizedLayout.defaults?.focusedZone ?? "code-zone",
      },
      codeSurface: {
        fileTree: normalizedEditorContract.fileTree ?? { items: [] },
        editor: normalizedEditorContract.editor ?? {
          activeFilePath: null,
          tabs: [],
          supportsInlineDiff: false,
        },
        activeTabCount: activeTabs.length,
      },
      executionSurface: {
        commands: Array.isArray(normalizedConsoleView.commands) ? normalizedConsoleView.commands : [],
        logStreams: normalizedConsoleView.logStreams ?? { stdout: [], stderr: [] },
        agentCommandActivity: Array.isArray(normalizedConsoleView.agentCommandActivity)
          ? normalizedConsoleView.agentCommandActivity
          : [],
        status: normalizedConsoleView.status ?? "idle",
      },
      workspaceSummary: {
        totalPanels: Array.isArray(normalizedLayout.panels) ? normalizedLayout.panels.length : 0,
        totalFiles: normalizedEditorContract.fileTree?.items?.length ?? 0,
        totalCommands: normalizedConsoleView.summary?.totalCommands ?? 0,
        hasErrors: normalizedConsoleView.summary?.hasErrors ?? false,
      },
    },
  };
}
