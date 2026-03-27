function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizePanel(panel, fallbackId, fallbackStatus = "idle") {
  const normalizedPanel = normalizeObject(panel);

  return {
    panelId: normalizedPanel.panelId ?? fallbackId,
    status: normalizedPanel.status ?? fallbackStatus,
  };
}

function resolveRefreshMode(liveUpdateChannel) {
  const transportMode = liveUpdateChannel.transportMode ?? "polling";
  return transportMode === "polling" ? "scheduled-refresh" : "reactive-push";
}

export function createReactiveWorkspaceRefreshModel({
  liveUpdateChannel = null,
  developerWorkspace = null,
} = {}) {
  const normalizedChannel = normalizeObject(liveUpdateChannel);
  const normalizedWorkspace = normalizeObject(developerWorkspace);
  const refreshMode = resolveRefreshMode(normalizedChannel);

  const progressStatus = normalizedWorkspace.contextSummary?.progressStatus ?? normalizedWorkspace.terminal?.status ?? "idle";
  const progressPercent = normalizedWorkspace.contextSummary?.progressPercent ?? 0;
  const diffPanel = normalizePanel(normalizedWorkspace.diffPanel, "workspace-diff-panel");
  const logsPanel = normalizePanel(normalizedWorkspace.logsPanel, "workspace-logs-panel");
  const artifactPanel = normalizePanel(normalizedWorkspace.artifactPanel, "workspace-artifact-panel");

  return {
    reactiveWorkspaceState: {
      refreshStateId: `reactive-workspace:${normalizedWorkspace.workspaceId ?? normalizedChannel.channelId ?? "project"}`,
      channelId: normalizedChannel.channelId ?? null,
      refreshMode,
      live: normalizedChannel.summary?.isLive ?? false,
      progressBar: {
        status: progressStatus,
        percent: progressPercent,
        animated: refreshMode !== "scheduled-refresh" && progressStatus !== "done",
      },
      panelRefreshes: {
        terminal: {
          panelId: normalizedWorkspace.workspaceId ? `${normalizedWorkspace.workspaceId}:terminal` : "workspace-terminal",
          refreshBehavior: refreshMode,
          status: normalizedWorkspace.terminal?.status ?? "idle",
        },
        diff: {
          panelId: diffPanel.panelId,
          refreshBehavior: refreshMode,
          status: normalizedWorkspace.diffPanel?.status
            ?? ((normalizedWorkspace.diffPanel?.totalChanges ?? 0) > 0 ? "changed" : "idle"),
        },
        logs: {
          panelId: logsPanel.panelId,
          refreshBehavior: refreshMode,
          status: logsPanel.hasErrors ? "degraded" : "active",
        },
        artifacts: {
          panelId: artifactPanel.panelId,
          refreshBehavior: refreshMode,
          status: artifactPanel.status ?? "active",
        },
      },
      diffState: {
        headline: normalizedWorkspace.diffPanel?.headline ?? "אין diff זמין",
        totalChanges: normalizedWorkspace.diffPanel?.totalChanges ?? 0,
        requiresApproval: normalizedWorkspace.diffPanel?.requiresApproval ?? false,
      },
      artifactView: {
        totalFiles: normalizedWorkspace.fileTree?.totalFiles ?? 0,
        hasOutputPreview: Array.isArray(normalizedWorkspace.terminal?.outputPreview)
          && normalizedWorkspace.terminal.outputPreview.length > 0,
      },
      summary: {
        workspaceId: normalizedWorkspace.workspaceId ?? null,
        refreshMode,
        isLive: normalizedChannel.summary?.isLive ?? false,
        totalTopics: normalizedChannel.subscriptions?.totalTopics ?? 0,
      },
    },
  };
}
