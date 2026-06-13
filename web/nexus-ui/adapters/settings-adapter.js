function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildTabItems(activePanel) {
  return [
    { key: "profile", label: "פרופיל", icon: "◌", active: activePanel === "profile" },
    { key: "notifications", label: "התראות", icon: "◔", active: activePanel === "notifications" },
    { key: "security", label: "אבטחה", icon: "⛨", active: activePanel === "security" },
    { key: "account", label: "חשבון", icon: "⌁", active: activePanel === "account" },
    { key: "privacy", label: "פרטיות", icon: "◇", active: activePanel === "privacy" },
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
  const accountBoundary = normalizeObject(surface.accountBoundary);
  const privacyCenter = normalizeObject(surface.privacyCenter);
  const privacyRights = normalizeObject(privacyCenter.rights);
  const supabasePersistenceDecision = normalizeObject(surface.supabasePersistenceDecision);
  const linkedTruth = normalizeObject(accountBoundary.linkedTruth);
  const privacyTruth = normalizeObject(linkedTruth.privacy);
  const billingTruth = normalizeObject(linkedTruth.billing);
  const teamTruth = normalizeObject(linkedTruth.team);
  const providerTruth = normalizeObject(linkedTruth.providerIdentity);
  const externalIdentityTruth = normalizeObject(linkedTruth.externalIdentity);
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
    account: {
      status: normalizeString(accountBoundary.status, "ready"),
      sessionStatus: normalizeString(accountBoundary.activeSession?.status, "unknown"),
      authMethod: normalizeString(accountBoundary.accountSecurity?.authMethod, "password"),
      verificationStatus: normalizeString(accountBoundary.userIdentity?.verificationStatus, "unknown"),
      deletionStatus: normalizeString(surface.accountBoundary?.accountDeletionRequest?.status, ""),
      canChangePassword: normalizeArray(accountBoundary.accountSecurity?.availableActions).includes("change-password"),
      boundaries: [
        `פרטיות: ${normalizeString(privacyTruth.status, "מקושר למשימת פרטיות")}`,
        `צוות: ${normalizeString(teamTruth.role, "בעלים")} · ${normalizeString(teamTruth.status, "פעיל")}`,
        `בילינג: ${normalizeString(billingTruth.status, "לא פעיל עכשיו")}`,
        `ספקים: ${normalizeString(providerTruth.status, "דורש אישור נפרד")}`,
        `כניסה ארגונית: ${normalizeString(externalIdentityTruth.status, "לא נסגר כאן")}`,
      ],
      activityItems: normalizeArray(accountBoundary.accountActivityHistory).slice(-6).reverse().map((entry) => ({
        title: normalizeString(entry.summary, "פעולת חשבון"),
        status: normalizeString(entry.status, "completed"),
        occurredAt: normalizeString(entry.occurredAt, ""),
      })),
    },
    privacy: {
      taskId: normalizeString(privacyCenter.taskId, ""),
      status: normalizeString(privacyCenter.status, "blocked-auth-required"),
      title: normalizeString(privacyCenter.userFacing?.title, "פרטיות ונתונים"),
      summary: normalizeString(
        privacyCenter.userFacing?.summary,
        "כאן מוצג מה נשמר ומה ניתן לייצא או למחוק בפועל.",
      ),
      deletionPromise: normalizeString(
        privacyCenter.userFacing?.deletionPromise,
        "מחיקה לא מוצגת כמיידית אם יש שמירה מוצדקת.",
      ),
      inventoryItems: normalizeArray(privacyCenter.dataInventory).map((item) => ({
        key: normalizeString(item.key, "unknown"),
        label: normalizeString(item.label, "מידע"),
        status: normalizeString(item.status, "unknown"),
        retentionBoundary: normalizeString(item.retentionBoundary, ""),
        deleteState: normalizeString(item.deleteState, ""),
      })),
      consentItems: normalizeArray(privacyCenter.consentStates).map((item) => ({
        key: normalizeString(item.key, "unknown"),
        label: normalizeString(item.label, "הסכמה"),
        status: normalizeString(item.status, "unknown"),
      })),
      exportStatus: normalizeString(privacyRights.export?.status, "unknown"),
      deletionStatus: normalizeString(privacyRights.deletion?.status, "unknown"),
      retentionStatus: normalizeString(privacyRights.retention?.status, "unknown"),
      rightsRequestStatus: normalizeString(privacyRights.rightsRequest?.status, "not-requested"),
      blockedDeletionScopes: normalizeArray(privacyRights.deletion?.blockedScopes).map((item) => ({
        key: normalizeString(item.key, "unknown"),
        reason: normalizeString(item.reason, "retention-required"),
      })),
    },
    persistenceProvider: {
      taskId: normalizeString(supabasePersistenceDecision.taskId, ""),
      provider: normalizeString(supabasePersistenceDecision.provider, "Supabase"),
      decision: normalizeString(supabasePersistenceDecision.decision, "defer-for-first-release"),
      status: normalizeString(supabasePersistenceDecision.userFacing?.status, "לא מחובר עכשיו"),
      title: normalizeString(supabasePersistenceDecision.userFacing?.title, "ספק אחסון חיצוני"),
      summary: normalizeString(
        supabasePersistenceDecision.userFacing?.summary,
        "נקסוס שומרת כרגע את אמת הפרויקט בשרת המקומי ולא מחברת ספק חיצוני לפני מיפוי מלא.",
      ),
      nextStep: normalizeString(
        supabasePersistenceDecision.userFacing?.nextStep,
        "החיבור ייפתח רק אחרי שמיפוי הרשאות, קבצים, פרטיות ושחזור יהיה מוכן.",
      ),
      selectedPersistencePath: normalizeString(supabasePersistenceDecision.selectedPersistencePath, "project-service-workspace-store"),
      adoptionRequirementCount: normalizeArray(supabasePersistenceDecision.adoptionRequirements).length,
    },
  };
}
