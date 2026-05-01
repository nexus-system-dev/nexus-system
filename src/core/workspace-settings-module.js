function normalizeWorkspaceModel(workspaceModel) {
  return workspaceModel && typeof workspaceModel === "object" ? workspaceModel : {};
}

function normalizeSettingsInput(settingsInput) {
  return settingsInput && typeof settingsInput === "object" ? settingsInput : {};
}

export function createOrganizationWorkspaceSettingsModule({
  workspaceModel = null,
  settingsInput = null,
} = {}) {
  const normalizedWorkspaceModel = normalizeWorkspaceModel(workspaceModel);
  const normalizedSettingsInput = normalizeSettingsInput(settingsInput);

  return {
    workspaceSettings: {
      workspaceId: normalizedWorkspaceModel.workspaceId ?? null,
      defaultProjectVisibility: normalizedSettingsInput.defaultProjectVisibility ?? "private",
      defaultExecutionMode: normalizedSettingsInput.defaultExecutionMode ?? "guided",
      workspaceOperatingMode: Object.hasOwn(normalizedSettingsInput, "workspaceOperatingMode")
        ? normalizedSettingsInput.workspaceOperatingMode
        : undefined,
      defaultApprovalMode: normalizedSettingsInput.defaultApprovalMode ?? "required-for-sensitive-actions",
      policyProfile: normalizedSettingsInput.policyProfile ?? "balanced",
      teamPreferences: {
        notifications: normalizedSettingsInput.teamPreferences?.notifications ?? "digest",
        reviewStyle: normalizedSettingsInput.teamPreferences?.reviewStyle ?? "async",
        deployWindow: normalizedSettingsInput.teamPreferences?.deployWindow ?? "manual",
      },
      updatedAt: new Date().toISOString(),
    },
  };
}
