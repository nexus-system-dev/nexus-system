function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveMode(userPreferenceProfile, companionPresence) {
  const normalizedProfile = normalizeObject(userPreferenceProfile);
  const normalizedPresence = normalizeObject(companionPresence);
  const preferences = normalizeArray(normalizedProfile.preferences);
  const explicitMode = typeof normalizedProfile.companionMode === "string"
    ? normalizedProfile.companionMode.trim().toLowerCase()
    : "";

  if (["quiet", "assistive", "active"].includes(explicitMode)) {
    return explicitMode;
  }

  if (preferences.some((preference) => normalizeObject(preference).label === "quiet-mode")) {
    return "quiet";
  }

  if (normalizedPresence.summary?.canInterrupt === true || normalizedPresence.urgency === "high") {
    return "active";
  }

  return "assistive";
}

function buildAvailableModes(selectedMode) {
  return ["quiet", "assistive", "active"].map((mode) => ({
    mode,
    selected: mode === selectedMode,
  }));
}

function buildSummary(selectedMode, companionPresence) {
  const normalizedPresence = normalizeObject(companionPresence);

  return {
    selectedMode,
    presenceVisible: normalizedPresence.visible === true,
    allowsInterruptions: selectedMode === "active",
    prefersAmbientSupport: selectedMode === "assistive",
    suppressesCompanion: selectedMode === "quiet",
  };
}

export function createCompanionModeControls({
  userPreferenceProfile = null,
  companionPresence = null,
} = {}) {
  const normalizedProfile = normalizeObject(userPreferenceProfile);
  const normalizedPresence = normalizeObject(companionPresence);
  const selectedMode = resolveMode(normalizedProfile, normalizedPresence);

  return {
    companionModeSettings: {
      settingsId: `companion-mode:${normalizedProfile.profileId ?? normalizedPresence.presenceId ?? "project"}`,
      selectedMode,
      availableModes: buildAvailableModes(selectedMode),
      visibilityOverride: selectedMode === "quiet" ? "suppress" : selectedMode === "active" ? "prominent" : "ambient",
      summary: buildSummary(selectedMode, normalizedPresence),
    },
  };
}
