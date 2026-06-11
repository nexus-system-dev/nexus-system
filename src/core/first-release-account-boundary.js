function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function nowIso() {
  return new Date().toISOString();
}

function buildAccountEvent({ userId, eventType, status = "completed", summary, actorUserId = null, metadata = null } = {}) {
  const timestamp = nowIso();
  return {
    accountActivityId: `account-activity:${userId ?? "unknown"}:${eventType ?? "event"}:${timestamp}`,
    userId: userId ?? null,
    actorUserId: actorUserId ?? userId ?? null,
    eventType: eventType ?? "account-event",
    status,
    summary: summary ?? "Account event recorded.",
    metadata: normalizeObject(metadata),
    occurredAt: timestamp,
  };
}

function appendAccountEvent(accountActivityHistory, event) {
  return [...normalizeArray(accountActivityHistory), event].slice(-100);
}

export function buildFirstReleaseAccountBoundary({
  authPayload = null,
  teamMembership = null,
  privacyState = null,
  billingState = null,
} = {}) {
  const auth = normalizeObject(authPayload);
  const userIdentity = normalizeObject(auth.userIdentity);
  const authenticationState = normalizeObject(auth.authenticationState);
  const sessionState = normalizeObject(auth.sessionState);
  const workspaceModel = normalizeObject(auth.workspaceModel);
  const securityDecision = normalizeObject(auth.sessionSecurityDecision);
  const ownerMfaDecision = normalizeObject(auth.ownerMfaDecision);
  const notificationPreferences = normalizeObject(auth.notificationPreferences);
  const workspaceSettings = normalizeObject(auth.workspaceSettings);

  return {
    accountBoundaryId: `account-boundary:${userIdentity.userId ?? "anonymous"}`,
    taskId: "ACCT-001",
    status: userIdentity.userId ? "ready" : "blocked",
    userIdentity: {
      userId: userIdentity.userId ?? null,
      displayName: userIdentity.displayName ?? null,
      email: userIdentity.email ?? null,
      verificationStatus: userIdentity.verificationStatus ?? "unknown",
      accountStatus: userIdentity.status ?? "unknown",
    },
    editableProfile: {
      displayName: userIdentity.displayName ?? null,
      email: userIdentity.email ?? null,
      emailChangeBoundary: "local-first-change-recorded-no-external-email-provider",
      passwordChangeBoundary: authenticationState.authMethod === "password"
        ? "local-password-update-supported"
        : "blocked-for-non-password-identity",
    },
    activeSession: {
      sessionId: sessionState.sessionId ?? null,
      status: sessionState.status ?? "unknown",
      issuedAt: sessionState.issuedAt ?? null,
      expiresAt: sessionState.expiresAt ?? null,
      logoutAllBoundary: "current-local-session-and-token-records-only",
    },
    accountSecurity: {
      authMethod: authenticationState.authMethod ?? "unknown",
      mfaDecision: ownerMfaDecision.decision ?? "unknown",
      trustLevel: securityDecision.status ?? (userIdentity.userId ? "known-user" : "anonymous"),
      availableActions: [
        "update-profile",
        authenticationState.authMethod === "password" ? "change-password" : null,
        "logout-all",
        "request-account-deletion",
      ].filter(Boolean),
    },
    accountActivityHistory: normalizeArray(auth.accountActivityHistory),
    linkedTruth: {
      privacy: {
        ownerTask: "PRIVACY-001",
        status: privacyState?.status ?? "linked-not-closed-here",
        availableRequests: ["export", "delete", "forget-me", "learning-opt-out"],
      },
      billing: {
        ownerTask: "BILLING-001",
        status: billingState?.status ?? "not-enabled-for-first-account-boundary",
      },
      team: {
        ownerTask: "EXP-009",
        workspaceId: workspaceModel.workspaceId ?? null,
        ownerUserId: workspaceModel.ownerUserId ?? null,
        role: teamMembership?.role ?? auth.membershipRecord?.roleAssignment?.role ?? auth.membershipRecord?.role ?? "owner",
        status: teamMembership?.status ?? auth.membershipRecord?.status ?? "active",
      },
      providerIdentity: {
        ownerTask: "PROV-001",
        status: "provider-actions-require-explicit-provider-gate",
      },
      externalIdentity: {
        ownerTask: "SSO-001",
        status: "not-closed-by-account-settings",
      },
    },
    userFacingBoundary: {
      summary: "Account settings are first-release local account controls, not full enterprise account management.",
      canClaimProductionAccount: false,
      hiddenInternalLabels: true,
    },
    workspaceSettings,
    notificationPreferences,
  };
}

