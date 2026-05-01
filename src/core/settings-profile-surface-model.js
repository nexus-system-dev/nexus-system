function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createSettingsAndProfileSurfaceModel({
  authenticatedAppShell = null,
  navigationRouteSurface = null,
  userIdentity = null,
  workspaceSettings = null,
  notificationPreferences = null,
  billingSettingsModel = null,
  ownerMfaDecision = null,
} = {}) {
  const shell = normalizeObject(authenticatedAppShell);
  const navigation = normalizeObject(navigationRouteSurface);
  const user = normalizeObject(userIdentity);
  const settings = normalizeObject(workspaceSettings);
  const notifications = normalizeObject(notificationPreferences);
  const billing = normalizeObject(billingSettingsModel);
  const mfa = normalizeObject(ownerMfaDecision);

  return {
    settingsProfileSurface: {
      settingsProfileSurfaceId: `settings-profile:${user.userId ?? shell.workspaceContext?.projectId ?? "anonymous"}`,
      status: shell.status === "ready" ? "ready" : "blocked",
      routeKey: "settings",
      actorProfile: {
        userId: user.userId ?? null,
        displayName: user.displayName ?? null,
        email: user.email ?? null,
      },
      workspaceSettings: settings,
      notificationPreferences: notifications,
      billingSnapshot: {
        currentPlan: billing.currentPlan ?? null,
        availableActions: normalizeArray(billing.availableActions),
      },
      securitySettings: {
        mfaDecision: mfa.decision ?? "unknown",
        trustLevel: shell.actor?.userId ? "known-user" : "anonymous",
      },
      summary: {
        canEditProfile: shell.status === "ready",
        hasSettingsRoute: normalizeArray(navigation.routeBindings).some((route) => route.routeKey === "settings"),
      },
    },
  };
}
