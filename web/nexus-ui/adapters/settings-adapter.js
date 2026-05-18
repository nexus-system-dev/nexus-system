function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function buildTabItems(activePanel) {
  return [
    { key: "profile", label: "פרופיל", icon: "◌", active: activePanel === "profile" },
    { key: "notifications", label: "התראות", icon: "◔", active: activePanel === "notifications" },
    { key: "security", label: "אבטחה", icon: "⛨", active: activePanel === "security" },
    { key: "appearance", label: "מראה", icon: "◈", active: activePanel === "appearance" },
  ];
}

export function buildSettingsViewModel({
  settingsProfileSurface = null,
  activePanel = "profile",
  savingState = "idle",
  flashMessage = "",
  errorMessage = "",
} = {}) {
  const surface = normalizeObject(settingsProfileSurface);
  const actorProfile = normalizeObject(surface.actorProfile);
  const workspaceSettings = normalizeObject(surface.workspaceSettings);
  const notificationPreferences = normalizeObject(surface.notificationPreferences);
  const securitySettings = normalizeObject(surface.securitySettings);
  const actorName = normalizeString(actorProfile.displayName, "Local operator");
  const actorEmail = normalizeString(actorProfile.email, "local-operator@nexus.local");

  return {
    title: "הגדרות",
    subtitle: "נהל את הפרופיל והעדפות המערכת שלך",
    activePanel,
    tabItems: buildTabItems(activePanel),
    savingState,
    flashMessage: normalizeString(flashMessage),
    errorMessage: normalizeString(errorMessage),
    profile: {
      displayName: actorName,
      email: actorEmail,
      role: normalizeString(actorProfile.role, "owner"),
    },
    preferences: {
      preferredLanguage: normalizeString(workspaceSettings.preferredLanguage, "he"),
      themePreference: normalizeString(workspaceSettings.themePreference, "light"),
      emailEnabled: notificationPreferences.emailEnabled !== false,
      inAppEnabled: notificationPreferences.inAppEnabled !== false,
    },
    security: {
      mfaDecision: normalizeString(securitySettings.mfaDecision, "unknown"),
      trustLevel: normalizeString(securitySettings.trustLevel, "known-user"),
    },
  };
}
