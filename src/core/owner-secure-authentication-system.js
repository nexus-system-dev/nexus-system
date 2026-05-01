function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveRoles(membershipRecord = null) {
  const roles = normalizeArray(membershipRecord?.roles).filter((role) => typeof role === "string" && role.trim());
  const primaryRole = normalizeString(membershipRecord?.role, null);
  return Array.from(new Set([primaryRole, ...roles].filter(Boolean)));
}

export function createOwnerSecureAuthenticationSystem({
  userIdentity = null,
  authenticationState = null,
  sessionSecurityDecision = null,
  membershipRecord = null,
  workspaceModel = null,
} = {}) {
  const roles = resolveRoles(membershipRecord);
  const isOwner = roles.includes("owner");
  const isAuthenticated = authenticationState?.isAuthenticated === true;
  const sessionBlocked = sessionSecurityDecision?.isBlocked === true;
  const sessionDecision = normalizeString(sessionSecurityDecision?.decision, "unknown");
  const hasMfa = authenticationState?.authMetadata?.hasMfa === true;
  const trustLevel = !isOwner
    ? "standard"
    : sessionBlocked
      ? "restricted"
      : isAuthenticated
        ? "elevated"
        : "identified";

  return {
    ownerAuthState: {
      ownerAuthStateId: `owner-auth:${userIdentity?.userId ?? "anonymous"}`,
      userId: userIdentity?.userId ?? null,
      workspaceId: workspaceModel?.workspaceId ?? null,
      role: roles[0] ?? "viewer",
      roles,
      isOwner,
      isAuthenticated,
      hasMfa,
      sessionDecision,
      trustLevel,
      elevatedTrustRequired: isOwner,
      privilegedModeEligible: isOwner && isAuthenticated && !sessionBlocked,
      summary: {
        requiresElevatedTrust: isOwner,
        sessionBlocked,
        ownerModeActive: isOwner && isAuthenticated,
      },
    },
  };
}
