const WORKSPACE_MODE_DEFINITIONS = Object.freeze({
  "user-only": Object.freeze({
    actor: "user",
    aiUsageLevel: "none",
    expectedCostProfile: "low",
    enforcementLevel: "lenient",
  }),
  hybrid: Object.freeze({
    actor: "user+system",
    aiUsageLevel: "medium",
    expectedCostProfile: "medium",
    enforcementLevel: "balanced",
  }),
  autonomous: Object.freeze({
    actor: "system",
    aiUsageLevel: "high",
    expectedCostProfile: "high",
    enforcementLevel: "strict",
  }),
});

function normalizeWorkspaceSettings(workspaceSettings) {
  return workspaceSettings && typeof workspaceSettings === "object" ? workspaceSettings : {};
}

export function createWorkspaceOperatingModeResolver({
  workspaceSettings,
} = {}) {
  const normalizedWorkspaceSettings = normalizeWorkspaceSettings(workspaceSettings);
  const storedWorkspaceOperatingMode = normalizedWorkspaceSettings.workspaceOperatingMode;
  const resolvedWorkspaceOperatingMode = Object.hasOwn(
    WORKSPACE_MODE_DEFINITIONS,
    storedWorkspaceOperatingMode,
  )
    ? storedWorkspaceOperatingMode
    : "user-only";

  return {
    workspaceMode: {
      type: resolvedWorkspaceOperatingMode,
    },
    workspaceModeDefinitions: WORKSPACE_MODE_DEFINITIONS,
  };
}
