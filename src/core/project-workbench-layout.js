function normalizeDeveloperWorkspace(developerWorkspace = null) {
  return developerWorkspace && typeof developerWorkspace === "object" && !Array.isArray(developerWorkspace)
    ? developerWorkspace
    : {};
}

function normalizeScreenTemplateSchema(screenTemplateSchema = null) {
  return screenTemplateSchema && typeof screenTemplateSchema === "object" && !Array.isArray(screenTemplateSchema)
    ? screenTemplateSchema
    : {
        templateId: "workspace-template",
        templateType: "workspace",
        supportsAssistant: true,
        supportsPanels: true,
      };
}

function buildZones(workspace, template) {
  return [
    {
      zoneId: "code-zone",
      title: "Code",
      region: "center",
      panels: ["file-tree", "editor-tabs", "editor-surface"],
      defaultWidth: "fluid",
    },
    {
      zoneId: "activity-zone",
      title: "Activity",
      region: "left",
      panels: ["agent-activity", "diff-summary"],
      defaultWidth: "320px",
    },
    {
      zoneId: "output-zone",
      title: "Output",
      region: "bottom",
      panels: ["terminal", "logs", "artifacts"],
      defaultHeight: "280px",
    },
    {
      zoneId: "assistant-zone",
      title: "Assistant",
      region: "right",
      panels: template.supportsAssistant ? ["contextual-assistant", "next-action"] : ["next-action"],
      defaultWidth: "320px",
    },
  ].map((zone) => ({
    ...zone,
    isActive:
      zone.zoneId === "code-zone"
      || (zone.zoneId === "assistant-zone" && Boolean(workspace.contextSummary?.nextAction))
      || (zone.zoneId === "output-zone" && (workspace.logsPanel?.totalLogs ?? 0) > 0)
      || (zone.zoneId === "activity-zone" && (workspace.diffPanel?.totalChanges ?? 0) > 0),
  }));
}

function buildPanels(workspace) {
  return [
    {
      panelId: "file-tree",
      type: "navigator",
      itemCount: workspace.fileTree?.totalFiles ?? 0,
      status: (workspace.fileTree?.totalFiles ?? 0) > 0 ? "ready" : "empty",
    },
    {
      panelId: "editor-surface",
      type: "editor",
      itemCount: Array.isArray(workspace.editor?.openFiles) ? workspace.editor.openFiles.length : 0,
      status: workspace.editor?.activeFilePath ? "ready" : "empty",
    },
    {
      panelId: "terminal",
      type: "console",
      itemCount: Array.isArray(workspace.terminal?.commandHistory) ? workspace.terminal.commandHistory.length : 0,
      status: workspace.terminal?.status ?? "idle",
    },
    {
      panelId: "logs",
      type: "log-stream",
      itemCount: workspace.logsPanel?.totalLogs ?? 0,
      status: workspace.logsPanel?.hasErrors ? "attention" : "ready",
    },
    {
      panelId: "diff-summary",
      type: "diff",
      itemCount: workspace.diffPanel?.totalChanges ?? 0,
      status: (workspace.diffPanel?.totalChanges ?? 0) > 0 ? "ready" : "empty",
    },
    {
      panelId: "agent-activity",
      type: "activity",
      itemCount: Array.isArray(workspace.agentActivity?.assignments) ? workspace.agentActivity.assignments.length : 0,
      status: Array.isArray(workspace.agentActivity?.assignments) && workspace.agentActivity.assignments.length > 0
        ? "ready"
        : "idle",
    },
    {
      panelId: "contextual-assistant",
      type: "assistant",
      itemCount: workspace.contextSummary?.nextAction ? 1 : 0,
      status: workspace.contextSummary?.nextAction ? "ready" : "idle",
    },
    {
      panelId: "next-action",
      type: "guidance",
      itemCount: workspace.contextSummary?.nextAction ? 1 : 0,
      status: workspace.contextSummary?.nextAction ? "ready" : "idle",
    },
    {
      panelId: "artifacts",
      type: "output",
      itemCount: workspace.fileTree?.items?.filter((item) => item.source === "artifact-storage").length ?? 0,
      status:
        (workspace.fileTree?.items?.filter((item) => item.source === "artifact-storage").length ?? 0) > 0
          ? "ready"
          : "empty",
    },
  ];
}

export function createProjectWorkbenchLayout({
  developerWorkspace = null,
  screenTemplateSchema = null,
} = {}) {
  const normalizedWorkspace = normalizeDeveloperWorkspace(developerWorkspace);
  const normalizedTemplate = normalizeScreenTemplateSchema(screenTemplateSchema);
  const zones = buildZones(normalizedWorkspace, normalizedTemplate);
  const panels = buildPanels(normalizedWorkspace);

  return {
    projectWorkbenchLayout: {
      layoutId: `project-workbench:${normalizedWorkspace.workspaceId ?? "unknown-workspace"}`,
      workspaceId: normalizedWorkspace.workspaceId ?? null,
      templateId: normalizedTemplate.templateId,
      templateType: normalizedTemplate.templateType,
      zones,
      panels,
      defaults: {
        focusedZone: "code-zone",
        outputCollapsed: false,
        assistantPinned: normalizedTemplate.supportsAssistant !== false,
      },
      primaryNavigation: ["code-zone", "activity-zone", "output-zone", "assistant-zone"],
    },
  };
}