export function applyFirstReleaseAccountAction({
  authPayload = null,
  actionType = null,
  payload = null,
  actorUserId = null,
} = {}) {
  const auth = normalizeObject(authPayload);
  const action = normalizeString(actionType, null);
  const input = normalizeObject(payload);
  const userIdentity = normalizeObject(auth.userIdentity);
  const userId = normalizeString(userIdentity.userId, null);
  const history = normalizeArray(auth.accountActivityHistory);

  if (!userId) {
    return {
      status: "blocked",
      authPayload: auth,
      accountEvent: buildAccountEvent({
        userId: null,
        actorUserId,
        eventType: action ?? "account-action",
        status: "blocked",
        summary: "Account action requires an identified user.",
      }),
    };
  }

  if (action === "update-profile") {
    const nextIdentity = {
      ...userIdentity,
      displayName: normalizeString(input.displayName, userIdentity.displayName ?? null),
      email: normalizeString(input.email, userIdentity.email ?? null),
      verificationStatus: normalizeString(input.email, userIdentity.email ?? null) !== userIdentity.email
        ? "pending-verification"
        : userIdentity.verificationStatus ?? "verified",
    };
    const accountEvent = buildAccountEvent({
      userId,
      actorUserId,
      eventType: "profile-updated",
      summary: "Profile details were updated for the account.",
      metadata: {
        emailChanged: nextIdentity.email !== userIdentity.email,
        displayNameChanged: nextIdentity.displayName !== userIdentity.displayName,
      },
    });
    return {
      status: "completed",
      authPayload: {
        ...auth,
        userIdentity: nextIdentity,
        accountActivityHistory: appendAccountEvent(history, accountEvent),
      },
      accountEvent,
    };
  }

  if (action === "change-password") {
    if (auth.authenticationState?.authMethod && auth.authenticationState.authMethod !== "password") {
      const accountEvent = buildAccountEvent({
        userId,
        actorUserId,
        eventType: "password-change-blocked",
        status: "blocked",
        summary: "Password change is blocked for this identity method.",
      });
      return {
        status: "blocked",
        authPayload: { ...auth, accountActivityHistory: appendAccountEvent(history, accountEvent) },
        accountEvent,
      };
    }

    const accountEvent = buildAccountEvent({
      userId,
      actorUserId,
      eventType: "password-changed",
      summary: "Password credential was replaced for the local account.",
    });
    return {
      status: "completed",
      authPayload: {
        ...auth,
        authenticationState: {
          ...normalizeObject(auth.authenticationState),
          authMethod: "password",
          passwordUpdatedAt: accountEvent.occurredAt,
        },
        credentialReference: `credential:${userId}:password:${accountEvent.occurredAt}`,
        accountActivityHistory: appendAccountEvent(history, accountEvent),
      },
      accountEvent,
    };
  }

  if (action === "logout-all") {
    const accountEvent = buildAccountEvent({
      userId,
      actorUserId,
      eventType: "sessions-revoked",
      summary: "Local account sessions were revoked.",
    });
    return {
      status: "completed",
      authPayload: {
        ...auth,
        sessionState: {
          ...normalizeObject(auth.sessionState),
          status: "revoked",
          isRevoked: true,
          revokedAt: accountEvent.occurredAt,
        },
        tokenBundle: {
          accessToken: null,
          refreshToken: null,
          tokenType: null,
          expiresAt: null,
        },
        accountActivityHistory: appendAccountEvent(history, accountEvent),
      },
      accountEvent,
    };
  }

  if (action === "request-account-deletion") {
    const accountEvent = buildAccountEvent({
      userId,
      actorUserId,
      eventType: "account-deletion-requested",
      status: "pending",
      summary: "Account deletion was requested and routed to privacy execution.",
      metadata: {
        privacyOwnerTask: "PRIVACY-001",
        deletionBoundary: "request-recorded-full-erasure-owned-by-privacy-task",
      },
    });
    return {
      status: "pending",
      authPayload: {
        ...auth,
        accountDeletionRequest: {
          status: "pending",
          requestedAt: accountEvent.occurredAt,
          ownerTask: "PRIVACY-001",
        },
        accountActivityHistory: appendAccountEvent(history, accountEvent),
      },
      accountEvent,
    };
  }

  const accountEvent = buildAccountEvent({
    userId,
    actorUserId,
    eventType: action ?? "unknown-account-action",
    status: "blocked",
    summary: "Unsupported account action was blocked.",
  });
  return {
    status: "blocked",
    authPayload: { ...auth, accountActivityHistory: appendAccountEvent(history, accountEvent) },
    accountEvent,
  };
}
