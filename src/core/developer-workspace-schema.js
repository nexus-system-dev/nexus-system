function normalizeProjectState(projectState = null) {
  return projectState && typeof projectState === "object" && !Array.isArray(projectState)
    ? projectState
    : {};
}

function normalizeExecutionState(executionState = null) {
  return executionState && typeof executionState === "object" && !Array.isArray(executionState)
    ? executionState
    : {};
}

function buildFileTree(projectState) {
  const artifactPaths = Array.isArray(projectState.storageRecord?.artifacts)
    ? projectState.storageRecord.artifacts.map((item) => item.path).filter(Boolean)
    : [];
  const attachmentPaths = Array.isArray(projectState.storageRecord?.attachments)
    ? projectState.storageRecord.attachments.map((item) => item.path).filter(Boolean)
    : [];
  const diffPaths = [
    ...(Array.isArray(projectState.diffPreview?.affectedAreas?.codePaths) ? projectState.diffPreview.affectedAreas.codePaths : []),
    ...(Array.isArray(projectState.diffPreview?.affectedAreas?.migrationPaths)
      ? projectState.diffPreview.affectedAreas.migrationPaths
      : []),
  ].filter(Boolean);

  const uniquePaths = [...new Set([...artifactPaths, ...attachmentPaths, ...diffPaths])];

  return {
    rootLabel: projectState.projectName ?? projectState.projectId ?? "project",
    items: uniquePaths.map((path, index) => ({
      fileId: `workspace-file-${index + 1}`,
      path,
      name: String(path).split("/").pop() ?? path,
      source:
        artifactPaths.includes(path)
          ? "artifact-storage"
          : attachmentPaths.includes(path)
            ? "attachment-storage"
            : "diff-preview",
    })),
    totalFiles: uniquePaths.length,
  };
}

function buildEditorState(projectState, fileTree) {
  const openPaths = [
    ...(Array.isArray(projectState.diffPreview?.affectedAreas?.codePaths) ? projectState.diffPreview.affectedAreas.codePaths : []),
    ...(Array.isArray(projectState.diffPreview?.affectedAreas?.migrationPaths)
      ? projectState.diffPreview.affectedAreas.migrationPaths
      : []),
  ].filter(Boolean);
  const uniqueOpenPaths = [...new Set(openPaths)];

  return {
    activeFilePath: uniqueOpenPaths[0] ?? fileTree.items[0]?.path ?? null,
    openFiles: uniqueOpenPaths.map((path, index) => ({
      tabId: `editor-tab-${index + 1}`,
      path,
      isDirty: false,
      hasDiff: true,
    })),
    diffAware: uniqueOpenPaths.length > 0,
  };
}

function buildTerminalState(executionState) {
  const commands = Array.isArray(executionState.bootstrapPlannedCommands)
    ? executionState.bootstrapPlannedCommands.flatMap((item) => item.commands ?? [])
    : [];
  const formattedLogs = Array.isArray(executionState.formattedLogs) ? executionState.formattedLogs : [];

  return {
    status: executionState.progressState?.status ?? "idle",
    commandHistory: commands.map((command, index) => ({
      commandId: `workspace-command-${index + 1}`,
      command: [command.command, ...(Array.isArray(command.args) ? command.args : [])].filter(Boolean).join(" "),
      executionMode: command.executionMode ?? null,
    })),
    outputPreview: formattedLogs.slice(-5),
  };
}

function buildDiffPanel(projectState) {
  return {
    headline: projectState.diffPreview?.headline ?? "אין diff זמין",
    totalChanges: projectState.diffPreview?.summary?.totalChanges ?? 0,
    requiresApproval: projectState.diffPreview?.approvalGuidance?.required ?? false,
    sections: {
      code: Array.isArray(projectState.diffPreview?.sections?.code) ? projectState.diffPreview.sections.code : [],
      migrations: Array.isArray(projectState.diffPreview?.sections?.migrations)
        ? projectState.diffPreview.sections.migrations
        : [],
      infra: Array.isArray(projectState.diffPreview?.sections?.infra) ? projectState.diffPreview.sections.infra : [],
    },
  };
}

function buildLogsPanel(executionState) {
  const formattedLogs = Array.isArray(executionState.formattedLogs) ? executionState.formattedLogs : [];
  const platformLogs = Array.isArray(executionState.platformLogs) ? executionState.platformLogs : [];

  return {
    totalLogs: formattedLogs.length + platformLogs.length,
    recentLogs: formattedLogs.slice(-10),
    platformSignals: platformLogs.slice(-5),
    hasErrors: [...formattedLogs, ...platformLogs].some((entry) => entry?.level === "error"),
  };
}

function buildAgentActivity(executionState) {
  const assignments = Array.isArray(executionState.bootstrapAssignments) ? executionState.bootstrapAssignments : [];
  const taskResults = Array.isArray(executionState.taskResults) ? executionState.taskResults : [];

  return {
    assignedAgents: [...new Set(assignments.map((item) => item.targetId).filter(Boolean))],
    assignments: assignments.map((item) => ({
      assignmentId: item.assignmentId,
      taskId: item.taskId,
      targetId: item.targetId,
      status: item.status,
      dispatchMode: item.dispatchMode,
    })),
    recentResults: taskResults.slice(-5),
  };
}

export function defineDeveloperWorkspaceSchema({
  projectState = null,
  executionState = null,
} = {}) {
  const normalizedProjectState = normalizeProjectState(projectState);
  const normalizedExecutionState = normalizeExecutionState(executionState);
  const fileTree = buildFileTree(normalizedProjectState);
  const editor = buildEditorState(normalizedProjectState, fileTree);

  return {
    developerWorkspace: {
      workspaceId: `developer-workspace:${normalizedProjectState.projectId ?? "unknown-project"}`,
      screenType: "workspace",
      layout: "developer-workbench",
      fileTree,
      editor,
      terminal: buildTerminalState(normalizedExecutionState),
      diffPanel: buildDiffPanel(normalizedProjectState),
      logsPanel: buildLogsPanel(normalizedExecutionState),
      agentActivity: buildAgentActivity(normalizedExecutionState),
      contextSummary: {
        progressStatus: normalizedExecutionState.progressState?.status ?? "idle",
        progressPercent: normalizedExecutionState.progressPercent ?? 0,
        nextAction: normalizedProjectState.recommendedActions?.[0]?.title ?? null,
        incidentStatus: normalizedExecutionState.incidentAlert?.status ?? "clear",
      },
    },
  };
}
